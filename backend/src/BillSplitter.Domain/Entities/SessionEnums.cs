namespace BillSplitter.Domain.Entities;

public enum SessionStatus
{
    Draft,
    Calculated,
    Settled
}

public enum ChargeType
{
    Tax,
    Service,
    Both
}