"use client";

import { Participant } from "../types";
import { formatMoney } from "../../../lib/formatMoney";

interface SessionSummaryProps {
  participants: Participant[];
}

export default function SessionSummary({ participants }: SessionSummaryProps) {
  if (participants.length === 0) {
    return (
      <div className="card">
        <h2>Summary</h2>
        <p className="text-secondary">Add participants to see breakdown</p>
      </div>
    );
  }

  const totalFinal = participants.reduce((sum, p) => sum + parseFloat(p.finalAmount), 0);

  return (
    <div className="card">
      <h2>الخلاصة</h2>
      
      <table className="summary-table">
        <thead>
          <tr>
            <th>الأسم</th>
            <th>الحساب</th>
            <th>زيادات</th>
            <th>الإجمالي</th>
            <th>ليه / عليه</th>
          </tr>
        </thead>
        <tbody>
          {participants.map(p => {
            const balance = parseFloat(p.balance);
            const balanceClass = balance > 0 ? "amount-positive" : balance < 0 ? "amount-negative" : "";
            
            return (
              <tr key={p.participantId}>
                <td>{p.displayName}</td>
                <td className="amount">EGP {formatMoney(p.subtotal)}</td>
                <td className="amount">EGP {formatMoney(p.allocatedCharges)}</td>
                <td className="amount">EGP {formatMoney(p.finalAmount)}</td>
                <td className={`amount ${balanceClass}`}>
                  {balance > 0 ? "+" : ""}{formatMoney(p.balance)}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3}><strong>المجموع</strong></td>
            <td className="amount"><strong>EGP {formatMoney(totalFinal)}</strong></td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}