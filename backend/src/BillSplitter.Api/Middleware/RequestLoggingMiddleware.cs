using System.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace BillSplitter.Api.Middleware;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var sw = Stopwatch.StartNew();
        var method = context.Request.Method;
        var path = context.Request.Path;

        try
        {
            await _next(context);
            sw.Stop();

            var statusCode = context.Response.StatusCode;
            _logger.LogInformation("HTTP {Method} {Path} responded {StatusCode} in {Elapsed}ms", 
                method, path, statusCode, sw.ElapsedMilliseconds);
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(ex, "CRITICAL ERROR: HTTP {Method} {Path} failed after {Elapsed}ms. Error: {Message}", 
                method, path, sw.ElapsedMilliseconds, ex.Message);
            
            // Log inner exception if present
            if (ex.InnerException != null)
            {
                _logger.LogError("Inner Exception: {Message}", ex.InnerException.Message);
            }
            
            throw;
        }
    }
}
