using BillSplitter.Api.Contracts.Common;
using BillSplitter.Api.Middleware;
using BillSplitter.Infrastructure;
using BillSplitter.Infrastructure.DependencyInjection;
using BillSplitter.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT") ?? "5070";
builder.WebHost.UseUrls($"http://*:{port}");

var rawConnectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? "Host=localhost;Database=BillSplitter;Username=postgres;Password=postgres";

var connectionString = NormalizePostgresConnectionString(rawConnectionString);

if (!builder.Environment.IsEnvironment("Testing"))
{
    builder.Services.AddDbContext<BillSplitterDbContext>(options =>
        options.UseNpgsql(connectionString));
}

builder.Services.AddBillSplitterServices(connectionString);

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new MoneyStringJsonConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
// Universal JSON Error Handler (must be defined BEFORE routing/cors to be effective)
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var exceptionHandlerPathFeature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerPathFeature>();
        var exception = exceptionHandlerPathFeature?.Error;
        
        // Ensure CORS headers are present even on errors
        context.Response.Headers.AccessControlAllowOrigin = "*";
        context.Response.Headers.AccessControlAllowHeaders = "*";
        context.Response.Headers.AccessControlAllowMethods = "*";
        
        context.Response.ContentType = "application/json";
        
        if (exception is ArgumentException || exception is InvalidOperationException)
        {
            context.Response.StatusCode = 400;
            await context.Response.WriteAsJsonAsync(new { message = exception.Message });
        }
        else
        {
            context.Response.StatusCode = 500;
            await context.Response.WriteAsJsonAsync(new { 
                message = "Internal Server Error", 
                detail = exception?.Message,
                type = exception?.GetType().Name
            });
        }
    });
});

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Automatic Database Migrations on Startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<BillSplitterDbContext>();
    try 
    {
        // migrate database on startup
        await dbContext.Database.MigrateAsync();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Migration failed: {ex.Message}");
    }
}

app.UseRouting();

app.UseMiddleware<RequestLoggingMiddleware>();

// CORS must be the VERY FIRST thing after Routing to handle preflights/errors
app.UseCors();

app.UseSessionAccessResolver();

app.UseAuthorization();

app.MapControllers();

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

app.Run();

static string NormalizePostgresConnectionString(string raw)
{
    if (raw.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
        raw.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
    {
        var uri = new Uri(raw);

        var userInfoParts = uri.UserInfo.Split(':', 2);
        var username = userInfoParts.Length > 0 ? Uri.UnescapeDataString(userInfoParts[0]) : string.Empty;
        var password = userInfoParts.Length > 1 ? Uri.UnescapeDataString(userInfoParts[1]) : string.Empty;

        var database = uri.AbsolutePath.Trim('/');
        var host = uri.Host;
        var port = uri.IsDefaultPort ? 5432 : uri.Port;

        var query = ParseQueryString(uri.Query);

        var parts = new List<string>
        {
            $"Host={host}",
            $"Port={port}"
        };

        if (!string.IsNullOrWhiteSpace(database))
            parts.Add($"Database={database}");
        if (!string.IsNullOrWhiteSpace(username))
            parts.Add($"Username={username}");
        if (!string.IsNullOrWhiteSpace(password))
            parts.Add($"Password={password}");

        if (query.TryGetValue("sslmode", out var sslMode) && !string.IsNullOrWhiteSpace(sslMode))
            parts.Add($"Ssl Mode={ToNpgsqlEnumValue(sslMode)}");

        if (query.TryGetValue("channel_binding", out var channelBinding) && !string.IsNullOrWhiteSpace(channelBinding))
            parts.Add($"Channel Binding={ToNpgsqlEnumValue(channelBinding)}");

        return string.Join(';', parts) + ";";
    }

    return raw;
}

static Dictionary<string, string> ParseQueryString(string query)
{
    var result = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
    if (string.IsNullOrWhiteSpace(query))
        return result;

    var trimmed = query.StartsWith('?') ? query[1..] : query;
    foreach (var segment in trimmed.Split('&', StringSplitOptions.RemoveEmptyEntries))
    {
        var kv = segment.Split('=', 2);
        var key = Uri.UnescapeDataString(kv[0]);
        var value = kv.Length > 1 ? Uri.UnescapeDataString(kv[1]) : string.Empty;
        if (!string.IsNullOrWhiteSpace(key))
            result[key] = value;
    }

    return result;
}

static string ToNpgsqlEnumValue(string value)
{
    // Neon commonly provides lowercase enum values in URL query params.
    return value.Trim().ToLowerInvariant() switch
    {
        "require" => "Require",
        "disable" => "Disable",
        "prefer" => "Prefer",
        "allow" => "Allow",
        _ => value
    };
}

public partial class Program { }
