import { Metadata } from "next";

export const metadata: Metadata = {
  title: "عالنوتة - مفيش إنترنت",
};

export default function OfflinePage() {
  return (
    <main className="home-container" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", textAlign: "center", padding: "var(--space-xl)" }}>
      <div className="hero">
        <div className="logo-mark" style={{ margin: "0 auto var(--space-lg)" }}>ن</div>
        <h1 className="brand-name">عالنوتة</h1>
        <div style={{ marginTop: "var(--space-xl)", color: "var(--text-secondary)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "var(--space-md)" }}>📶</div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "var(--space-sm)" }}>
            إنت دلوقتي من غير نت
          </h2>
          <p style={{ fontSize: "0.95rem", lineHeight: "1.6", maxWidth: "300px", margin: "0 auto" }}>
            متقلقش، كمل زي ما إنت وكل اللي بتعمله متسجل عندك على الموبايل عادي.
          </p>
        </div>
        
        <div style={{ marginTop: "var(--space-2xl)" }}>
          <a 
            href="/" 
            className="create-btn"
            style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "var(--space-sm)" }}
          >
            ارجع للرئيسية
          </a>
        </div>
      </div>
      
      <div className="hint" style={{ marginTop: "var(--space-2xl)" }}>
        أول ما النت يرجع، هتقدر تشارك الحسبة مع صحابك تاني.
      </div>
    </main>
  );
}
