using BillSplitter.Application.Interfaces;
using BillSplitter.Application.Services.Sessions;
using BillSplitter.Api.Contracts.Sessions;
using Microsoft.AspNetCore.Mvc;

namespace BillSplitter.Api.Controllers;

[ApiController]
[Route("api/sessions")]
public class PaymentsController : ControllerBase
{
    private readonly ReplacePaymentsService _replacePaymentsService;
    private readonly ISessionTokenService _tokenService;

    public PaymentsController(ReplacePaymentsService replacePaymentsService, ISessionTokenService tokenService)
    {
        _replacePaymentsService = replacePaymentsService;
        _tokenService = tokenService;
    }

    [HttpPut("{sessionId:guid}/payments")]
    public async Task<IActionResult> ReplacePayments(
        Guid sessionId,
        [FromBody] Application.Services.Sessions.ReplacePaymentsRequest request,
        [FromHeader(Name = "Organizer-Token")] string? organizerToken,
        CancellationToken ct)
    {
        if (!ValidateOrganizer(sessionId, organizerToken))
            return Unauthorized();

        await _replacePaymentsService.ReplaceAsync(sessionId, request, ct);
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