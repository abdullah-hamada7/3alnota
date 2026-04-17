using BillSplitter.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace BillSplitter.Api.Middleware;

public class SessionAccessResolver
{
    private readonly RequestDelegate _next;

    public SessionAccessResolver(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value;
        
        if (path?.StartsWith("/api/sessions/") == true)
        {
            var sessionId = ExtractSessionId(path);
            var organizerToken = context.Request.Headers["Organizer-Token"].FirstOrDefault();
            var viewerToken = context.Request.Query["viewerToken"].FirstOrDefault();

            if (!string.IsNullOrEmpty(sessionId))
            {
                var tokenService = context.RequestServices.GetService<ISessionTokenService>();
                if (tokenService == null)
                {
                    await _next(context);
                    return;
                }

                var isOrganizer = false;
                var isViewer = false;

                if (Guid.TryParse(sessionId, out var sessionGuid))
                {
                    if (!string.IsNullOrEmpty(organizerToken))
                    {
                        var (valid, org) = tokenService.ValidateToken(organizerToken, sessionGuid);
                        isOrganizer = valid && org;
                    }
                    else if (!string.IsNullOrEmpty(viewerToken))
                    {
                        var (valid, org) = tokenService.ValidateToken(viewerToken, sessionGuid);
                        isViewer = valid && !org;
                    }
                }

                context.Items["SessionId"] = sessionId;
                context.Items["IsOrganizer"] = isOrganizer;
                context.Items["IsViewer"] = isViewer;
            }
        }

        await _next(context);
    }

    private static string? ExtractSessionId(string path)
    {
        var segments = path.Split('/');
        return segments.Length > 3 ? segments[3] : null;
    }
}

public static class SessionAccessResolverExtensions
{
    public static IApplicationBuilder UseSessionAccessResolver(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<SessionAccessResolver>();
    }
}