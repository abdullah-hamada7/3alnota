namespace BillSplitter.Domain.ValueObjects;

public sealed record Money
{
    public string Currency { get; }
    public decimal Amount { get; }

    private Money(string currency, decimal amount)
    {
        Currency = currency;
        Amount = amount;
    }

    public static Money FromDecimal(decimal amount, string currency = "EGP")
    {
        if (currency != "EGP")
            throw new ArgumentException($"Currency must be EGP, got {currency}", nameof(currency));
        
        return new Money(currency, amount);
    }

    public static Money FromString(string amount, string currency = "EGP")
    {
        if (currency != "EGP")
            throw new ArgumentException($"Currency must be EGP, got {currency}", nameof(currency));
        
        if (!decimal.TryParse(amount, out var parsed))
            throw new ArgumentException($"Invalid amount format: {amount}", nameof(amount));
        
        return new Money(currency, parsed);
    }

    public string ToDisplayString()
    {
        return Math.Round(Amount, 2, MidpointRounding.ToEven).ToString("F2");
    }

    public Money Add(Money other)
    {
        if (Currency != other.Currency)
            throw new InvalidOperationException($"Cannot add different currencies: {Currency} and {other.Currency}");
        
        return new Money(Currency, Amount + other.Amount);
    }

    public Money Subtract(Money other)
    {
        if (Currency != other.Currency)
            throw new InvalidOperationException($"Cannot subtract different currencies: {Currency} and {other.Currency}");
        
        return new Money(Currency, Amount - other.Amount);
    }

    public Money Divide(int divisor)
    {
        if (divisor <= 0)
            throw new ArgumentException("Divisor must be positive", nameof(divisor));
        
        return new Money(Currency, Amount / divisor);
    }

    public Money Multiply(int multiplier)
    {
        if (multiplier <= 0)
            throw new ArgumentException("Multiplier must be positive", nameof(multiplier));
        
        return new Money(Currency, Amount * multiplier);
    }

    public static Money Zero(string currency = "EGP") => new(currency, 0m);

    public bool IsZero => Amount == 0;
    public bool IsPositive => Amount > 0;
    public bool IsNegative => Amount < 0;
}