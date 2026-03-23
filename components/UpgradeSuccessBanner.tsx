"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UpgradeSuccessBanner({ plan }: { plan: string }) {
  const [visible, setVisible] = useState(true);
  const router = useRouter();

  // Auto-dismiss after 8 seconds and strip query params from URL
  useEffect(() => {
    const clean = () => {
      const url = new URL(window.location.href);
      url.searchParams.delete("upgrade");
      url.searchParams.delete("plan");
      window.history.replaceState({}, "", url.pathname + (url.search !== "?" ? url.search : ""));
    };
    clean();
    const t = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  const planLabel = plan === "api" ? "API" : plan === "pro" ? "Pro" : plan;
  const emoji = plan === "api" ? "⚡" : "🚀";
  const color = plan === "api" ? "#4ade80" : "#60a5fa";

  return (
    <div
      role="alert"
      style={{
        background: "linear-gradient(135deg, #0a1f12 0%, #071510 100%)",
        border: `1px solid ${color}44`,
        borderRadius: "12px",
        padding: "1rem 1.25rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        flexWrap: "wrap",
        animation: "fadeSlideIn 0.4s ease",
      }}
    >
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>{emoji}</span>
        <div>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#e8e8e8", fontWeight: 700 }}>
            Welcome to <span style={{ color }}>{planLabel}</span>!
          </p>
          <p style={{ margin: "0.15rem 0 0", fontSize: "0.8rem", color: "#666" }}>
            {plan === "api"
              ? "Your API key is ready. Find it below under API Keys."
              : "Full catalog and history are now unlocked. Happy building."}
          </p>
        </div>
      </div>

      <button
        onClick={() => setVisible(false)}
        aria-label="Dismiss"
        style={{
          background: "transparent",
          border: "none",
          color: "#444",
          fontSize: "1rem",
          cursor: "pointer",
          padding: "0.25rem",
          lineHeight: 1,
          borderRadius: "4px",
          flexShrink: 0,
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#aaa"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#444"; }}
      >
        ✕
      </button>
    </div>
  );
}
