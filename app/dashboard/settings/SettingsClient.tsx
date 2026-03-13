"use client";

import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";

type PlanId = "free" | "pro" | "api";

const PLAN_META: Record<PlanId, { label: string; bg: string; color: string; calls: string; presets: string }> = {
  free: { label: "Free", bg: "#2a2a2a", color: "#888", calls: "100", presets: "3" },
  pro:  { label: "Pro",  bg: "#1e3a5f", color: "#60a5fa", calls: "10,000", presets: "Unlimited" },
  api:  { label: "API",  bg: "#0d2e1a", color: "#4ade80", calls: "100,000", presets: "Unlimited" },
};

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontSize: "0.68rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "#666",
        margin: "0 0 1rem 0",
        paddingBottom: "0.5rem",
        borderBottom: "1px solid #1e1e1e",
      }}
    >
      {children}
    </h3>
  );
}

export default function SettingsClient({
  fullName,
  email,
  plan,
  keyPrefix,
}: {
  fullName: string;
  email: string;
  plan: PlanId;
  keyPrefix: string | null;
}) {
  const meta = PLAN_META[plan] ?? PLAN_META.free;
  const initials = fullName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", margin: "0 0 1.5rem 0" }}>
        Settings
      </h1>

      {/* Profile */}
      <div className="bg-bg2 border border-border rounded-xl p-5" style={{ marginBottom: "1rem" }}>
        <SectionHeader>Profile</SectionHeader>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "#1e1e1e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "#4ade80",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div>
            <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "#e8e8e8", margin: 0 }}>{fullName}</p>
            <p style={{ fontSize: "0.78rem", color: "#666", margin: "0.15rem 0 0 0" }}>{email}</p>
          </div>
        </div>
        <p style={{ fontSize: "0.72rem", color: "#555", margin: "0 0 0.75rem 0" }}>
          Account managed by CostSignal via Clerk.
        </p>
        <a
          href="/user"
          style={{
            fontSize: "0.78rem",
            color: "#4ade80",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          Manage email, password & security →
        </a>
      </div>

      {/* Plan */}
      <div className="bg-bg2 border border-border rounded-xl p-5" style={{ marginBottom: "1rem" }}>
        <SectionHeader>Plan</SectionHeader>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#e8e8e8" }}>Current plan</span>
          <span
            style={{
              display: "inline-block",
              background: meta.bg,
              color: meta.color,
              fontSize: "0.65rem",
              fontWeight: 700,
              padding: "0.15rem 0.5rem",
              borderRadius: "100px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {meta.label}
          </span>
        </div>
        <div style={{ fontSize: "0.78rem", color: "#888", marginBottom: "1rem" }}>
          <p style={{ margin: "0 0 0.25rem 0" }}>
            <span style={{ color: "#ccc" }}>{meta.calls}</span> API calls / month
          </p>
          <p style={{ margin: 0 }}>
            <span style={{ color: "#ccc" }}>{meta.presets}</span> saved presets
          </p>
        </div>
        {plan === "free" ? (
          <Link
            href="/pricing"
            style={{
              display: "inline-block",
              background: "#4ade80",
              color: "#0a0a0a",
              fontSize: "0.78rem",
              fontWeight: 600,
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            Upgrade to Pro →
          </Link>
        ) : (
          <a
            href="mailto:hello@costsignal.io"
            style={{
              fontSize: "0.78rem",
              color: "#4ade80",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Manage subscription →
          </a>
        )}
      </div>

      {/* API Key quick reference */}
      <div className="bg-bg2 border border-border rounded-xl p-5" style={{ marginBottom: "1rem" }}>
        <SectionHeader>API Key</SectionHeader>
        {keyPrefix ? (
          <p style={{ fontSize: "0.85rem", color: "#ccc", margin: "0 0 0.75rem 0", fontFamily: "monospace" }}>
            {keyPrefix}
          </p>
        ) : (
          <p style={{ fontSize: "0.78rem", color: "#555", margin: "0 0 0.75rem 0" }}>
            No active API key.
          </p>
        )}
        <Link
          href="/dashboard/keys"
          style={{
            fontSize: "0.78rem",
            color: "#4ade80",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          Manage keys →
        </Link>
      </div>

      {/* Danger zone */}
      <div className="bg-bg2 border border-border rounded-xl p-5">
        <SectionHeader>Danger Zone</SectionHeader>
        <SignOutButton redirectUrl="/">
          <button
            style={{
              background: "transparent",
              border: "1px solid #3b1111",
              borderRadius: "8px",
              color: "#ef4444",
              fontSize: "0.78rem",
              fontWeight: 600,
              padding: "0.5rem 1rem",
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}
