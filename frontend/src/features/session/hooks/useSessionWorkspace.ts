"use client";

import { useState, useCallback, useEffect } from "react";
import { Session } from "../types";
import * as sessionService from "../../../services/sessionService";

interface UseSessionWorkspaceOptions {
  sessionId: string;
  token?: string | null;
}

export function useSessionWorkspace({ sessionId, token }: UseSessionWorkspaceOptions) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await sessionService.getSession(sessionId);
      setSession(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load session");
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const updateSession = useCallback(async (name: string) => {
    try {
      const updated = await sessionService.updateSession(sessionId, name);
      setSession(updated);
    } catch (err) {
      throw err;
    }
  }, [sessionId]);

  const calculateSession = useCallback(async () => {
    try {
      await sessionService.calculateSession(sessionId);
      await loadSession();
    } catch (err) {
      throw err;
    }
  }, [sessionId, loadSession]);

  const addParticipant = useCallback(async (displayName: string) => {
    try {
      await sessionService.addParticipant(sessionId, displayName);
      await loadSession();
    } catch (err) {
      throw err;
    }
  }, [sessionId, loadSession]);

  const addBillItem = useCallback(async (name: string, amount: string) => {
    try {
      await sessionService.addBillItem(sessionId, name, amount);
      await loadSession();
    } catch (err) {
      throw err;
    }
  }, [sessionId, loadSession]);

  const replaceCharges = useCallback(async (charges: { type: string; amount: string }[]) => {
    try {
      await sessionService.replaceCharges(sessionId, charges);
      await loadSession();
    } catch (err) {
      throw err;
    }
  }, [sessionId, loadSession]);

  const replacePayments = useCallback(async (payments: { participantId: string; paidAmount: string }[]) => {
    try {
      await sessionService.replacePayments(sessionId, payments);
      await loadSession();
    } catch (err) {
      throw err;
    }
  }, [sessionId, loadSession]);

  return {
    session,
    isLoading,
    error,
    isOrganizer: true,
    reload: loadSession,
    updateSession,
    calculateSession,
    addParticipant,
    addBillItem,
    replaceCharges,
    replacePayments,
  };

}