namespace BillSplitter.Application.Interfaces;

public interface ISessionPdfService
{
    byte[] GenerateSessionSummaryPdf(SessionSummary summary);
}

public class SessionSummary
{
    public string SessionName { get; set; } = string.Empty;
    public string SessionId { get; set; } = string.Empty;
    public List<ParticipantSummary> Participants { get; set; } = [];
    public List<ItemSummary> Items { get; set; } = [];
    public List<ChargeSummary> Charges { get; set; } = [];
    public decimal Subtotal { get; set; }
    public decimal TotalCharges { get; set; }
    public decimal GrandTotal { get; set; }
    public List<SettlementSummary> Settlements { get; set; } = [];
}

public class ParticipantSummary
{
    public string DisplayName { get; set; } = string.Empty;
    public decimal PaidAmount { get; set; }
    public decimal FinalAmount { get; set; }
    public decimal Balance { get; set; }
}

public class ItemSummary
{
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string AssignedTo { get; set; } = string.Empty;
}

public class ChargeSummary
{
    public string Type { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class SettlementSummary
{
    public string FromParticipant { get; set; } = string.Empty;
    public string ToParticipant { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}