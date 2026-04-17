using BillSplitter.Application.Interfaces;
using BillSplitter.Domain.Services;

namespace BillSplitter.Application.Services.Sessions;

public class CalculateSessionService
{
    private readonly ISessionRepository _repository;
    private readonly Domain.Services.SessionCalculationService _calculationService;
    private readonly SettlementCalculator _settlementCalculator;

    public CalculateSessionService(
        ISessionRepository repository,
        Domain.Services.SessionCalculationService calculationService,
        SettlementCalculator settlementCalculator)
    {
        _repository = repository;
        _calculationService = calculationService;
        _settlementCalculator = settlementCalculator;
    }

    public async Task<CalculateResult> CalculateAsync(Guid sessionId, CancellationToken ct = default)
    {
        var session = await _repository.GetByIdAsync(sessionId, ct)
            ?? throw new InvalidOperationException("Session not found");

        if (session.Status != Domain.Entities.SessionStatus.Draft)
            throw new InvalidOperationException("Session must be in Draft status to calculate");

        _calculationService.Calculate(session);
        var settlements = _settlementCalculator.CalculateSettlements(session);

        await _repository.UpdateAsync(session, ct);

        return new CalculateResult
        {
            Status = session.Status.ToString(),
            ParticipantResults = session.Participants.Select(p => new ParticipantResult
            {
                ParticipantId = p.Id,
                DisplayName = p.DisplayName,
                Subtotal = p.CalculatedSubtotal.ToDisplayString(),
                AllocatedCharges = p.AllocatedCharges.ToDisplayString(),
                FinalAmount = p.FinalAmount.ToDisplayString(),
                Balance = p.Balance.ToDisplayString()
            }).ToList(),
            Settlements = settlements.Select(s => new SettlementResult
            {
                Sequence = s.Sequence,
                FromParticipantId = s.FromParticipantId,
                ToParticipantId = s.ToParticipantId,
                Amount = s.Amount.ToDisplayString()
            }).ToList()
        };
    }
}

public class CalculateResult
{
    public string Status { get; set; } = string.Empty;
    public List<ParticipantResult> ParticipantResults { get; set; } = new();
    public List<SettlementResult> Settlements { get; set; } = new();
}

public class ParticipantResult
{
    public Guid ParticipantId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string Subtotal { get; set; } = string.Empty;
    public string AllocatedCharges { get; set; } = string.Empty;
    public string FinalAmount { get; set; } = string.Empty;
    public string Balance { get; set; } = string.Empty;
}

public class SettlementResult
{
    public int Sequence { get; set; }
    public Guid FromParticipantId { get; set; }
    public Guid ToParticipantId { get; set; }
    public string Amount { get; set; } = string.Empty;
}