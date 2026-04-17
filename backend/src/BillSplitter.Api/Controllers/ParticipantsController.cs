using BillSplitter.Application.Interfaces;
using BillSplitter.Application.Services.Sessions;
using BillSplitter.Api.Contracts.Sessions;
using BillSplitter.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace BillSplitter.Api.Controllers;

[ApiController]
[Route("api/sessions/{sessionId}/participants")]
public class ParticipantsController : ControllerBase
{
    private readonly UpsertParticipantService _participantService;
    private readonly ISessionRepository _repository;
    private readonly ISessionTokenService _tokenService;

    public ParticipantsController(
        UpsertParticipantService participantService,
        ISessionRepository repository,
        ISessionTokenService tokenService)
    {
        _participantService = participantService;
        _repository = repository;
        _tokenService = tokenService;
    }

    [HttpPost]
    public async Task<ActionResult<ParticipantResponse>> Create(Guid sessionId, [FromBody] CreateParticipantRequest request, [FromHeader(Name = "Organizer-Token")] string? organizerToken, CancellationToken ct)
    {
        if (!ValidateOrganizer(sessionId, organizerToken))
            return Unauthorized();

        var participant = await _participantService.UpsertAsync(sessionId, new UpsertParticipantRequest
        {
            DisplayName = request.DisplayName
        }, ct);

        return Ok(new ParticipantResponse
        {
            ParticipantId = participant.Id,
            DisplayName = participant.DisplayName,
            PaidAmount = participant.PaidAmount.ToDisplayString()
        });
    }

    [HttpPut("{participantId:guid}")]
    public async Task<ActionResult<ParticipantResponse>> Update(Guid sessionId, Guid participantId, [FromBody] UpdateParticipantRequest request, [FromHeader(Name = "Organizer-Token")] string? organizerToken, CancellationToken ct)
    {
        if (!ValidateOrganizer(sessionId, organizerToken))
            return Unauthorized();

        var participant = await _participantService.UpsertAsync(sessionId, new UpsertParticipantRequest
        {
            ParticipantId = participantId,
            DisplayName = request.DisplayName
        }, ct);

        return Ok(new ParticipantResponse
        {
            ParticipantId = participant.Id,
            DisplayName = participant.DisplayName,
            PaidAmount = participant.PaidAmount.ToDisplayString()
        });
    }

    [HttpDelete("{participantId:guid}")]
    public async Task<ActionResult> Delete(Guid sessionId, Guid participantId, [FromHeader(Name = "Organizer-Token")] string? organizerToken, CancellationToken ct)
    {
        if (!ValidateOrganizer(sessionId, organizerToken))
            return Unauthorized();

        await _participantService.DeleteAsync(sessionId, participantId, ct);
        return NoContent();
    }

    private bool ValidateOrganizer(Guid sessionId, string? token)
    {
        if (string.IsNullOrEmpty(token))
            return false;
        var (isValid, isOrganizer) = _tokenService.ValidateToken(token, sessionId);
        return isValid && isOrganizer;
    }
}