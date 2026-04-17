using BillSplitter.Api.Contracts.Common;
using BillSplitter.Api.Middleware;
using BillSplitter.Infrastructure;
using BillSplitter.Infrastructure.DependencyInjection;
using BillSplitter.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT") ?? "5070";
builder.WebHost.UseUrls($"http://*:{port}");

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Host=localhost;Database=BillSplitter;Username=postgres;Password=postgres";

if (!builder.Environment.IsEnvironment("Testing"))
{
    builder.Services.AddDbContext<BillSplitterDbContext>(options =>
        options.UseNpgsql(connectionString));
}

builder.Services.AddBillSplitterServices(connectionString);

var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() 
    ?? new[] { "http://localhost:3000" };

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .SetIsOriginAllowedToAllowWildcardSubdomains()
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
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    // Replaced UseDeveloperExceptionPage with JSON-friendly handler
    app.UseExceptionHandler(errorApp =>
    {
        errorApp.Run(async context =>
        {
            var exceptionHandlerPathFeature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerPathFeature>();
            var exception = exceptionHandlerPathFeature?.Error;
            
            context.Response.ContentType = "application/json";
            
            if (exception is ArgumentException || exception is InvalidOperationException)
            {
                context.Response.StatusCode = 400;
                await context.Response.WriteAsJsonAsync(new { message = exception.Message });
            }
            else
            {
                context.Response.StatusCode = 500;
                await context.Response.WriteAsJsonAsync(new { message = exception?.Message ?? "An unexpected error occurred internal to the server." });
            }
        });
    });

    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<BillSplitterDbContext>();
        await dbContext.Database.EnsureCreatedAsync();
    }
}

app.UseRouting();

app.UseMiddleware<RequestLoggingMiddleware>();

// CORS must be between UseRouting and UseAuthorization
app.UseCors();

app.UseSessionAccessResolver();

app.UseAuthorization();

app.MapControllers();

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

app.Run();

public partial class Program { }