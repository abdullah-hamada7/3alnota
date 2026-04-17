"use client";

import { useState, useEffect } from "react";
import { WifiOff, X } from "lucide-react";

export default function ConnectivityBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Initial check
    if (typeof window !== "undefined" && !window.navigator.onLine) {
      setIsOffline(true);
      setIsVisible(true);
    }

    const handleOnline = () => {
      setIsOffline(false);
      // Keep visible for a moment to show "Back Online" if we wanted, 
      // but for now just hide it.
      setTimeout(() => setIsVisible(false), 3000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setIsVisible(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`connectivity-banner ${isOffline ? "offline" : "online"}`}>
      <div className="banner-content">
        {isOffline ? (
          <>
            <WifiOff size={16} />
            <span>إنت بتستخدم الأبلكيشن من غير نت - كل اللي بتعمله متسجل عندك</span>
          </>
        ) : (
          <>
            <span className="online-dot"></span>
            <span>النت رجع يا معلم! ✅</span>
          </>
        )}
      </div>
      <button className="banner-close" onClick={() => setIsVisible(false)}>
        <X size={14} />
      </button>

    </div>
  );
}
