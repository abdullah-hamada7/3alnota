import { Session, Participant, BillItem, SessionCharge, SettlementTransaction } from "../features/session/types";

const STORAGE_KEY_PREFIX = "3alnota_session_";

export class LocalStorageService {
  private static getStorageKey(sessionId: string): string {
    return `${STORAGE_KEY_PREFIX}${sessionId}`;
  }

  static saveSession(session: Session): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.getStorageKey(session.sessionId), JSON.stringify(session));
  }

  static getSession(sessionId: string): Session | null {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem(this.getStorageKey(sessionId));
    if (!data) return null;
    return JSON.parse(data) as Session;
  }

  static deleteSession(sessionId: string): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.getStorageKey(sessionId));
  }

  static createSession(name: string | null = null): Session {
    const sessionId = Math.random().toString(36).substring(2, 15);
    const now = new Date().toISOString();
    const session: Session = {
      sessionId,
      name,
      currency: "EGP",
      status: "Draft",
      participants: [],
      items: [],
      charges: [],
      createdAtUtc: now,
      updatedAtUtc: now,
    };
    this.saveSession(session);
    return session;
  }

  static calculate(sessionId: string): { session: Session; settlements: SettlementTransaction[] } {
    const session = this.getSession(sessionId);
    if (!session) throw new Error("Session not found");

    const participants = session.participants;
    const items = session.items;
    const charges = session.charges;

    // 1. Reset values
    participants.forEach(p => {
      p.subtotal = "0";
      p.allocatedCharges = "0";
      p.finalAmount = "0";
      p.balance = "0";
    });

    // 2. Calculate Subtotals (Item shares)
    items.forEach(item => {
      const itemAmount = parseFloat(item.amount);
      const totalDenominator = item.assignments.reduce((sum, a) => sum + a.ratioNumerator / a.ratioDenominator, 0);
      
      if (totalDenominator > 0) {
        item.assignments.forEach(assignment => {
          const participant = participants.find(p => p.participantId === assignment.participantId);
          if (participant) {
            const share = (itemAmount * (assignment.ratioNumerator / assignment.ratioDenominator)) / totalDenominator;
            participant.subtotal = (parseFloat(participant.subtotal) + share).toString();
          }
        });
      }
    });

    // 3. Calculate Charges (Split equally as per backend logic)
    const totalCharges = charges.reduce((sum, c) => sum + parseFloat(c.amount), 0);
    const chargePerPerson = participants.length > 0 ? totalCharges / participants.length : 0;

    participants.forEach(p => {
      p.allocatedCharges = chargePerPerson.toFixed(2);
      const finalAmount = parseFloat(p.subtotal) + chargePerPerson;
      p.finalAmount = finalAmount.toFixed(2);
      const balance = parseFloat(p.paidAmount) - finalAmount;
      p.balance = balance.toFixed(2);
      
      // Keep subtotal to 2 decimals for consistency
      p.subtotal = parseFloat(p.subtotal).toFixed(2);
    });

    // 4. Generate Settlements (Greedy Algorithm)
    const settlements: SettlementTransaction[] = [];
    
    const debtors = participants
      .filter(p => parseFloat(p.balance) < -0.005) // Using epsilon for precision
      .sort((a, b) => parseFloat(a.balance) - parseFloat(b.balance)); // Most negative first

    const creditors = participants
      .filter(p => parseFloat(p.balance) > 0.005)
      .sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance)); // Most positive first

    const debtorBalances = debtors.map(d => Math.abs(parseFloat(d.balance)));
    const creditorBalances = creditors.map(c => parseFloat(c.balance));

    let dIdx = 0;
    let cIdx = 0;

    while (dIdx < debtors.length && cIdx < creditors.length) {
      const amount = Math.min(debtorBalances[dIdx], creditorBalances[cIdx]);
      
      if (amount > 0.005) {
        settlements.push({
          sequence: settlements.length + 1,
          fromParticipantId: debtors[dIdx].participantId,
          fromDisplayName: debtors[dIdx].displayName,
          toParticipantId: creditors[cIdx].participantId,
          toDisplayName: creditors[cIdx].displayName,
          amount: amount.toFixed(2)
        });
      }

      debtorBalances[dIdx] -= amount;
      creditorBalances[cIdx] -= amount;

      if (debtorBalances[dIdx] < 0.005) dIdx++;
      if (creditorBalances[cIdx] < 0.005) cIdx++;
    }

    session.status = "Calculated";
    session.updatedAtUtc = new Date().toISOString();
    this.saveSession(session);

    return { session, settlements };
  }
}

export default LocalStorageService;
