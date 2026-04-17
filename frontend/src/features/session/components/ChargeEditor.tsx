"use client";

import { useState } from "react";
import { SessionCharge } from "../types";
import * as sessionService from "../../../services/sessionService";

interface ChargeEditorProps {
  sessionId: string;
  charges: SessionCharge[];
  organizerToken: string;
  onUpdate: () => void;
}

export default function ChargeEditor({
  sessionId,
  charges,
  organizerToken,
  onUpdate
}: ChargeEditorProps) {
  const [taxAmount, setTaxAmount] = useState("");
  const [serviceAmount, setServiceAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const chargesToSet = [];
      
      if (taxAmount && parseFloat(taxAmount) > 0) {
        chargesToSet.push({ type: "tax", amount: taxAmount });
      }
      if (serviceAmount && parseFloat(serviceAmount) > 0) {
        chargesToSet.push({ type: "service", amount: serviceAmount });
      }

      await sessionService.replaceCharges(sessionId, chargesToSet, organizerToken);
      setTaxAmount("");
      setServiceAmount("");
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update charges");
    } finally {
      setIsLoading(false);
    }
  };

  const currentTax = charges.find(c => c.type.toLowerCase() === "tax");
  const currentService = charges.find(c => c.type.toLowerCase() === "service");

  return (
    <div className="card">
      <h2>الزيادات</h2>
      
      <div className="charge-list">
        {currentTax && (
          <div className="list-item">
            <span>ضريبة</span>
            <span className="amount">EGP {currentTax.amount}</span>
          </div>
        )}
        {currentService && (
          <div className="list-item">
            <span>خدمة</span>
            <span className="amount">EGP {currentService.amount}</span>
          </div>
        )}
        {charges.length === 0 && (
          <p className="text-secondary">مفيش زيادات لسه</p>
        )}
      </div>

      <form onSubmit={handleSave} className="form-stack">
        <input
          type="number"
          step="0.01"
          min="0"
          className="form-input"
          value={taxAmount}
          onChange={(e) => setTaxAmount(e.target.value)}
          placeholder="مبلغ الضريبة"
          disabled={isLoading}
        />
        <input
          type="number"
          step="0.01"
          min="0"
          className="form-input"
          value={serviceAmount}
          onChange={(e) => setServiceAmount(e.target.value)}
          placeholder="مبلغ الخدمة"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading} className="btn-secondary">
          {isLoading ? "..." : "تحديث الزيادات"}
        </button>
      </form>

      {error && <div className="form-error">{error}</div>}
    </div>
  );
}