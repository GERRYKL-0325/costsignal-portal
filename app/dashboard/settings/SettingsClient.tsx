"use client";

import { useState } from "react";
import Link from "next/link";
import { SignOutButton, useClerk } from "@clerk/nextjs";

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
  const { user } = useClerk();
  const initials = fullName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDeleteAccount() {
    if (deleteConfirmInput.trim().toLowerCase() !== "delete my account") return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await user?.delete();
      window.location.href = "/";
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete account. Please contact support.");
      setIsDeleting(false);
    }
  }

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
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Sign out row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
            <div>
              <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#ccc", margin: 0 }}>Sign out</p>
              <p style={{ fontSize: "0.72rem", color: "#555", margin: "0.15rem 0 0 0" }}>End your current session.</p>
            </div>
            <SignOutButton redirectUrl="/">
              <button
                style={{
                  background: "transparent",
                  border: "1px solid #3b1111",
                  borderRadius: "8px",
                  color: "#ef4444",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  padding: "0.45rem 1rem",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                Sign out
              </button>
            </SignOutButton>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid #1e1e1e" }} />

          {/* Delete account row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
            <div>
              <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#ef4444", margin: 0 }}>Delete account</p>
              <p style={{ fontSize: "0.72rem", color: "#555", margin: "0.15rem 0 0 0" }}>
                Permanently delete your account and all data. This cannot be undone.
              </p>
            </div>
            <button
              onClick={() => { setShowDeleteModal(true); setDeleteConfirmInput(""); setDeleteError(null); }}
              style={{
                background: "transparent",
                border: "1px solid #5a1111",
                borderRadius: "8px",
                color: "#ef4444",
                fontSize: "0.78rem",
                fontWeight: 600,
                padding: "0.45rem 1rem",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              Delete account
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#111",
              border: "1px solid #2a0a0a",
              borderRadius: "16px",
              padding: "1.75rem",
              maxWidth: 420,
              width: "100%",
              boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <span style={{ fontSize: "1.25rem" }}>⚠️</span>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", margin: 0 }}>
                Delete account permanently?
              </h3>
            </div>
            <p style={{ fontSize: "0.8rem", color: "#999", marginBottom: "1.25rem", lineHeight: 1.6 }}>
              This will <strong style={{ color: "#ef4444" }}>permanently delete</strong> your account,
              all saved presets, API keys, and usage history. There is no way to recover this data.
            </p>
            <p style={{ fontSize: "0.78rem", color: "#666", marginBottom: "0.5rem" }}>
              Type <strong style={{ color: "#ccc", fontFamily: "monospace" }}>delete my account</strong> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
              placeholder="delete my account"
              style={{
                width: "100%",
                background: "#0a0a0a",
                border: "1px solid #2a2a2a",
                borderRadius: "8px",
                padding: "0.6rem 0.875rem",
                color: "#e8e8e8",
                fontSize: "0.82rem",
                outline: "none",
                marginBottom: "1.25rem",
                boxSizing: "border-box",
                fontFamily: "monospace",
              }}
            />
            {deleteError && (
              <p style={{ fontSize: "0.75rem", color: "#ef4444", marginBottom: "1rem" }}>{deleteError}</p>
            )}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "1px solid #2a2a2a",
                  borderRadius: "8px",
                  color: "#aaa",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  padding: "0.6rem 1rem",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmInput.trim().toLowerCase() !== "delete my account" || isDeleting}
                style={{
                  flex: 1,
                  background: deleteConfirmInput.trim().toLowerCase() === "delete my account" && !isDeleting
                    ? "#ef4444"
                    : "#3b1111",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  padding: "0.6rem 1rem",
                  cursor: deleteConfirmInput.trim().toLowerCase() === "delete my account" && !isDeleting
                    ? "pointer"
                    : "not-allowed",
                  opacity: deleteConfirmInput.trim().toLowerCase() === "delete my account" && !isDeleting ? 1 : 0.5,
                  transition: "all 0.2s",
                }}
              >
                {isDeleting ? "Deleting…" : "Delete my account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
