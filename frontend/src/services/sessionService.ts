import apiClient from "./apiClient";
import { Session, CreateSessionResponse, Participant, BillItem, SessionCharge } from "../features/session/types";

export async function createSession(name?: string): Promise<CreateSessionResponse> {
  return apiClient<CreateSessionResponse>("/api/sessions", {
    method: "POST",
    body: { name: name || null },
  });
}

export async function getSession(sessionId: string, token?: string): Promise<Session> {
  return apiClient<Session>(`/api/sessions/${sessionId}`, {
    viewerToken: token,
  });
}

export async function updateSession(sessionId: string, name: string, organizerToken: string): Promise<Session> {
  return apiClient<Session>(`/api/sessions/${sessionId}`, {
    method: "PATCH",
    body: { name },
    organizerToken,
  });
}

export async function calculateSession(sessionId: string, organizerToken: string): Promise<any> {
  return apiClient<any>(`/api/sessions/${sessionId}/calculate`, {
    method: "POST",
    organizerToken,
  });
}

export async function addParticipant(sessionId: string, displayName: string, organizerToken: string): Promise<Participant> {
  return apiClient<Participant>(`/api/sessions/${sessionId}/participants`, {
    method: "POST",
    body: { displayName },
    organizerToken,
  });
}

export async function addBillItem(
  sessionId: string,
  name: string,
  amount: string,
  organizerToken: string,
  assignments?: any[]
): Promise<BillItem> {
  return apiClient<BillItem>(`/api/sessions/${sessionId}/items`, {
    method: "POST",
    body: { name, amount, assignments: assignments || [] },
    organizerToken,
  });
}

export async function replaceCharges(
  sessionId: string,
  charges: { type: string; amount: string }[],
  organizerToken: string
): Promise<void> {
  return apiClient<void>(`/api/sessions/${sessionId}/charges`, {
    method: "PUT",
    body: { charges },
    organizerToken,
  });
}

export async function replacePayments(
  sessionId: string,
  payments: { participantId: string; paidAmount: string }[],
  organizerToken: string
): Promise<void> {
  return apiClient<void>(`/api/sessions/${sessionId}/payments`, {
    method: "PUT",
    body: { payments },
    organizerToken,
  });
}

export async function updateParticipant(
  sessionId: string,
  participantId: string,
  displayName: string,
  organizerToken: string
): Promise<Participant> {
  return apiClient<Participant>(`/api/sessions/${sessionId}/participants/${participantId}`, {
    method: "PUT",
    body: { displayName },
    organizerToken,
  });
}

export async function deleteParticipant(
  sessionId: string,
  participantId: string,
  organizerToken: string
): Promise<void> {
  return apiClient<void>(`/api/sessions/${sessionId}/participants/${participantId}`, {
    method: "DELETE",
    organizerToken,
  });
}

export async function deleteBillItem(
  sessionId: string,
  itemId: string,
  organizerToken: string
): Promise<void> {
  return apiClient<void>(`/api/sessions/${sessionId}/items/${itemId}`, {
    method: "DELETE",
    organizerToken,
  });
}