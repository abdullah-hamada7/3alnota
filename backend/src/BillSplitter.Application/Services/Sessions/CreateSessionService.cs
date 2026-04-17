using BillSplitter.Application.Interfaces;
using BillSplitter.Domain.Entities;
using BillSplitter.Domain.ValueObjects;

namespace BillSplitter.Application.Services.Sessions;

public class CreateSessionService
{
    private readonly ISessionRepository _repository;
    private readonly ISessionTokenService _tokenService;

    public CreateSessionService(ISessionRepository repository, ISessionTokenService tokenService)
    {
        _repository = repository;
        _tokenService = tokenService;
    }

    public async Task<CreateSessionResult> CreateAsync(string? name, CancellationToken ct = default)
    {
        var sessionId = Guid.NewGuid();
        var viewerToken = _tokenService.GenerateViewerToken(sessionId);
        var organizerToken = _tokenService.GenerateOrganizerToken(sessionId);

        var session = Session.Create(sessionId, name, viewerToken, organizerToken);
        await _repository.CreateAsync(session, ct);

        return new CreateSessionResult
        {
            SessionId = sessionId,
            Name = name,
            Currency = "EGP",
            Status = "Draft",
            OrganizerToken = organizerToken,
            ViewerToken = viewerToken,
            OrganizerLink = $"/sessions/{sessionId}?token={organizerToken}",
            ViewerLink = $"/sessions/{sessionId}?token={viewerToken}",
            CreatedAtUtc = session.CreatedAtUtc
        };
    }
}

public class CreateSessionResult
{
    public Guid SessionId { get; set; }
    public string? Name { get; set; }
    public string Currency { get; set; } = "EGP";
    public string Status { get; set; } = "Draft";
    public string OrganizerToken { get; set; } = string.Empty;
    public string ViewerToken { get; set; } = string.Empty;
    public string OrganizerLink { get; set; } = string.Empty;
    public string ViewerLink { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
}