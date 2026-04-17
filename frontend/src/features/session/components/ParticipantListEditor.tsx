"use client";

import { useState } from "react";
import { Participant } from "../types";
import * as sessionService from "../../../services/sessionService";

interface ParticipantListEditorProps {
  sessionId: string;
  participants: Participant[];
  onUpdate: () => void;
}


export default function ParticipantListEditor({ 
  sessionId, 
  participants, 
  onUpdate 
}: ParticipantListEditorProps) {

  const [newName, setNewName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    setIsLoading(true);
    setError("");

    try {
      await sessionService.addParticipant(sessionId, newName);
      setNewName("");
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>مين موجود؟</h2>
      
      <ul className="participant-list">
        {participants.map(p => (
          <li key={p.participantId} className="list-item">
            {p.displayName}
          </li>
        ))}
      </ul>

      {participants.length === 0 && (
        <p className="text-secondary">لسه مفيش حد</p>
      )}

      <form onSubmit={handleAdd} className="form-inline">
        <input
          type="text"
          className="form-input"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="اسم الشخص"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !newName.trim()} className="btn-secondary">
          {isLoading ? "..." : "ضيف"}
        </button>
      </form>

      {error && <div className="form-error">{error}</div>}
    </div>
  );
}