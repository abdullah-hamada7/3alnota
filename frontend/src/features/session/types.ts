export interface Session {
  sessionId: string;
  name: string | null;
  currency: string;
  status: 'Draft' | 'Calculated' | 'Settled';
  viewerToken?: string;
  participants: Participant[];
  items: BillItem[];
  charges: SessionCharge[];
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface Participant {
  participantId: string;
  displayName: string;
  paidAmount: string;
  subtotal: string;
  allocatedCharges: string;
  finalAmount: string;
  balance: string;
}

export interface BillItem {
  itemId: string;
  name: string;
  amount: string;
  assignments: Assignment[];
}

export interface Assignment {
  participantId: string;
  displayName: string;
  ratioNumerator: number;
  ratioDenominator: number;
}

export interface SessionCharge {
  chargeId: string;
  type: 'Tax' | 'Service' | 'Both' | 'tax' | 'service';
  amount: string;
}

export interface CreateSessionResponse {
  sessionId: string;
  name: string | null;
  currency: string;
  status: string;
  organizerToken: string;
  viewerToken: string;
  organizerLink: string;
  viewerLink: string;
  createdAtUtc: string;
}

export interface SettlementTransaction {
  sequence: number;
  fromParticipantId: string;
  fromDisplayName: string;
  toParticipantId: string;
  toDisplayName: string;
  amount: string;
}