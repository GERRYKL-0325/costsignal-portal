"use client";

import { useEffect, useState } from "react";

type Shortcut = {
  keys: string[];
  description: string;
  category: string;
};

const SHORTCUTS: Shortcut[] = [
  // Navigation
  { keys: ["G", "H"], description: "Go to Dashboard", category: "Navigation" },
  { keys: ["G", "K"], description: "Go to API Keys", category: "Navigation" },
  { keys: ["G", "U"], description: "Go to Usage", category: "Navigation" },
  { keys: ["G", "P"], description: "Go to Presets", category: "Navigation" },
  { keys: ["G", "S"], description: "Go to Settings", category: "Navigation" },
  // Actions
  { keys: ["⌘", "K"], description: "Open command palette", category: "Actions" },
  { keys: ["?"], description: "Show keyboard shortcuts", category: "Actions" },
  { keys: ["Esc"], description: "Close modal / dismiss", category: "Actions" },
  // Builder
  { keys: ["⌘", "Enter"], description: "Fetch data in Builder", category: "Builder" },
  { keys: ["⌘", "S"], description: "Save preset in Builder", category: "Builder" },
  { keys: ["⌘", "D"], description: "Download data in Builder", category: "Builder" },
];

const CATEGORIES = ["Navigation", "Actions", "Builder"];

function KeyChip({ k }: { k: string }) {
  return (
    <kbd
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1a1a1a",
        border: "1px solid #2e2e2e",
        borderBottom: "2px solid #3a3a3a",
        borderRadius: "5px",
        padding: "0.1rem 0.4rem",
        fontSize: "0.72rem",
        fontFamily: "'JetBrains Mono', monospace",
        color: "#ccc",
        minWidth: "1.5rem",
        lineHeight: 1.5,
      }}
    >
      {k}
    </kbd>
  );
}

export default function ShortcutsModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ignore if in an input/textarea/contenteditable
      const tag = (e.target as HTMLElement).tagName;
      const editable = (e.target as HTMLElement).isContentEditable;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || editable) return;

      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        zIndex: 9998,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0d0d0d",
          border: "1px solid #2a2a2a",
          borderRadius: "18px",
          padding: "1.75rem 2rem",
          maxWidth: "560px",
          width: "100%",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <span style={{ fontSize: "1.1rem" }}>⌨️</span>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", margin: 0 }}>
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: "transparent",
              border: "none",
              color: "#555",
              fontSize: "1.1rem",
              cursor: "pointer",
              lineHeight: 1,
              padding: "0.25rem",
              borderRadius: "4px",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#aaa"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#555"; }}
          >
            ✕
          </button>
        </div>

        {/* Shortcuts by category */}
        {CATEGORIES.map((cat) => {
          const items = SHORTCUTS.filter((s) => s.category === cat);
          return (
            <div key={cat} style={{ marginBottom: "1.5rem" }}>
              <h3 style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#444",
                margin: "0 0 0.625rem 0",
                paddingBottom: "0.4rem",
                borderBottom: "1px solid #1a1a1a",
              }}>
                {cat}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {items.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.35rem 0.5rem",
                      borderRadius: "6px",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#111"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                  >
                    <span style={{ fontSize: "0.82rem", color: "#aaa" }}>
                      {s.description}
                    </span>
                    <div style={{ display: "flex", gap: "0.25rem", alignItems: "center", flexShrink: 0, marginLeft: "1rem" }}>
                      {s.keys.map((k, ki) => (
                        <span key={ki} style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                          <KeyChip k={k} />
                          {ki < s.keys.length - 1 && (
                            <span style={{ fontSize: "0.65rem", color: "#444", margin: "0 0.05rem" }}>+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Footer */}
        <div style={{
          borderTop: "1px solid #1a1a1a",
          paddingTop: "0.875rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <p style={{ fontSize: "0.72rem", color: "#444", margin: 0 }}>
            Press <KeyChip k="?" /> anywhere to toggle this panel
          </p>
          <p style={{ fontSize: "0.72rem", color: "#333", margin: 0 }}>
            Click outside or press <KeyChip k="Esc" /> to close
          </p>
        </div>
      </div>
    </div>
  );
}
