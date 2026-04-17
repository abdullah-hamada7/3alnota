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
  
  const isOrganizer = token?.startsWith("org_") ?? false;

  const loadSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await sessionService.getSession(sessionId, token || undefined);
      setSession(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load session");
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, token]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const updateSession = useCallback(async (name: string) => {
    if (!isOrganizer || !token) return;
    
    try {
      const updated = await sessionService.updateSession(sessionId, name, token);
      setSession(updated);
    } catch (err) {
      throw err;
    }
  }, [sessionId, token, isOrganizer]);

  const calculateSession = useCallback(async () => {
    if (!isOrganizer || !token) return;
    
    try {
      await sessionService.calculateSession(sessionId, token);
      await loadSession();
    } catch (err) {
      throw err;
    }
  }, [sessionId, token, isOrganizer, loadSession]);

  const addParticipant = useCallback(async (displayName: string) => {
    if (!isOrganizer || !token) return;
    
    try {
      await sessionService.addParticipant(sessionId, displayName, token);
      await loadSession();
    } catch (err) {
      throw err;
    }
  }, [sessionId, token, isOrganizer, loadSession]);

  const addBillItem = useCallback(async (name: string, amount: string) => {
    if (!isOrganizer || !token) return;
    
    try {
      await sessionService.addBillItem(sessionId, name, amount, token);
      await loadSession();
    } catch (err) {
      throw err;
    }
  }, [sessionId, token, isOrganizer, loadSession]);

  const replaceCharges = useCallback(async (charges: { type: string; amount: string }[]) => {
    if (!isOrganizer || !token) return;
    
    try {
      await sessionService.replaceCharges(sessionId, charges, token);
      await loadSession();
    } catch (err) {
      throw err;
    }
  }, [sessionId, token, isOrganizer, loadSession]);

  const replacePayments = useCallback(async (payments: { participantId: string; paidAmount: string }[]) => {
    if (!isOrganizer || !token) return;
    
    try {
      await sessionService.replacePayments(sessionId, payments, token);
      await loadSession();
    } catch (err) {
      throw err;
    }
  }, [sessionId, token, isOrganizer, loadSession]);

  return {
    session,
    isLoading,
    error,
    isOrganizer,
    reload: loadSession,
    updateSession,
    calculateSession,
    addParticipant,
    addBillItem,
    replaceCharges,
    replacePayments,
  };
}