"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Plan = "pro" | "api";

interface UpgradeButtonProps {
  plan: Plan;
  label: string;
  style: "primary" | "secondary";
  isLoggedIn: boolean;
}

export function UpgradeButton({ plan, label, style, isLoggedIn }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleClick = async () => {
    if (!isLoggedIn) {
      router.push(`/sign-up?redirect=/pricing`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to start checkout");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  const isPrimary = style === "primary";

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          display: "block", width: "100%", textAlign: "center",
          padding: "0.75rem 1.5rem",
          background: isPrimary ? (loading ? "#2d6b42" : "#4ade80") : "transparent",
          color: isPrimary ? "#000" : (loading ? "#555" : "#e8e8e8"),
          fontWeight: 700, fontSize: "0.875rem", borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          border: isPrimary ? "none" : "1px solid #2a2a2a",
          transition: "opacity 0.15s, background 0.15s",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Redirecting to Stripe…" : `${label} →`}
      </button>
      {error && (
        <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#f87171", textAlign: "center" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to open billing portal");
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          padding: "0.5rem 1.25rem",
          background: "transparent",
          color: loading ? "#555" : "#aaa",
          fontWeight: 500, fontSize: "0.8rem", borderRadius: "6px",
          cursor: loading ? "not-allowed" : "pointer",
          border: "1px solid #2a2a2a",
        }}
      >
        {loading ? "Loading…" : "Manage billing →"}
      </button>
      {error && (
        <p style={{ marginTop: "0.4rem", fontSize: "0.72rem", color: "#f87171" }}>{error}</p>
      )}
    </div>
  );
}
