using Microsoft.AspNetCore.Mvc;
using BillSplitter.Application.Interfaces;
using BillSplitter.Application.Services.Sessions;
using BillSplitter.Domain.Services;

namespace BillSplitter.Api.Controllers;

[ApiController]
public class ExportsController : ControllerBase
{
    private readonly ISessionRepository _repository;
    private readonly ISessionTokenService _tokenService;
    private readonly SettlementCalculator _settlementCalculator;

    public ExportsController(
        ISessionRepository repository, 
        ISessionTokenService tokenService,
        SettlementCalculator settlementCalculator)
    {
        _repository = repository;
        _tokenService = tokenService;
        _settlementCalculator = settlementCalculator;
    }

    private static SessionSummary MapToSessionSummary(Domain.Entities.Session session, SettlementCalculator settlementCalculator)
    {
        var numParticipants = session.Participants.Count > 0 ? session.Participants.Count : 1;

        var subtotal = session.Items.Sum(i => i.Amount.Amount);
        var totalCharges = session.Charges.Sum(c => c.Amount.Amount);
        var grandTotal = subtotal + totalCharges;

        return new SessionSummary
        {
            SessionName = session.Name ?? "فاتورة المطعم",
            SessionId = session.Id.ToString(),
            Participants = session.Participants.Select(p => new ParticipantSummary
            {
                DisplayName = p.DisplayName,
                PaidAmount = p.PaidAmount.Amount,
                FinalAmount = p.FinalAmount.Amount,
                Balance = p.Balance.Amount
            }).ToList(),
            Items = session.Items.Select(i => new ItemSummary
            {
                Name = i.Name,
                Amount = i.Amount.Amount,
                AssignedTo = string.Join(", ", i.Assignments.Select(a => 
                    session.Participants.FirstOrDefault(p => p.Id == a.ParticipantId)?.DisplayName ?? ""))
            }).ToList(),
            Charges = session.Charges.Select(c => new ChargeSummary
            {
                Type = c.Type.ToString(),
                Amount = c.Amount.Amount
            }).ToList(),
            Subtotal = subtotal,
            TotalCharges = totalCharges,
            GrandTotal = grandTotal,
            Settlements = settlementCalculator.CalculateSettlements(session).Select(s => new SettlementSummary
            {
                FromParticipant = session.Participants.FirstOrDefault(p => p.Id == s.FromParticipantId)?.DisplayName ?? "N/A",
                ToParticipant = session.Participants.FirstOrDefault(p => p.Id == s.ToParticipantId)?.DisplayName ?? "N/A",
                Amount = s.Amount.Amount
            }).ToList()
        };
    }
}