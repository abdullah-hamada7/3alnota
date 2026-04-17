"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Session } from "../types";
import { getHistory, deleteSession } from "../../../services/sessionService";
import { Trash2, Calendar, ChevronRight, History } from "lucide-react";

export default function HistoryList() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    setSessions(getHistory());
  }, []);

  const handleDelete = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (confirm("هل أنت متأكد من مسح هذه النوتة؟ لا يمكن استرجاعها.")) {
      deleteSession(sessionId);
      setSessions(getHistory());
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (sessions.length === 0) return null;

  return (
    <div className="history-section">
      <div className="history-header">
        <History size={18} />
        <h2>آخر النوتات</h2>
      </div>
      <div className="history-list">
        {sessions.map((session, index) => (
          <div
            key={session.sessionId}
            className={`history-item hover-glow stagger-${(index % 5) + 1}`}
            onClick={() => router.push(`/sessions/${session.sessionId}`)}
          >
            <div className="history-item-info">
              <span className="history-item-name">
                {session.name || "نوتة بدون اسم"}
              </span>
              <div className="history-item-meta">
                <Calendar size={12} />
                <span>{formatDate(session.updatedAtUtc)}</span>
              </div>
            </div>
            <div className="history-item-actions">
              <button
                className="delete-history-btn"
                onClick={(e) => handleDelete(e, session.sessionId)}
                title="مسح"
              >
                <Trash2 size={16} />
              </button>
              <ChevronRight size={18} className="history-arrow" />
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .history-section {
          margin-top: 2rem;
          width: 100%;
          max-width: 500px;
        }
        .history-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          color: var(--text-secondary);
        }
        .history-header h2 {
          font-size: 1rem;
          font-weight: 600;
        }
        .history-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .history-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .history-item:hover {
          border-color: var(--primary-color);
        }
        .history-item-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .history-item-name {
          font-weight: 600;
          color: var(--text-primary);
        }
        .history-item-meta {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        .history-item-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .delete-history-btn {
          padding: 0.5rem;
          color: var(--text-secondary);
          background: none;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .delete-history-btn:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }
        .history-arrow {
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
