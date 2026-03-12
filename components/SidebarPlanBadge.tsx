"use client";

import { useEffect, useState } from "react";

type PlanId = "free" | "pro" | "api";

const PLAN_STYLES: Record<PlanId, { bg: string; color: string; label: string }> = {
  free:  { bg: "#2a2a2a", color: "#888",     label: "Free" },
  pro:   { bg: "#1e3a5f", color: "#60a5fa",  label: "Pro" },
  api:   { bg: "#0d2e1a", color: "#4ade80",  label: "API" },
};

export default function SidebarPlanBadge({ email }: { email?: string }) {
  const [plan, setPlan] = useState<PlanId | null>(null);

  useEffect(() => {
    fetch("/api/user/plan")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.plan) setPlan(d.plan as PlanId); })
      .catch(() => {});
  }, []);

  const style = plan ? PLAN_STYLES[plan] ?? PLAN_STYLES.free : null;

  return (
    <div
      style={{
        padding: "0.75rem 1rem",
        borderBottom: "1px solid #1a1a1a",
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
      }}
    >
      {email && (
        <p
          style={{
            fontSize: "0.72rem",
            color: "#666",
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {email}
        </p>
      )}
      {style && (
        <span
          style={{
            display: "inline-block",
            background: style.bg,
            color: style.color,
            fontSize: "0.65rem",
            fontWeight: 700,
            padding: "0.15rem 0.5rem",
            borderRadius: "100px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            alignSelf: "flex-start",
          }}
        >
          {style.label}
        </span>
      )}
    </div>
  );
}
