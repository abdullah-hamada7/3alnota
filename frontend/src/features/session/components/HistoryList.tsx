"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Session } from "../types";
import { getHistory, deleteSession } from "../../../services/sessionService";
import { Trash2, Calendar, ChevronRight, History } from "lucide-react";
import ConfirmModal from "../../../components/shared/ConfirmModal";

export default function HistoryList() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    setSessions(getHistory());
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setSessionToDelete(sessionId);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (sessionToDelete) {
      deleteSession(sessionToDelete);
      setSessions(getHistory());
      setIsModalOpen(false);
      setSessionToDelete(null);
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
                {session.name || "نوتة من غير اسم"}
              </span>
              <div className="history-item-meta">
                <Calendar size={12} />
                <span>{formatDate(session.updatedAtUtc)}</span>
              </div>
            </div>
            <div className="history-item-actions">
              <button
                className="delete-history-btn"
                onClick={(e) => handleDeleteClick(e, session.sessionId)}
                title="مسح"
              >
                <Trash2 size={16} />
              </button>
              <ChevronRight size={18} className="history-arrow" />
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        title="مسح النوتة؟"
        message="هل أنت متأكد من مسح هذه النوتة؟ مش هتقدر ترجعها تاني."
        onConfirm={confirmDelete}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
