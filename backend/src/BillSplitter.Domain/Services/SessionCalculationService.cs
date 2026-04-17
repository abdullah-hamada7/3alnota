using BillSplitter.Domain.Entities;
using BillSplitter.Domain.ValueObjects;

namespace BillSplitter.Domain.Services;

public class SessionCalculationService
{
    public void Calculate(Session session)
    {
        var participants = session.Participants.ToList();
        var items = session.Items.ToList();
        var charges = session.Charges.ToList();

        foreach (var participant in participants)
        {
            var subtotal = Money.Zero();
            
            foreach (var item in items)
            {
                var share = item.GetShareForParticipant(participant.Id);
                subtotal = subtotal.Add(share);
            }

            var totalCharges = charges.Sum(c => c.Amount.Amount);
            var chargePerPerson = participants.Count > 0 ? totalCharges / participants.Count : 0;
            var allocatedCharges = Money.FromDecimal(chargePerPerson);
            var finalAmount = subtotal.Add(allocatedCharges);
            var balance = participant.PaidAmount.Subtract(finalAmount);

            participant.SetCalculatedValues(subtotal, allocatedCharges, finalAmount, balance);
        }

        session.MarkCalculated();
    }
}