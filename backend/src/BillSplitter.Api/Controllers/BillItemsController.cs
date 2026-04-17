using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using BillSplitter.Application.Interfaces;
using BillSplitter.Api.Contracts.Sessions;

namespace BillSplitter.Api.Controllers;

[ApiController]
[Route("api/sessions/{sessionId}/items")]
public class BillItemsController : ControllerBase
{
    private readonly Application.Services.Sessions.UpsertBillItemService _itemService;
    private readonly ISessionTokenService _tokenService;

    public BillItemsController(
        Application.Services.Sessions.UpsertBillItemService itemService,
        ISessionTokenService tokenService)
    {
        _itemService = itemService;
        _tokenService = tokenService;
    }

    [HttpPost]
    public async Task<ActionResult<BillItemResponse>> Create(
        Guid sessionId,
        [FromBody] CreateBillItemRequest request,
        [FromHeader(Name = "Organizer-Token")] string? organizerToken,
        CancellationToken ct)
    {
        if (!ValidateOrganizer(sessionId, organizerToken))
            return Unauthorized();

        var serviceReq = new Application.Services.Sessions.UpsertBillItemRequest
        {
            Name = request.Name,
            Amount = request.Amount,
            Assignments = request.Assignments.Select(a => 
                new Application.Services.Sessions.AssignmentRequest
                {
                    ParticipantId = a.ParticipantId,
                    RatioNumerator = a.RatioNumerator,
                    RatioDenominator = a.RatioDenominator,
                    SortOrder = 0
                }).ToList()
        };

        var item = await _itemService.UpsertAsync(sessionId, serviceReq, ct);

        return Ok(new BillItemResponse
        {
            ItemId = item.Id,
            Name = item.Name,
            Amount = item.Amount.ToDisplayString()
        });
    }

    [HttpDelete("{itemId:guid}")]
    public async Task<ActionResult> Delete(
        Guid sessionId,
        Guid itemId,
        [FromHeader(Name = "Organizer-Token")] string? organizerToken,
        CancellationToken ct)
    {
        if (!ValidateOrganizer(sessionId, organizerToken))
            return Unauthorized();

        await _itemService.DeleteAsync(sessionId, itemId, ct);
        return NoContent();
    }

    private bool ValidateOrganizer(Guid sessionId, string? token)
    {
        if (string.IsNullOrEmpty(token)) return false;
        var (isValid, isOrganizer) = _tokenService.ValidateToken(token, sessionId);
        return isValid && isOrganizer;
    }
}