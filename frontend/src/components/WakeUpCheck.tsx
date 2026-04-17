"use client";

import { useEffect, useState } from "react";
import apiClient from "@/services/apiClient";

export default function WakeUpCheck({ children }: { children: React.ReactNode }) {
  const [isAwake, setIsAwake] = useState(false);
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      // If server doesn't respond in 2 seconds, it's likely sleeping
      const timeout = setTimeout(() => setIsSlow(true), 2000);

      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5070"}/health`);
        clearTimeout(timeout);
        setIsAwake(true);
      } catch (err) {
        console.error("Health check failed", err);
        // We'll proceed anyway after a retry or just show error if it's dead
        setIsAwake(true); 
      }
    };

    checkHealth();
  }, []);

  if (!isAwake && isSlow) {
    return (
      <div className="wakeup-overlay">
        <div className="wakeup-content">
          <div className="coffee-icon">☕</div>
          <h2>بنسخّن النوتة...</h2>
          <p>ثواني وهتكون جاهزة، السيرفر كان نايم بس بيقوم دلوقتي 💚</p>
          <div className="loader-bar"></div>
        </div>
      </div>
    );
  }

  // Pre-awake but not slow yet, or already awake
  return <>{children}</>;
}
