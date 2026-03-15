"use client";

import { UserProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Link from "next/link";

const appearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: "#4ade80",
    colorBackground: "#111111",
    colorInputBackground: "#1a1a1a",
    colorInputText: "#e8e8e8",
    colorText: "#e8e8e8",
    colorTextSecondary: "#888888",
    colorDanger: "#f87171",
    borderRadius: "8px",
    fontFamily: "Inter, sans-serif",
  },
  elements: {
    card: {
      background: "#111",
      border: "1px solid #1e1e1e",
      borderRadius: "12px",
      boxShadow: "none",
    },
    navbar: {
      background: "#0d0d0d",
      borderRight: "1px solid #1a1a1a",
    },
    navbarButton__active: {
      background: "#0d2e1a",
      color: "#4ade80",
    },
    rootBox: {
      width: "100%",
    },
  },
};

export default function UserProfileClient() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem 1rem",
      }}
    >
      {/* Back nav */}
      <div
        style={{
          width: "100%",
          maxWidth: 900,
          marginBottom: "1.25rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <Link
          href="/dashboard/settings"
          style={{
            fontSize: "0.8rem",
            color: "#555",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            fontWeight: 500,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color = "#4ade80")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color = "#555")
          }
        >
          ← Back to Settings
        </Link>
        <span style={{ color: "#222", fontSize: "0.8rem" }}>·</span>
        <span style={{ fontSize: "0.8rem", color: "#333" }}>Account</span>
      </div>

      {/* UserProfile embed */}
      <div style={{ width: "100%", maxWidth: 900 }}>
        <UserProfile appearance={appearance} routing="hash" />
      </div>
    </div>
  );
}
