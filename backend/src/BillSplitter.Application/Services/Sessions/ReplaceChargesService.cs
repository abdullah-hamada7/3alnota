using BillSplitter.Application.Interfaces;
using BillSplitter.Domain.Entities;
using BillSplitter.Domain.ValueObjects;

namespace BillSplitter.Application.Services.Sessions;

public class ReplaceChargesService
{
    private readonly ISessionRepository _repository;

    public ReplaceChargesService(ISessionRepository repository)
    {
        _repository = repository;
    }

    public async Task ReplaceAsync(Guid sessionId, ReplaceChargesRequest request, CancellationToken ct = default)
    {
        var session = await _repository.GetByIdAsync(sessionId, ct)
            ?? throw new InvalidOperationException("Session not found");

        var incomingTypes = request.Charges.Select(c => c.Type.ToLower()).ToHashSet();

        // Remove charges that are not in the incoming request
        var toRemove = session.Charges.Where(c => !incomingTypes.Contains(c.Type.ToString().ToLower())).ToList();
        foreach (var charge in toRemove)
        {
            session.RemoveCharge(charge);
        }

        // Update or add charges
        foreach (var reqCharge in request.Charges)
        {
            var rawType = reqCharge.Type.ToLower();
            ChargeType chargeType;
            
            if (rawType == "tax + service" || rawType == "both")
            {
                chargeType = ChargeType.Both;
            }
            else if (rawType == "tax")
            {
                chargeType = ChargeType.Tax;
            }
            else if (rawType == "service")
            {
                chargeType = ChargeType.Service;
            }
            else
            {
                throw new ArgumentException($"Invalid charge type: {reqCharge.Type}. Must be 'tax', 'service', or 'tax + service'");
            }
            var amount = Money.FromString(reqCharge.Amount);
            if (amount.IsNegative)
                throw new ArgumentException("Charge amount cannot be negative");

            var existing = session.Charges.FirstOrDefault(c => c.Type == chargeType);
            if (existing != null)
            {
                existing.SetAmount(amount);
            }
            else
            {
                session.AddCharge(SessionCharge.Create(chargeType, amount));
            }
        }

        await _repository.UpdateAsync(session, ct);
    }
}

public class ReplaceChargesRequest
{
    public List<ChargeRequest> Charges { get; set; } = new();
}

public class ChargeRequest
{
    public string Type { get; set; } = string.Empty;
    public string Amount { get; set; } = "0.00";
}