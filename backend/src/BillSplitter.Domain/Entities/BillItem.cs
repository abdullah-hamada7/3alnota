using BillSplitter.Domain.ValueObjects;

namespace BillSplitter.Domain.Entities;

public class BillItem
{
    public Guid Id { get; private set; }
    public Guid SessionId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public Money Amount { get; private set; }
    public int SortOrder { get; private set; }

    private Session? _session;
    private readonly List<ItemAssignment> _assignments = new();
    public IReadOnlyCollection<ItemAssignment> Assignments => _assignments.AsReadOnly();

    private BillItem() { }

    public static BillItem Create(string name, Money amount, int sortOrder)
    {
        if (amount.IsNegative || amount.IsZero)
            throw new ArgumentException("Amount must be positive");
        
        return new BillItem
        {
            Id = Guid.NewGuid(),
            Name = name,
            Amount = amount,
            SortOrder = sortOrder
        };
    }

    public void SetSession(Session session)
    {
        _session = session;
        SessionId = session.Id;
    }

    public void AddAssignment(ItemAssignment assignment)
    {
        if (_assignments.Any(a => a.ParticipantId == assignment.ParticipantId))
            throw new InvalidOperationException($"Participant already assigned to this item");
        
        assignment.SetItem(this);
        _assignments.Add(assignment);
    }

    public void ClearAssignments()
    {
        _assignments.Clear();
    }

    public void UpdateName(string name)
    {
        Name = name;
    }

    public Money GetShareForParticipant(Guid participantId)
    {
        var assignment = _assignments.FirstOrDefault(a => a.ParticipantId == participantId);
        if (assignment == null)
            return Money.Zero();
        
        return Amount.Multiply(assignment.RatioNumerator).Divide(assignment.RatioDenominator);
    }
}