using BillSplitter.Application.Interfaces;
using BillSplitter.Application.Services.Sessions;
using BillSplitter.Api.Contracts.Sessions;
using BillSplitter.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace BillSplitter.Api.Controllers;

[ApiController]
[Route("api/sessions")]
public class SessionsController : ControllerBase
{
    private readonly CreateSessionService _createService;
    private readonly ISessionRepository _repository;
    private readonly CalculateSessionService _calculateService;
    private readonly ISessionTokenService _tokenService;

    public SessionsController(
        CreateSessionService createService,
        ISessionRepository repository,
        CalculateSessionService calculateService,
        ISessionTokenService tokenService)
    {
        _createService = createService;
        _repository = repository;
        _calculateService = calculateService;
        _tokenService = tokenService;
    }

    [HttpPost]
    public async Task<ActionResult<CreateSessionResponse>> Create([FromBody] CreateSessionRequest request, CancellationToken ct)
    {
        var result = await _createService.CreateAsync(request.Name, ct);
        
        return Ok(new CreateSessionResponse
        {
            SessionId = result.SessionId,
            Name = result.Name,
            Currency = result.Currency,
            Status = result.Status,
            OrganizerToken = result.OrganizerToken,
            ViewerToken = result.ViewerToken,
            OrganizerLink = $"{Request.Scheme}://{Request.Host}/sessions/{result.SessionId}?token={result.OrganizerToken}",
            ViewerLink = $"{Request.Scheme}://{Request.Host}/sessions/{result.SessionId}?token={result.ViewerToken}",
            CreatedAtUtc = result.CreatedAtUtc
        });
    }

    [HttpGet("{sessionId:guid}")]
    public async Task<ActionResult<SessionResponse>> Get(Guid sessionId, [FromQuery] string? viewerToken, CancellationToken ct)
    {
        var session = await _repository.GetByIdAsync(sessionId, ct);
        if (session == null)
            return NotFound();

        return Ok(MapToResponse(session));
    }

    [HttpPatch("{sessionId:guid}")]
    public async Task<ActionResult<SessionResponse>> Update(Guid sessionId, [FromBody] UpdateSessionRequest request, [FromHeader(Name = "Organizer-Token")] string? organizerToken, CancellationToken ct)
    {
        if (!ValidateOrganizer(sessionId, organizerToken))
            return Unauthorized();

        var session = await _repository.GetByIdAsync(sessionId, ct);
        if (session == null)
            return NotFound();

        if (!string.IsNullOrWhiteSpace(request.Name))
            session.SetName(request.Name);

        await _repository.UpdateAsync(session, ct);
        return Ok(MapToResponse(session));
    }

    [HttpPost("{sessionId:guid}/calculate")]
    public async Task<ActionResult<CalculateResponse>> Calculate(Guid sessionId, [FromHeader(Name = "Organizer-Token")] string? organizerToken, CancellationToken ct)
    {
        if (!ValidateOrganizer(sessionId, organizerToken))
            return Unauthorized();

        var result = await _calculateService.CalculateAsync(sessionId, ct);
        var session = (await _repository.GetByIdAsync(sessionId, ct))!;

        return Ok(new CalculateResponse
        {
            Status = result.Status,
            Participants = result.ParticipantResults.Select(p => new ParticipantResponse
            {
                ParticipantId = p.ParticipantId,
                DisplayName = p.DisplayName,
                Subtotal = p.Subtotal,
                AllocatedCharges = p.AllocatedCharges,
                FinalAmount = p.FinalAmount,
                Balance = p.Balance
            }).ToList(),
            Settlements = result.Settlements.Select(s => new SettlementTransactionResponse
            {
                Sequence = s.Sequence,
                FromParticipantId = s.FromParticipantId,
                ToParticipantId = s.ToParticipantId,
                Amount = s.Amount
            }).ToList()
        });
    }

    private bool ValidateOrganizer(Guid sessionId, string? token)
    {
        if (string.IsNullOrEmpty(token))
            return false;
        var (isValid, isOrganizer) = _tokenService.ValidateToken(token, sessionId);
        return isValid && isOrganizer;
    }

    private static SessionResponse MapToResponse(BillSplitter.Domain.Entities.Session session)
    {
        return new SessionResponse
        {
            SessionId = session.Id,
            Name = session.Name,
            Currency = session.Currency,
            Status = session.Status.ToString(),
            ViewerToken = session.ViewerTokenHash,
            Participants = session.Participants.Select(p => new ParticipantResponse
            {
                ParticipantId = p.Id,
                DisplayName = p.DisplayName,
                PaidAmount = p.PaidAmount.ToDisplayString(),
                Subtotal = p.CalculatedSubtotal.ToDisplayString(),
                AllocatedCharges = p.AllocatedCharges.ToDisplayString(),
                FinalAmount = p.FinalAmount.ToDisplayString(),
                Balance = p.Balance.ToDisplayString()
            }).ToList(),
            Items = session.Items.Select(i => new BillItemResponse
            {
                ItemId = i.Id,
                Name = i.Name,
                Amount = i.Amount.ToDisplayString(),
                Assignments = i.Assignments.Select(a => new AssignmentResponse
                {
                    ParticipantId = a.ParticipantId,
                    RatioNumerator = a.RatioNumerator,
                    RatioDenominator = a.RatioDenominator
                }).ToList()
            }).ToList(),
            Charges = session.Charges.Select(c => new ChargeResponse
            {
                ChargeId = c.Id,
                Type = c.Type == ChargeType.Both ? "tax + service" : c.Type.ToString().ToLower(),
                Amount = c.Amount.ToDisplayString()
            }).ToList(),
            CreatedAtUtc = session.CreatedAtUtc,
            UpdatedAtUtc = session.UpdatedAtUtc
        };
    }
}