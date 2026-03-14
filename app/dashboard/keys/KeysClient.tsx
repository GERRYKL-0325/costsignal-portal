"use client";

import { useState, useEffect, useRef } from "react";
import CopyButton from "@/components/CopyButton";

function CacheRefreshLine() {
  const [refreshText, setRefreshText] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://costsignal.io/v1/series", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        // Handle both {cached_at: ...} at root and nested inside metadata/meta
        const cachedAt: string | undefined =
          data?.cached_at ??
          data?.meta?.cached_at ??
          data?.metadata?.cached_at;
        if (!cachedAt) { setRefreshText("Data freshness unknown"); return; }
        const diffMs = Date.now() - new Date(cachedAt).getTime();
        const diffMin = Math.round(diffMs / 60_000);
        if (diffMin < 1) setRefreshText("Data last refreshed: just now");
        else if (diffMin === 1) setRefreshText("Data last refreshed: 1 minute ago");
        else setRefreshText(`Data last refreshed: ${diffMin} minutes ago`);
      })
      .catch(() => setRefreshText("Data freshness unavailable"));
  }, []);

  if (!refreshText) return null;

  return (
    <p style={{ fontSize: "0.75rem", color: "#555", margin: 0 }}>
      🕐 {refreshText}
    </p>
  );
}

type ActiveKey = {
  id: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  label: string;
} | null;

