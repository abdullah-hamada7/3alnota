"use client";

import { useState } from "react";
import { BillItem, Participant } from "../types";
import * as sessionService from "../../../services/sessionService";

interface BillItemEditorProps {
  sessionId: string;
  items: BillItem[];
  participants: Participant[];
  onUpdate: () => void;
}


export default function BillItemEditor({
  sessionId,
  items,
  participants,
  onUpdate
}: BillItemEditorProps) {

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount.trim()) return;
    
    setIsLoading(true);
    setError("");

    try {
      await sessionService.addBillItem(sessionId, name, amount);
      setName("");
      setAmount("");
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>الطلبات</h2>
      
      <ul className="item-list">
        {items.map(item => (
          <li key={item.itemId} className="list-item">
            <span>{item.name}</span>
            <span className="amount">EGP {item.amount}</span>
          </li>
        ))}
      </ul>

      {items.length === 0 && (
        <p className="text-secondary">لسه مفيش طلبات</p>
      )}

      <form onSubmit={handleAdd} className="form-stack">
        <input
          type="text"
          className="form-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="أسم الطلب (مثلاً بيتزا)"
          disabled={isLoading}
        />
        <input
          type="number"
          step="0.01"
          min="0"
          className="form-input"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="السعر (جنيه)"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !name.trim() || !amount.trim()} className="btn-secondary">
          {isLoading ? "..." : "ضيف طلب"}
        </button>
      </form>

      {error && <div className="form-error">{error}</div>}
    </div>
  );
}