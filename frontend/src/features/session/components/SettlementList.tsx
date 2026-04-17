"use client";

import { SettlementTransaction } from "../types";

interface SettlementListProps {
  settlements: SettlementTransaction[];
  getParticipantName: (id: string) => string;
}

export default function SettlementList({ settlements, getParticipantName }: SettlementListProps) {
  if (settlements.length === 0) {
    return <p className="no-settlements">كله تمام! مفيش حد عليه حاجة لحد</p>;
  }

  return (
    <div className="settlement-list">
      <h3>مين يدفع لمين؟</h3>
      <ol>
        {settlements.map((s) => (
          <li key={s.sequence} className="settlement-item">
            <span className="debtor">{getParticipantName(s.fromParticipantId)}</span>
            <span className="arrow">→</span>
            <span className="creditor">{getParticipantName(s.toParticipantId)}</span>
            <span className="amount">EGP {s.amount}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}