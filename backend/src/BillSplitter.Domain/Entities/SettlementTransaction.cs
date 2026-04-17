using BillSplitter.Domain.ValueObjects;

namespace BillSplitter.Domain.Entities;

public sealed class SettlementTransaction
{
    public Guid Id { get; private set; }
    public Guid SessionId { get; private set; }
    public Guid FromParticipantId { get; private set; }
    public Guid ToParticipantId { get; private set; }
    public Money Amount { get; private set; }
    public int Sequence { get; private set; }

    private SettlementTransaction() { }

    public SettlementTransaction(
        Guid sessionId,
        Guid fromParticipantId,
        Guid toParticipantId,
        Money amount,
        int sequence)
    {
        if (amount.Amount <= 0)
            throw new ArgumentException("Settlement amount must be positive", nameof(amount));

        Id = Guid.NewGuid();
        SessionId = sessionId;
        FromParticipantId = fromParticipantId;
        ToParticipantId = toParticipantId;
        Amount = amount;
        Sequence = sequence;
    }

    internal static SettlementTransaction Create(
        Guid sessionId,
        Guid fromParticipantId,
        Guid toParticipantId,
        Money amount,
        int sequence)
    {
        return new SettlementTransaction(sessionId, fromParticipantId, toParticipantId, amount, sequence);
    }
}