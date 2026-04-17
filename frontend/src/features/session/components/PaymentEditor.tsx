"use client";

import { useState } from "react";
import { Participant } from "../types";
import * as sessionService from "../../../services/sessionService";

interface PaymentEditorProps {
  sessionId: string;
  participants: Participant[];
  onUpdate: () => void;
}


export default function PaymentEditor({ 
  sessionId, 
  participants, 
  onUpdate 
}: PaymentEditorProps) {

  const [payments, setPayments] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    participants.forEach(p => {
      initial[p.participantId] = p.paidAmount || "0.00";
    });
    return initial;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const paymentUpdates = Object.entries(payments).map(([participantId, paidAmount]) => ({
        participantId,
        paidAmount,
      }));
      await sessionService.replacePayments(sessionId, paymentUpdates);
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save payments");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-editor" aria-label="Record payments">
      <h3>مين دفع كام؟</h3>
      {participants.map((p) => (
        <div key={p.participantId} className="payment-row">
          <label htmlFor={`payment-${p.participantId}`}>{p.displayName}</label>
          <input
            id={`payment-${p.participantId}`}
            type="text"
            value={payments[p.participantId]}
            onChange={(e) => setPayments(prev => ({ ...prev, [p.participantId]: e.target.value }))}
            placeholder="0.00"
            aria-label={`${p.displayName} payment amount`}
          />
        </div>
      ))}
      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="submit" disabled={isLoading} className="btn-primary">
        {isLoading ? "لحظة..." : "حفظ المبالغ"}
      </button>
    </form>
  );
}