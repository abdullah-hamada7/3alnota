using BillSplitter.Domain.ValueObjects;

namespace BillSplitter.Domain.Entities;

public class SessionCharge
{
    public Guid Id { get; private set; }
    public Guid SessionId { get; private set; }
    public ChargeType Type { get; private set; }
    public required Money Amount { get; private set; }

    private Session? _session;

    private SessionCharge() { }

    public static SessionCharge Create(ChargeType type, Money amount)
    {
        if (amount.IsNegative)
            throw new ArgumentException("Charge amount cannot be negative");

        return new SessionCharge
        {
            Id = Guid.NewGuid(),
            Type = type,
            Amount = amount
        };
    }

    public void SetSession(Session session)
    {
        _session = session;
        SessionId = session.Id;
    }

    public void SetAmount(Money amount)
    {
        if (amount.IsNegative)
            throw new ArgumentException("Charge amount cannot be negative");
        Amount = amount;
    }
}