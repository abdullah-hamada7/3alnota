using BillSplitter.Application.Interfaces;
using BillSplitter.Domain.Entities;
using BillSplitter.Domain.ValueObjects;

namespace BillSplitter.Application.Services.Sessions;

public class ReplacePaymentsService
{
    private readonly ISessionRepository _repository;

    public ReplacePaymentsService(ISessionRepository repository)
    {
        _repository = repository;
    }

    public async Task ReplaceAsync(Guid sessionId, ReplacePaymentsRequest request, CancellationToken ct = default)
    {
        var session = await _repository.GetByIdAsync(sessionId, ct)
            ?? throw new InvalidOperationException("Session not found");

        foreach (var payment in request.Payments)
        {
            var participant = session.Participants
                .FirstOrDefault(p => p.Id == payment.ParticipantId)
                ?? throw new InvalidOperationException($"Participant not found: {payment.ParticipantId}");

            var money = Money.FromString(payment.PaidAmount);
            participant.SetPaidAmount(money);
        }

        await _repository.UpdateAsync(session, ct);
    }
}

public class ReplacePaymentsRequest
{
    public List<PaymentUpdate> Payments { get; set; } = new();
}

public class PaymentUpdate
{
    public Guid ParticipantId { get; set; }
    public string PaidAmount { get; set; } = string.Empty;
}