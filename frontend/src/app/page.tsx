"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as sessionService from "@/services/sessionService";
import { PlusCircle } from "lucide-react";
import HistoryList from "@/features/session/components/HistoryList";


export default function HomePage() {
  const router = useRouter();
  const [sessionName, setSessionName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await sessionService.createSession(sessionName);

      router.push(`/sessions/${response.sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
      setIsLoading(false);
    }
  };

  return (
    <main className="home-container">
      <div className="hero stagger-1">
        <div className="logo-mark">ن</div>
        <h1 className="brand-name">عالنوتة</h1>
        <p className="tagline">قسّم الحسبة وصفي حسابك مع صحابك بسهولة</p>
      </div>

      <div className="stagger-2">
        <form onSubmit={handleCreateSession} className="create-form">
          <div className="form-group">
            <input
              type="text"
              className="name-input"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="قولنا الحسبة دي بتاعة إيه؟"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="create-btn"
          >
            {isLoading ? "..." : (
              <>
                <PlusCircle size={20} />
                <span>افتح النوتة</span>
              </>
            )}
          </button>
        </form>
      </div>

      <HistoryList />


      <div className="hint">
        سجّل الطلبات والأسامي، وصفي الحساب!<br />
        عشان كل واحد يعرف اللي ليه واللي عليه
      </div>
    </main>
  );
}