namespace BillSplitter.Api.Contracts.Sessions;

public class CreateSessionRequest
{
    public string? Name { get; set; }
}

public class CreateSessionResponse
{
    public Guid SessionId { get; set; }
    public string? Name { get; set; }
    public string Currency { get; set; } = "EGP";
    public string Status { get; set; } = "Draft";
    public string OrganizerToken { get; set; } = string.Empty;
    public string ViewerToken { get; set; } = string.Empty;
    public string OrganizerLink { get; set; } = string.Empty;
    public string ViewerLink { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
}

public class SessionResponse
{
    public Guid SessionId { get; set; }
    public string? Name { get; set; }
    public string Currency { get; set; } = "EGP";
    public string Status { get; set; } = "Draft";
    public string ViewerToken { get; set; } = string.Empty;
    public List<ParticipantResponse> Participants { get; set; } = new();
    public List<BillItemResponse> Items { get; set; } = new();
    public List<ChargeResponse> Charges { get; set; } = new();
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
}

public class ParticipantResponse
{
    public Guid ParticipantId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string PaidAmount { get; set; } = "0.00";
    public string Subtotal { get; set; } = "0.00";
    public string AllocatedCharges { get; set; } = "0.00";
    public string FinalAmount { get; set; } = "0.00";
    public string Balance { get; set; } = "0.00";
}

public class BillItemResponse
{
    public Guid ItemId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Amount { get; set; } = "0.00";
    public List<AssignmentResponse> Assignments { get; set; } = new();
}

public class AssignmentResponse
{
    public Guid ParticipantId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public int RatioNumerator { get; set; }
    public int RatioDenominator { get; set; }
}

public class ChargeResponse
{
    public Guid ChargeId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Amount { get; set; } = "0.00";
}

public class UpdateSessionRequest
{
    public string? Name { get; set; }
}

public class CreateParticipantRequest
{
    public string DisplayName { get; set; } = string.Empty;
}

public class UpdateParticipantRequest
{
    public string DisplayName { get; set; } = string.Empty;
    public string? PaidAmount { get; set; }
}

public class CreateBillItemRequest
{
    public string Name { get; set; } = string.Empty;
    public string Amount { get; set; } = "0.00";
    public List<AssignmentRequest> Assignments { get; set; } = new();
}

public class AssignmentRequest
{
    public Guid ParticipantId { get; set; }
    public int RatioNumerator { get; set; }
    public int RatioDenominator { get; set; }
}

public class ReplaceChargesRequest
{
    public List<ChargeRequest> Charges { get; set; } = new();
}

public class ChargeRequest
{
    public string Type { get; set; } = string.Empty;
    public string Amount { get; set; } = "0.00";
}

public class CalculateResponse
{
    public string Status { get; set; } = "Calculated";
    public List<ParticipantResponse> Participants { get; set; } = new();
    public List<SettlementTransactionResponse> Settlements { get; set; } = new();
}

public class SettlementTransactionResponse
{
    public int Sequence { get; set; }
    public Guid FromParticipantId { get; set; }
    public string FromDisplayName { get; set; } = string.Empty;
    public Guid ToParticipantId { get; set; }
    public string ToDisplayName { get; set; } = string.Empty;
    public string Amount { get; set; } = "0.00";
}