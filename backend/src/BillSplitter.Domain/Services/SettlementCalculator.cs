using BillSplitter.Domain.Entities;
using BillSplitter.Domain.ValueObjects;

namespace BillSplitter.Domain.Services;

public class SettlementCalculator
{
    public List<SettlementTransaction> CalculateSettlements(Session session)
    {
        var transactions = new List<SettlementTransaction>();
        var participants = session.Participants.ToList();
        
        if (participants.Count == 0)
            return transactions;
        
        var debtors = participants
            .Where(p => p.Balance != null && p.Balance.IsNegative)
            .OrderBy(p => p.Balance!.Amount)
            .ThenBy(p => p.SortOrder)
            .ToList();
        
        var creditors = participants
            .Where(p => p.Balance != null && p.Balance.IsPositive)
            .OrderByDescending(p => p.Balance!.Amount)
            .ThenBy(p => p.SortOrder)
            .ToList();

        var debtorAmounts = debtors.Select(d => Math.Abs(d.Balance.Amount)).ToList();
        var creditorAmounts = creditors.Select(c => c.Balance.Amount).ToList();

        int debtorIndex = 0;
        int creditorIndex = 0;

        while (debtorIndex < debtors.Count && creditorIndex < creditors.Count)
        {
            var debtor = debtors[debtorIndex];
            var creditor = creditors[creditorIndex];

            var transferAmount = Math.Min(
                debtorAmounts[debtorIndex],
                creditorAmounts[creditorIndex]
            );

            if (transferAmount > 0)
            {
                transactions.Add(SettlementTransaction.Create(
                    session.Id,
                    debtor.Id,
                    creditor.Id,
                    Money.FromDecimal(transferAmount),
                    transactions.Count + 1
                ));
            }

            debtorAmounts[debtorIndex] -= transferAmount;
            creditorAmounts[creditorIndex] -= transferAmount;

            if (debtorAmounts[debtorIndex] < 0.01m)
                debtorIndex++;
            if (creditorAmounts[creditorIndex] < 0.01m)
                creditorIndex++;
        }

        return transactions;
    }
}