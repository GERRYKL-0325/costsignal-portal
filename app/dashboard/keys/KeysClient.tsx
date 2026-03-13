"use client";

import { useState, useEffect } from "react";
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
