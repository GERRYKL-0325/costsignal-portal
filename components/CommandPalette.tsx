"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Command = {
  id: string;
  label: string;
  description?: string;
  icon: string;
  action: () => void;
  keywords?: string;
};

function useCommands(router: ReturnType<typeof useRouter>): Command[] {
  return [
    {
      id: "home",
      label: "Dashboard",
      description: "Overview, stats, recent activity",
      icon: "🏠",
      action: () => router.push("/dashboard"),
      keywords: "home overview",
    },
    {
      id: "builder",
      label: "Open Builder",
      description: "Build cost models with 200+ series",
      icon: "🔧",
      action: () => window.open("https://portal.costsignal.io/builder", "_blank"),
      keywords: "build chart series data",
    },
    {
      id: "presets",
      label: "Saved Configurations",
      description: "Browse your preset library",
      icon: "📂",
      action: () => router.push("/dashboard/platform/configs"),
      keywords: "configs saved presets library",
    },
    {
      id: "platform",
      label: "Platform Overview",
      description: "Downloads, configs, plan details",
      icon: "📡",
      action: () => router.push("/dashboard/platform"),
      keywords: "platform downloads history",
    },
    {
      id: "keys",
      label: "API Keys",
      description: "Manage your API key",
      icon: "🔑",
      action: () => router.push("/dashboard/keys"),
      keywords: "api key token access",
    },
    {
      id: "usage",
      label: "Usage Logs",
      description: "API call history and stats",
      icon: "📊",
      action: () => router.push("/dashboard/usage"),
      keywords: "logs calls history analytics",
    },
    {
      id: "settings",
      label: "Settings",
      description: "Account and preferences",
      icon: "⚙️",
      action: () => router.push("/dashboard/settings"),
      keywords: "settings account profile preferences",
    },
    {
      id: "pricing",
      label: "Pricing",
      description: "View plans and upgrade",
      icon: "💳",
      action: () => router.push("/pricing"),
      keywords: "upgrade plan billing pro api",
    },
    {
      id: "docs",
      label: "API Documentation",
      description: "REST API reference",
      icon: "📖",
      action: () => window.open("https://costsignal.io/docs", "_blank"),
      keywords: "docs documentation api reference",
    },
    {
      id: "tam",
      label: "TAM Calculator",
      description: "Estimate total addressable markets",
      icon: "📐",
      action: () => window.open("https://costsignal.io/tam", "_blank"),
      keywords: "tam market size calculator",
    },
    {
      id: "reset-onboarding",
      label: "Reset Onboarding",
      description: "Show the welcome wizard again",
      icon: "🔄",
      action: () => {
        localStorage.removeItem("cs_onboarding_done");
        window.location.reload();
      },
      keywords: "onboarding setup wizard reset",
    },
    {
      id: "signout",
      label: "Sign Out",
      description: "Log out of your account",
      icon: "🚪",
      action: () => window.location.href = "/sign-out",
      keywords: "logout signout exit",
    },
  ];
}

export default function CommandPalette() {
  const router = useRouter();
  const commands = useCommands(router);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Toggle on Cmd+K / Ctrl+K
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        setQuery("");
        setSelected(0);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const filtered =
    query.trim() === ""
      ? commands
      : commands.filter(
          (c) =>
            c.label.toLowerCase().includes(query.toLowerCase()) ||
            (c.description ?? "").toLowerCase().includes(query.toLowerCase()) ||
            (c.keywords ?? "").toLowerCase().includes(query.toLowerCase())
        );

  // Clamp selected
  const safeSelected = Math.min(selected, Math.max(0, filtered.length - 1));

  function runCommand(cmd: Command) {
    setOpen(false);
    setQuery("");
    cmd.action();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[safeSelected]) runCommand(filtered[safeSelected]);
    }
  }

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${safeSelected}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest" });
  }, [safeSelected]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(6px)",
        zIndex: 9998,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "12vh",
        padding: "12vh 1rem 0",
      }}
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0d0d0d",
          border: "1px solid #2a2a2a",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "580px",
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(74,222,128,0.05)",
        }}
      >
        {/* Search input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.875rem 1rem",
            borderBottom: "1px solid #1a1a1a",
          }}
        >
          <span style={{ fontSize: "1rem", flexShrink: 0, opacity: 0.5 }}>⌘</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search commands…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#e8e8e8",
              fontSize: "0.95rem",
              fontFamily: "Inter, sans-serif",
            }}
          />
          <kbd
            style={{
              fontSize: "0.65rem",
              color: "#444",
              background: "#1a1a1a",
              border: "1px solid #2a2a2a",
              borderRadius: "4px",
              padding: "0.2rem 0.4rem",
              fontFamily: "monospace",
              flexShrink: 0,
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          style={{
            maxHeight: "360px",
            overflowY: "auto",
            padding: "0.4rem 0",
          }}
        >
          {filtered.length === 0 ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "#444",
                fontSize: "0.85rem",
              }}
            >
              No commands found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((cmd, i) => {
              const isActive = i === safeSelected;
              return (
                <div
                  key={cmd.id}
                  data-idx={i}
                  onClick={() => runCommand(cmd)}
                  onMouseEnter={() => setSelected(i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.875rem",
                    padding: "0.65rem 1rem",
                    cursor: "pointer",
                    background: isActive ? "#0d1a10" : "transparent",
                    borderLeft: isActive ? "2px solid #4ade80" : "2px solid transparent",
                    transition: "background 0.1s",
                  }}
                >
                  <span style={{ fontSize: "1.1rem", flexShrink: 0, width: "1.5rem", textAlign: "center" }}>
                    {cmd.icon}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: isActive ? "#fff" : "#ccc",
                        lineHeight: 1.3,
                      }}
                    >
                      {cmd.label}
                    </div>
                    {cmd.description && (
                      <div
                        style={{
                          fontSize: "0.72rem",
                          color: isActive ? "#888" : "#444",
                          marginTop: "0.1rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {cmd.description}
                      </div>
                    )}
                  </div>
                  {isActive && (
                    <kbd
                      style={{
                        fontSize: "0.65rem",
                        color: "#4ade80",
                        background: "#0d2e1a",
                        border: "1px solid #1a3a1a",
                        borderRadius: "4px",
                        padding: "0.2rem 0.4rem",
                        fontFamily: "monospace",
                        flexShrink: 0,
                      }}
                    >
                      ↵
                    </kbd>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer hint */}
        <div
          style={{
            padding: "0.5rem 1rem",
            borderTop: "1px solid #141414",
            display: "flex",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "0.65rem", color: "#333" }}>
            <kbd style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "3px", padding: "0.1rem 0.35rem", fontFamily: "monospace" }}>↑↓</kbd>{" "}
            navigate
          </span>
          <span style={{ fontSize: "0.65rem", color: "#333" }}>
            <kbd style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "3px", padding: "0.1rem 0.35rem", fontFamily: "monospace" }}>↵</kbd>{" "}
            open
          </span>
          <span style={{ fontSize: "0.65rem", color: "#333" }}>
            <kbd style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "3px", padding: "0.1rem 0.35rem", fontFamily: "monospace" }}>⌘K</kbd>{" "}
            toggle
          </span>
        </div>
      </div>
    </div>
  );
}
