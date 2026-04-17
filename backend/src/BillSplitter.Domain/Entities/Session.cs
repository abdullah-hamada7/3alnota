using BillSplitter.Domain.ValueObjects;

namespace BillSplitter.Domain.Entities;

public class Session
{
    public Guid Id { get; private set; }
    public string? Name { get; private set; }
    public string Currency { get; private set; } = "EGP";
    public string ViewerTokenHash { get; private set; } = string.Empty;
    public string OrganizerTokenHash { get; private set; } = string.Empty;
    public SessionStatus Status { get; private set; } = SessionStatus.Draft;
    public string RoundingMode { get; private set; } = "half-up-2-decimals";
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime UpdatedAtUtc { get; private set; }

    private readonly List<Participant> _participants = new();
    public IReadOnlyCollection<Participant> Participants => _participants.AsReadOnly();

    private readonly List<BillItem> _items = new();
    public IReadOnlyCollection<BillItem> Items => _items.AsReadOnly();

    private readonly List<SessionCharge> _charges = new();
    public IReadOnlyCollection<SessionCharge> Charges => _charges.AsReadOnly();

    private Session() { }

    public static Session Create(Guid id, string? name, string viewerTokenHash, string organizerTokenHash)
    {
        if (id == Guid.Empty)
            throw new ArgumentException("Session ID is required", nameof(id));
        if (string.IsNullOrEmpty(organizerTokenHash))
            throw new ArgumentException("Organizer token is required", nameof(organizerTokenHash));
        if (string.IsNullOrEmpty(viewerTokenHash))
            throw new ArgumentException("Viewer token is required", nameof(viewerTokenHash));
        
        var session = new Session
        {
            Id = id,
            Name = name,
            Currency = "EGP",
            ViewerTokenHash = viewerTokenHash,
            OrganizerTokenHash = organizerTokenHash,
            Status = SessionStatus.Draft,
            RoundingMode = "half-up-2-decimals",
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };
        return session;
    }

    public void AddParticipant(Participant participant)
    {
        if (_participants.Any(p => p.DisplayName == participant.DisplayName))
            throw new InvalidOperationException($"Participant with name '{participant.DisplayName}' already exists");
        
        participant.SetSession(this);
        _participants.Add(participant);
        MarkUpdated();
    }

    public void RemoveParticipant(Guid participantId)
    {
        var participant = _participants.FirstOrDefault(p => p.Id == participantId);
        if (participant != null)
        {
            _participants.Remove(participant);
            MarkUpdated();
        }
    }

    public void AddItem(BillItem item)
    {
        item.SetSession(this);
        _items.Add(item);
        MarkUpdated();
    }

    public void AddCharge(SessionCharge charge)
    {
        charge.SetSession(this);
        _charges.Add(charge);
        MarkUpdated();
    }

    public void SetName(string name)
    {
        Name = name;
        MarkUpdated();
        RevertToDraft();
    }

    public void RemoveItem(Guid itemId)
    {
        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item != null)
        {
            _items.Remove(item);
            MarkUpdated();
        }
    }

    public void RemoveCharge(SessionCharge charge)
    {
        if (_charges.Remove(charge))
        {
            MarkUpdated();
        }
    }

    public void SetCharges(IEnumerable<SessionCharge> charges)
    {
        _charges.Clear();
        foreach (var charge in charges)
        {
            charge.SetSession(this);
            _charges.Add(charge);
        }
        MarkUpdated();
    }

    public void MarkCalculated()
    {
        Status = SessionStatus.Calculated;
        MarkUpdated();
    }

    public void MarkSettled()
    {
        Status = SessionStatus.Settled;
        MarkUpdated();
    }

    public void RevertToDraft()
    {
        if (Status != SessionStatus.Draft)
        {
            Status = SessionStatus.Draft;
            MarkUpdated();
        }
    }

    private void MarkUpdated()
    {
        UpdatedAtUtc = DateTime.UtcNow;
    }
}