"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function UpgradeBanner({ plan }: { plan: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (plan !== "free") return;
    const dismissed = localStorage.getItem("cs_upgrade_dismissed");
    if (!dismissed) setVisible(true);
  }, [plan]);

  function dismiss() {
    localStorage.setItem("cs_upgrade_dismissed", "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0d1a10 0%, #0a1508 100%)",
        border: "1px solid #1e3a1e",
        borderRadius: "12px",
        padding: "0.875rem 1.25rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
        <span style={{ fontSize: "1.1rem" }}>🚀</span>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "#d4f7d4", fontWeight: 500 }}>
          You&apos;re on the{" "}
          <strong style={{ color: "#4ade80" }}>free plan</strong> — unlock API
          access, webhooks, and team features.
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
        <Link
          href="/pricing"
          style={{
            fontSize: "0.8rem",
            fontWeight: 700,
            color: "#000",
            background: "#4ade80",
            padding: "0.35rem 0.875rem",
            borderRadius: "6px",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          See plans →
        </Link>
        <button
          onClick={dismiss}
          aria-label="Dismiss upgrade banner"
          style={{
            background: "transparent",
            border: "none",
            color: "#555",
            fontSize: "1rem",
            cursor: "pointer",
            padding: "0.25rem",
            lineHeight: 1,
            borderRadius: "4px",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#aaa";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#555";
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
