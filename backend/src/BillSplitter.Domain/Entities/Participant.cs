using BillSplitter.Domain.ValueObjects;

namespace BillSplitter.Domain.Entities;

public class Participant
{
    public Guid Id { get; private set; }
    public Guid SessionId { get; private set; }
    public string DisplayName { get; private set; } = string.Empty;
    public int SortOrder { get; private set; }
    public Money PaidAmount { get; private set; } = Money.Zero();
    public Money CalculatedSubtotal { get; private set; } = Money.Zero();
    public Money AllocatedCharges { get; private set; } = Money.Zero();
    public Money FinalAmount { get; private set; } = Money.Zero();
    public Money Balance { get; private set; } = Money.Zero();

    private Session? _session;
    
    private Participant() { }

    public static Participant Create(string displayName, int sortOrder)
    {
        if (string.IsNullOrWhiteSpace(displayName))
            throw new ArgumentException("Display name is required", nameof(displayName));
        
        return new Participant
        {
            Id = Guid.NewGuid(),
            DisplayName = displayName,
            SortOrder = sortOrder,
            PaidAmount = Money.Zero(),
            CalculatedSubtotal = Money.Zero(),
            AllocatedCharges = Money.Zero(),
            FinalAmount = Money.Zero(),
            Balance = Money.Zero()
        };
    }

    public void SetSession(Session session)
    {
        _session = session;
        SessionId = session.Id;
    }

    public void SetPaidAmount(Money amount)
    {
        if (amount.IsNegative)
            throw new ArgumentException("Paid amount cannot be negative");
        
        PaidAmount = amount;
    }

    public void SetCalculatedValues(Money subtotal, Money allocatedCharges, Money finalAmount, Money balance)
    {
        CalculatedSubtotal = subtotal;
        AllocatedCharges = allocatedCharges;
        FinalAmount = finalAmount;
        Balance = balance;
    }

    public void UpdateSortOrder(int order)
    {
        SortOrder = order;
    }

    public void UpdateDisplayName(string displayName)
    {
        DisplayName = displayName;
    }
}