export default function KeysClient({
  activeKey,
  newlyGeneratedKey,
  dbUserId,
}: {
  activeKey: ActiveKey;
  newlyGeneratedKey: string | null;
  dbUserId: string;
}) {
  const [revealed, setRevealed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(newlyGeneratedKey);
  const [currentKey, setCurrentKey] = useState(activeKey);

  async function handleRegenerate() {
    setIsRegenerating(true);
    try {
      const res = await fetch("/api/keys/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rotate: true }),
      });
      const data = await res.json();
      if (data.rawKey) {
        setNewKey(data.rawKey);
        setCurrentKey(data.key);
        setShowModal(false);
      }
    } catch (err) {
      console.error("Regeneration failed", err);
    } finally {
      setIsRegenerating(false);
    }
  }

  const maskedKey = currentKey
    ? `${currentKey.key_prefix}${"•".repeat(22)}`
    : "No key";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">API Keys</h1>
        <p className="text-gray-400 text-sm mt-1">
          Manage your CostSignal API keys. Keys are hashed — the raw key is shown only once.
        </p>
        <div className="mt-2">
          <CacheRefreshLine />
        </div>
      </div>

      {/* Newly generated key callout */}
      {newKey && (
        <div className="bg-accent/10 border border-accent/30 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-accent text-lg">✓</span>
            <div className="flex-1">
              <p className="text-accent font-semibold text-sm mb-1">
                Your new API key — save it now!
              </p>
              <p className="text-gray-400 text-xs mb-3">
                This is the only time it will be displayed. We store a hash, not the key itself.
              </p>
              <div className="flex items-center gap-3">
                <code className="flex-1 font-mono text-sm bg-bg border border-border rounded-lg px-4 py-2.5 text-white break-all">
                  {newKey}
                </code>
                <CopyButton value={newKey} label="Copy key" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current key card */}
      <div className="bg-bg2 border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-white">Active Key</h2>
        </div>

        {currentKey ? (
          <div className="p-5 space-y-5">
            {/* Key display */}
            <div>
              <label className="text-xs text-gray-400 mb-2 block">API Key</label>
              <div className="flex items-center gap-3">
                <code className="flex-1 font-mono text-sm bg-bg border border-border rounded-lg px-4 py-2.5 text-gray-300 break-all">
                  {revealed ? currentKey.key_prefix + "•••• (full key not stored)" : maskedKey}
                </code>
                <button
                  onClick={() => setRevealed((r) => !r)}
                  className="px-3 py-2 text-xs font-medium rounded-lg bg-bg border border-border text-gray-400 hover:text-white hover:border-gray-600 transition-all"
                >
                  {revealed ? "Hide" : "Reveal prefix"}
                </button>
                <CopyButton value={currentKey.key_prefix} label="Copy prefix" />
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 mb-1">Label</p>
                <p className="text-gray-300">{currentKey.label}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Prefix</p>
                <code className="text-gray-300 font-mono">{currentKey.key_prefix}</code>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Created</p>
                <p className="text-gray-300">
                  {new Date(currentKey.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Last used</p>
                <p className="text-gray-300">
                  {currentKey.last_used_at
                    ? new Date(currentKey.last_used_at).toLocaleString()
                    : "Never"}
                </p>
              </div>
            </div>

            {/* Regenerate button */}
            <div className="pt-2 border-t border-border">
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
              >
                Regenerate Key
              </button>
              <p className="text-xs text-gray-500 mt-2">
                This will revoke your current key immediately. Any requests using the old key will fail.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "#0d2e1a",
                border: "2px solid #4ade80",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
              }}
            >
              🔑
            </div>
            <div>
              <p className="text-white font-semibold text-lg">
                Generate your first API key
              </p>
              <p className="text-gray-400 text-sm mt-1 max-w-sm">
                Your API key authenticates requests to the CostSignal data API.
              </p>
            </div>
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              style={{
                background: "#4ade80",
                color: "#000",
                fontWeight: 700,
                fontSize: "0.9rem",
                padding: "0.65rem 1.75rem",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
              }}
            >
              {isRegenerating ? "Generating…" : "Generate API Key"}
            </button>
          </div>
        )}
      </div>

      {/* Quick Start */}
      {currentKey && <QuickStart keyPrefix={currentKey.key_prefix} />}

      {/* Confirmation modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-bg2 border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-white font-semibold text-lg mb-2">
              Regenerate API Key?
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Your current key will be <strong className="text-red-400">immediately revoked</strong>.
              Any services using it will break until updated with the new key.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border text-gray-300 hover:border-gray-600 hover:text-white transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {isRegenerating ? "Regenerating…" : "Yes, Regenerate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Quick Start ────────────────────────────────────────────────────────────────

const TABS = ["curl", "python", "javascript"] as const;
type Tab = typeof TABS[number];

function QuickStart({ keyPrefix }: { keyPrefix: string }) {
  const [tab, setTab] = useState<Tab>("curl");
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const placeholder = `${keyPrefix}<YOUR_KEY>`;

  const snippets: Record<Tab, string> = {
    curl: `curl "https://costsignal.io/v1/data?slugs=bls-ppi-lumber,eia-crude-wti&from=2020-1&to=2024-12&format=json" \\
  -H "X-API-Key: ${placeholder}"`,

    python: `import requests

API_KEY = "${placeholder}"
BASE    = "https://costsignal.io/v1"

resp = requests.get(
    f"{BASE}/data",
    params={
        "slugs":  "bls-ppi-lumber,eia-crude-wti",
        "from":   "2020-1",
        "to":     "2024-12",
        "format": "json",
    },
    headers={"X-API-Key": API_KEY},
)
data = resp.json()
print(data)`,

    javascript: `const API_KEY = "${placeholder}";

const res = await fetch(
  "https://costsignal.io/v1/data" +
  "?slugs=bls-ppi-lumber,eia-crude-wti&from=2020-1&to=2024-12&format=json",
  { headers: { "X-API-Key": API_KEY } }
);
const data = await res.json();
console.log(data);`,
  };

  function handleCopy() {
    navigator.clipboard.writeText(snippets[tab]).catch(() => {});
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div
      style={{
        background: "#0d0d0d",
        border: "1px solid #1a1a1a",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "1.1rem 1.25rem 0",
          borderBottom: "1px solid #1a1a1a",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <div>
            <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#e8e8e8", margin: 0 }}>
              Quick Start
            </p>
            <p style={{ fontSize: "0.72rem", color: "#555", margin: "0.2rem 0 0" }}>
              Replace <code style={{ fontFamily: "monospace", fontSize: "0.7rem", background: "#1a1a1a", padding: "0.1rem 0.35rem", borderRadius: "3px", color: "#4ade80" }}>&lt;YOUR_KEY&gt;</code> with the full key you just saved
            </p>
          </div>
          <a
            href="https://costsignal.io/docs"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "0.75rem", color: "#4ade80", textDecoration: "none", fontWeight: 500, flexShrink: 0 }}
          >
            Full docs →
          </a>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: "0.125rem" }}>
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: tab === t ? "#1a1a1a" : "transparent",
                color: tab === t ? "#e8e8e8" : "#555",
                border: "none",
                borderBottom: tab === t ? "2px solid #4ade80" : "2px solid transparent",
                padding: "0.4rem 0.875rem",
                fontSize: "0.75rem",
                fontWeight: tab === t ? 600 : 400,
                cursor: "pointer",
                fontFamily: "monospace",
                transition: "color 0.15s",
                borderRadius: "6px 6px 0 0",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Code block */}
      <div style={{ position: "relative" }}>
        <pre
          style={{
            margin: 0,
            padding: "1.25rem 1.4rem",
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
            fontSize: "0.77rem",
            lineHeight: 1.8,
            color: "#ccc",
            overflowX: "auto",
            background: "transparent",
          }}
        >
          {snippets[tab]}
        </pre>

        <button
          onClick={handleCopy}
          style={{
            position: "absolute",
            top: "0.75rem",
            right: "0.75rem",
            background: copied ? "#0d2e1a" : "#1a1a1a",
            color: copied ? "#4ade80" : "#666",
            border: `1px solid ${copied ? "#1a3a1a" : "#2a2a2a"}`,
            borderRadius: "6px",
            padding: "0.3rem 0.7rem",
            fontSize: "0.72rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>

      {/* Footer hint */}
      <div
        style={{
          padding: "0.75rem 1.25rem",
          borderTop: "1px solid #141414",
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: "0.72rem", color: "#444" }}>
          📌 <strong style={{ color: "#555" }}>slugs</strong> — comma-separated series IDs from the{" "}
          <a href="https://portal.costsignal.io/builder" target="_blank" rel="noopener noreferrer" style={{ color: "#4ade80", textDecoration: "none" }}>Builder</a>
        </span>
        <span style={{ fontSize: "0.72rem", color: "#444" }}>
          📅 <strong style={{ color: "#555" }}>from / to</strong> — YYYY-M format (e.g. 2020-1)
        </span>
        <span style={{ fontSize: "0.72rem", color: "#444" }}>
          📤 <strong style={{ color: "#555" }}>format</strong> — json · csv · excel
        </span>
      </div>
    </div>
  );
}
