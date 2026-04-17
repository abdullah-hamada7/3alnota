using System.Security.Cryptography;
using System.Text;
using BillSplitter.Application.Interfaces;

namespace BillSplitter.Infrastructure.Security;

public class SessionTokenService : ISessionTokenService
{
    private const string OrganizerPrefix = "org_";
    private const string ViewerPrefix = "view_";
    private const int TokenLength = 32;

    public string GenerateOrganizerToken(Guid sessionId)
    {
        return $"{OrganizerPrefix}{sessionId:N}{GenerateSecureToken()}";
    }

    public string GenerateViewerToken(Guid sessionId)
    {
        return $"{ViewerPrefix}{sessionId:N}{GenerateSecureToken()}";
    }

    public (bool isValid, bool isOrganizer) ValidateToken(string token, Guid sessionId)
    {
        if (string.IsNullOrEmpty(token) || token.Length < 48)
            return (false, false);

        bool isOrganizer = token.StartsWith(OrganizerPrefix);
        bool isViewer = token.StartsWith(ViewerPrefix);

        if (!isOrganizer && !isViewer)
            return (false, false);

        var expectedPrefix = isOrganizer ? OrganizerPrefix : ViewerPrefix;
        var prefixWithSessionId = $"{expectedPrefix}{sessionId:N}";

        return token.StartsWith(prefixWithSessionId) ? (true, isOrganizer) : (false, false);
    }

    private static string GenerateSecureToken()
    {
        var bytes = new byte[TokenLength];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes)[..TokenLength];
    }
}