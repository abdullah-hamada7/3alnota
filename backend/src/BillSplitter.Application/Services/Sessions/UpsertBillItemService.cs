using BillSplitter.Application.Interfaces;
using BillSplitter.Domain.Entities;
using BillSplitter.Domain.ValueObjects;

namespace BillSplitter.Application.Services.Sessions;

public class UpsertBillItemService
{
    private readonly ISessionRepository _repository;

    public UpsertBillItemService(ISessionRepository repository)
    {
        _repository = repository;
    }

    public async Task<BillItem> UpsertAsync(Guid sessionId, UpsertBillItemRequest request, CancellationToken ct = default)
    {
        var session = await _repository.GetByIdAsync(sessionId, ct)
            ?? throw new InvalidOperationException("Session not found");

        var amount = Money.FromString(request.Amount);
        if (amount.Amount <= 0)
            throw new ArgumentException("Amount must be positive", nameof(request.Amount));

        var existingItem = session.Items.FirstOrDefault(i => i.Id == request.ItemId);

        if (existingItem != null)
        {
            existingItem.UpdateName(request.Name);
            await _repository.UpdateAsync(session, ct);
            return existingItem;
        }

        var sortOrder = session.Items.Count;
        var item = BillItem.Create(request.Name, amount, sortOrder);

        foreach (var assignmentReq in request.Assignments)
        {
            var assignment = ItemAssignment.Create(
                assignmentReq.ParticipantId,
                assignmentReq.RatioNumerator,
                assignmentReq.RatioDenominator,
                assignmentReq.SortOrder);
            item.AddAssignment(assignment);
        }

        session.AddItem(item);
        await _repository.UpdateAsync(session, ct);
        return item;
    }

    public async Task DeleteAsync(Guid sessionId, Guid itemId, CancellationToken ct = default)
    {
        var session = await _repository.GetByIdAsync(sessionId, ct)
            ?? throw new InvalidOperationException("Session not found");

        session.RemoveItem(itemId);
        await _repository.UpdateAsync(session, ct);
    }
}

public class UpsertBillItemRequest
{
    public Guid? ItemId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Amount { get; set; } = "0.00";
    public List<AssignmentRequest> Assignments { get; set; } = new();
}

public class AssignmentRequest
{
    public Guid ParticipantId { get; set; }
    public int RatioNumerator { get; set; }
    public int RatioDenominator { get; set; }
    public int SortOrder { get; set; }
}