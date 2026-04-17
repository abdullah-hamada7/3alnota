"use client";

import { useState } from "react";
import { Session } from "../types";
import * as sessionService from "../../../services/sessionService";

interface SessionEditorProps {
  session: Session;
  organizerToken: string;
  onUpdate: (session: Session) => void;
}

export default function SessionEditor({ session, organizerToken, onUpdate }: SessionEditorProps) {
  const [name, setName] = useState(session.name || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const updated = await sessionService.updateSession(session.sessionId, name, organizerToken);
      onUpdate(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="card">
      <h2>تفاصيل الحسبة</h2>
      
      <div className="form-group">
        <label className="form-label" htmlFor="sessionName">اسم الحسبة</label>
        <input
          id="sessionName"
          type="text"
          className="form-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثلاً غدوة في المطعم"
          disabled={isLoading}
        />
      </div>

      {error && <div className="form-error">{error}</div>}

      <button type="submit" disabled={isLoading} className="btn-primary">
        {isLoading ? "لحظة..." : "تحديث"}
      </button>
    </form>
  );
}