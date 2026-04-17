namespace BillSplitter.Application.Interfaces;

public interface ISessionTokenService
{
    string GenerateOrganizerToken(Guid sessionId);
    string GenerateViewerToken(Guid sessionId);
    (bool isValid, bool isOrganizer) ValidateToken(string token, Guid sessionId);
}