using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using BillSplitter.Application.Interfaces;
using BillSplitter.Application.Services.Sessions;
using BillSplitter.Api.Contracts.Sessions;

namespace BillSplitter.Api.Controllers;

[ApiController]
[Route("api/sessions/{sessionId}/charges")]
public class ChargesController : ControllerBase
{
    private readonly ReplaceChargesService _chargesService;
    private readonly ISessionTokenService _tokenService;

    public ChargesController(ReplaceChargesService chargesService, ISessionTokenService tokenService)
    {
        _chargesService = chargesService;
        _tokenService = tokenService;
    }

    [HttpPut]
    public async Task<ActionResult> Replace(
        Guid sessionId,
        [FromBody] Contracts.Sessions.ReplaceChargesRequest request,
        [FromHeader(Name = "Organizer-Token")] string? organizerToken,
        CancellationToken ct)
    {
        if (!ValidateOrganizer(sessionId, organizerToken))
            return Unauthorized();

        var req = new Application.Services.Sessions.ReplaceChargesRequest
        {
            Charges = request.Charges.Select(c => new Application.Services.Sessions.ChargeRequest
            {
                Type = c.Type,
                Amount = c.Amount
            }).ToList()
        };

        await _chargesService.ReplaceAsync(sessionId, req, ct);
        return NoContent();
    }

    private bool ValidateOrganizer(Guid sessionId, string? token)
    {
        if (string.IsNullOrEmpty(token)) return false;
        var (isValid, isOrganizer) = _tokenService.ValidateToken(token, sessionId);
        return isValid && isOrganizer;
    }
}