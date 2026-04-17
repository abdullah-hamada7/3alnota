using BillSplitter.Domain.ValueObjects;

namespace BillSplitter.Domain.Entities;

public class ItemAssignment
{
    public Guid Id { get; private set; }
    public Guid BillItemId { get; private set; }
    public Guid ParticipantId { get; private set; }
    public int RatioNumerator { get; private set; }
    public int RatioDenominator { get; private set; }
    public int SortOrder { get; private set; }

    private BillItem? _billItem;

    private ItemAssignment() { }

    public static ItemAssignment Create(Guid participantId, int ratioNumerator, int ratioDenominator, int sortOrder)
    {
        if (ratioNumerator <= 0)
            throw new ArgumentException("Ratio numerator must be positive", nameof(ratioNumerator));
        if (ratioDenominator <= 0)
            throw new ArgumentException("Ratio denominator must be positive", nameof(ratioDenominator));

        return new ItemAssignment
        {
            Id = Guid.NewGuid(),
            ParticipantId = participantId,
            RatioNumerator = ratioNumerator,
            RatioDenominator = ratioDenominator,
            SortOrder = sortOrder
        };
    }

    public void SetItem(BillItem billItem)
    {
        _billItem = billItem;
        BillItemId = billItem.Id;
    }

    public decimal GetRatio() => (decimal)RatioNumerator / RatioDenominator;

    public decimal GetShareRatio() => (decimal)RatioNumerator / RatioDenominator;

    public Money GetShareForItem(BillItem item)
    {
        var ratio = GetShareRatio();
        return Money.FromDecimal(item.Amount.Amount * ratio);
    }
}