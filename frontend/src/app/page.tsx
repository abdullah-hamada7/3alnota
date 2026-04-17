"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/services/apiClient";
import { CreateSessionResponse } from "@/features/session/types";
import WakeUpCheck from "@/components/WakeUpCheck";
import { PlusCircle } from "lucide-react";

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
      const response = await apiClient<CreateSessionResponse>("/api/sessions", {
        method: "POST",
        body: { name: sessionName || null },
      });

      router.push(`/sessions/${response.sessionId}?token=${response.organizerToken}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
      setIsLoading(false);
    }
  };

  return (
    <WakeUpCheck>
      <main className="home-container">
        <div className="hero">
          <div className="logo-mark">ن</div>
          <h1 className="brand-name">عالنوتة</h1>
          <p className="tagline">قسّم الحسبة وصفي حسابك مع صحابك بسهولة</p>
        </div>

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

        <div className="hint">
          سجّل الطلبات والأسامي، وصفي الحساب!<br />
          عشان كل واحد يعرف اللي ليه واللي عليه
        </div>
      </main>
    </WakeUpCheck>
  );
}