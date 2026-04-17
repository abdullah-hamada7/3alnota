import { Session, CreateSessionResponse, Participant, BillItem } from "../features/session/types";
import LocalStorageService from "./localStorageService";

export async function createSession(name?: string): Promise<CreateSessionResponse> {
  const session = LocalStorageService.createSession(name || null);
  
  // Mocking the response to match what the component expects
  return {
    sessionId: session.sessionId,
    name: session.name,
    currency: session.currency,
    status: session.status,
    organizerToken: "local-token", // No longer needed but kept for compatibility
    viewerToken: "local-viewer",
    organizerLink: `/sessions/${session.sessionId}`,
    viewerLink: `/sessions/${session.sessionId}`,
    createdAtUtc: session.createdAtUtc
  };
}

export async function getSession(sessionId: string, _token?: string): Promise<Session> {
  const session = LocalStorageService.getSession(sessionId);
  if (!session) throw new Error("Session not found");
  return session;
}

export async function updateSession(sessionId: string, name: string): Promise<Session> {
  const session = LocalStorageService.getSession(sessionId);
  if (!session) throw new Error("Session not found");
  
  session.name = name;
  session.updatedAtUtc = new Date().toISOString();
  LocalStorageService.saveSession(session);
  return session;
}

export async function calculateSession(sessionId: string): Promise<any> {
  const result = LocalStorageService.calculate(sessionId);
  return {
    ...result.session,
    settlements: result.settlements
  };
}

export async function addParticipant(sessionId: string, displayName: string): Promise<Participant> {
  const session = LocalStorageService.getSession(sessionId);
  if (!session) throw new Error("Session not found");

  const participant: Participant = {
    participantId: Math.random().toString(36).substring(2, 9),
    displayName,
    paidAmount: "0",
    subtotal: "0",
    allocatedCharges: "0",
    finalAmount: "0",
    balance: "0"
  };

  session.participants.push(participant);
  LocalStorageService.saveSession(session);
  return participant;
}

export async function addBillItem(
  sessionId: string,
  name: string,
  amount: string,
  _token?: string,
  assignments?: any[]
): Promise<BillItem> {
  const session = LocalStorageService.getSession(sessionId);
  if (!session) throw new Error("Session not found");

  const item: BillItem = {
    itemId: Math.random().toString(36).substring(2, 9),
    name,
    amount,
    assignments: assignments || []
  };

  session.items.push(item);
  LocalStorageService.saveSession(session);
  return item;
}

export async function replaceCharges(
  sessionId: string,
  charges: { type: string; amount: string }[]
): Promise<void> {
  const session = LocalStorageService.getSession(sessionId);
  if (!session) throw new Error("Session not found");

  session.charges = charges.map(c => ({
    chargeId: Math.random().toString(36).substring(2, 9),
    type: c.type as any,
    amount: c.amount
  }));

  LocalStorageService.saveSession(session);
}

export async function replacePayments(
  sessionId: string,
  payments: { participantId: string; paidAmount: string }[]
): Promise<void> {
  const session = LocalStorageService.getSession(sessionId);
  if (!session) throw new Error("Session not found");

  payments.forEach(p => {
    const participant = session.participants.find(part => part.participantId === p.participantId);
    if (participant) {
      participant.paidAmount = p.paidAmount;
    }
  });

  LocalStorageService.saveSession(session);
}

export async function updateParticipant(
  sessionId: string,
  participantId: string,
  displayName: string
): Promise<Participant> {
  const session = LocalStorageService.getSession(sessionId);
  if (!session) throw new Error("Session not found");

  const participant = session.participants.find(p => p.participantId === participantId);
  if (!participant) throw new Error("Participant not found");

  participant.displayName = displayName;
  LocalStorageService.saveSession(session);
  return participant;
}

export async function deleteParticipant(
  sessionId: string,
  participantId: string
): Promise<void> {
  const session = LocalStorageService.getSession(sessionId);
  if (!session) throw new Error("Session not found");

  session.participants = session.participants.filter(p => p.participantId !== participantId);
  
  // Also remove assignments from items
  session.items.forEach(item => {
    item.assignments = item.assignments.filter(a => a.participantId !== participantId);
  });

  LocalStorageService.saveSession(session);
}

export async function deleteBillItem(
  sessionId: string,
  itemId: string
): Promise<void> {
  const session = LocalStorageService.getSession(sessionId);
  if (!session) throw new Error("Session not found");

  session.items = session.items.filter(i => i.itemId !== itemId);
  LocalStorageService.saveSession(session);
}

export const getHistory = (): Session[] => {
  return LocalStorageService.getAllSessions();
};

export const deleteSession = (sessionId: string): void => {
  LocalStorageService.deleteSession(sessionId);
};