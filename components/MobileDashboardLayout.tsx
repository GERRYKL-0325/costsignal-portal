"use client";

import { useState, useEffect, useCallback } from "react";
import { ReactNode } from "react";
import SidebarNav, { SidebarBottom } from "@/components/SidebarNav";
import SidebarPlanBadge from "@/components/SidebarPlanBadge";

interface MobileDashboardLayoutProps {
  children: ReactNode;
  email: string;
  fullName: string;
  initials: string;
}

export default function MobileDashboardLayout({
  children,
  email,
  fullName,
  initials,
}: MobileDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (nav click)
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeSidebar();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeSidebar]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-bg flex">
      {/* ── Desktop sidebar (always visible ≥768px) ── */}
      <aside
        className="w-56 bg-bg2 border-r border-border flex-col fixed h-full z-20 hidden md:flex"
      >
        <SidebarLogo />
        <SidebarPlanBadge email={email} />
        <SidebarNav />
        <SidebarBottom />
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      {/* Backdrop */}
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 30,
          }}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100%",
          width: "14rem",
          background: "#111",
          borderRight: "1px solid #1e1e1e",
          zIndex: 40,
          display: "flex",
          flexDirection: "column",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
          // Only show as overlay on mobile; hide completely on desktop
        }}
        aria-label="Mobile navigation"
      >
        {/* Close button inside drawer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 1rem 1rem 1.25rem",
            borderBottom: "1px solid #1e1e1e",
          }}
        >
          <SidebarLogoInline />
          <button
            onClick={closeSidebar}
            aria-label="Close sidebar"
            style={{
              background: "transparent",
              border: "none",
              color: "#666",
              fontSize: "1.25rem",
              cursor: "pointer",
              padding: "0.25rem",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
        <SidebarPlanBadge email={email} />
        {/* Wrap nav in click catcher to close on navigation */}
        <div onClick={closeSidebar} style={{ display: "contents" }}>
          <SidebarNav />
          <SidebarBottom />
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col md:ml-56">
        {/* Top bar */}
        <header
          className="h-14 border-b border-border bg-bg2/50 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 sticky top-0 z-10"
        >
          {/* Left: hamburger on mobile, empty on desktop */}
          <div className="flex items-center gap-3">
            {/* Hamburger — only visible on mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
              className="md:hidden"
              style={{
                background: "transparent",
                border: "1px solid #1e1e1e",
                borderRadius: "6px",
                color: "#aaa",
                cursor: "pointer",
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {/* Hamburger icon */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect y="2" width="16" height="1.5" rx="0.75" fill="currentColor" />
                <rect y="7.25" width="16" height="1.5" rx="0.75" fill="currentColor" />
                <rect y="12.5" width="16" height="1.5" rx="0.75" fill="currentColor" />
              </svg>
            </button>
          </div>

          {/* Right: email + initials avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            {email && (
              <p
                className="hidden sm:block"
                style={{ fontSize: "0.7rem", color: "#555", margin: 0 }}
              >
                {email}
              </p>
            )}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#0d1a10",
                border: "2px solid #4ade80",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#4ade80",
                letterSpacing: "0.04em",
                flexShrink: 0,
                fontFamily: "Inter, sans-serif",
                cursor: "default",
              }}
              title={fullName || email}
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

function SidebarLogo() {
  return (
    <div className="px-5 py-5 border-b border-border">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-accent" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-white">
          CostSignal
        </span>
      </div>
    </div>
  );
}

function SidebarLogoInline() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-accent" />
      </div>
      <span className="text-sm font-semibold tracking-tight text-white">
        CostSignal
      </span>
    </div>
  );
}
