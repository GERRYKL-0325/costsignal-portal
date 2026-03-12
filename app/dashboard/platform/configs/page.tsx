"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type SavedConfig = {
  id: string;
  name: string;
  description: string | null;
  series_slugs: string[];
  from_year: number | null;
  to_year: number | null;
  format: string;
  created_at: string;
};

function builderDeepLink(seriesSlugs: string[], fromYear?: number | null, toYear?: number | null, format?: string | null) {
  const params = new URLSearchParams();
  if (seriesSlugs?.length) params.set("slugs", seriesSlugs.join(","));
  if (fromYear) params.set("from", `${fromYear}-1`);
  if (toYear) params.set("to", `${toYear}-12`);
  if (format) params.set("format", format);
  const qs = params.toString();
  return `https://costsignal.io/builder${qs ? `?${qs}` : ""}`;
}

export default function SavedConfigsPage() {
  const [configs, setConfigs] = useState<SavedConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function fetchConfigs() {
    setLoading(true);
    const res = await fetch("/api/user/configs");
    if (res.ok) {
      const data = await res.json();
      setConfigs(data.configs ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchConfigs();
  }, []);

  async function handleDelete(id: string) {
    setDeletingId(id);
    const res = await fetch(`/api/user/configs/${id}`, { method: "DELETE" });
    if (res.ok) {
      setConfigs(prev => prev.filter(c => c.id !== id));
    }
    setDeletingId(null);
    setConfirmDeleteId(null);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Saved Configurations</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Builder presets you&apos;ve saved for quick access.
          </p>
        </div>
        <Link href="/dashboard/platform" className="text-xs text-gray-400 hover:text-white border border-border px-3 py-1.5 rounded-lg transition-colors">
          ← Platform
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-16 text-gray-500 text-sm">Loading configurations…</div>
      ) : configs.length === 0 ? (
        /* Empty state */
        <div className="bg-bg2 border border-border rounded-xl py-16 text-center">
          <div className="text-3xl mb-4">📂</div>
          <p className="text-gray-400 font-medium text-sm">No saved configurations yet</p>
          <p className="text-gray-600 text-xs mt-1 mb-4">Save one from the Builder and it will appear here.</p>
          <a
            href="https://costsignal.io/builder"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block", padding: "0.6rem 1.25rem",
              background: "#4ade80", color: "#000", fontWeight: 700,
              fontSize: "0.85rem", borderRadius: "8px", textDecoration: "none",
            }}
          >
            Open Builder →
          </a>
        </div>
      ) : (
        <div className="bg-bg2 border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            {configs.map(config => (
              <div key={config.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white">{config.name}</p>
                      <span style={{
                        background: "#1a1a1a", color: "#555", fontSize: "0.68rem",
                        fontFamily: "monospace", padding: "0.1rem 0.5rem", borderRadius: "4px",
                      }}>
                        {config.series_slugs.length} series
                      </span>
                      {config.format && (
                        <span style={{
                          background: "#1a1a1a", color: "#555", fontSize: "0.68rem",
                          fontFamily: "monospace", padding: "0.1rem 0.5rem", borderRadius: "4px",
                        }}>
                          {config.format}
                        </span>
                      )}
                    </div>
                    {config.description && (
                      <p className="text-xs text-gray-500 mt-1">{config.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      <p className="text-xs text-gray-600">
                        {config.series_slugs.slice(0, 4).join(", ")}
                        {config.series_slugs.length > 4 && ` +${config.series_slugs.length - 4} more`}
                      </p>
                      {config.from_year && config.to_year && (
                        <span className="text-xs text-gray-700">
                          {config.from_year}–{config.to_year}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-700 mt-1">
                      Saved {new Date(config.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={builderDeepLink(config.series_slugs, config.from_year, config.to_year, config.format)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "0.78rem", fontWeight: 600, color: "#4ade80",
                        border: "1px solid #1a3a1a", padding: "0.3rem 0.75rem",
                        borderRadius: "6px", textDecoration: "none",
                      }}
                    >
                      Load in Builder →
                    </a>

                    {confirmDeleteId === config.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDelete(config.id)}
                          disabled={deletingId === config.id}
                          style={{
                            fontSize: "0.75rem", fontWeight: 600, color: "#fff",
                            background: "#dc2626", border: "none", padding: "0.3rem 0.6rem",
                            borderRadius: "6px", cursor: "pointer",
                          }}
                        >
                          {deletingId === config.id ? "Deleting…" : "Confirm"}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          style={{
                            fontSize: "0.75rem", color: "#666", background: "transparent",
                            border: "1px solid #2a2a2a", padding: "0.3rem 0.6rem",
                            borderRadius: "6px", cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(config.id)}
                        style={{
                          fontSize: "0.75rem", color: "#555", background: "transparent",
                          border: "1px solid #222", padding: "0.3rem 0.6rem",
                          borderRadius: "6px", cursor: "pointer",
                          transition: "color 0.15s, border-color 0.15s",
                        }}
                        onMouseEnter={e => {
                          (e.target as HTMLButtonElement).style.color = "#ef4444";
                          (e.target as HTMLButtonElement).style.borderColor = "#3a1a1a";
                        }}
                        onMouseLeave={e => {
                          (e.target as HTMLButtonElement).style.color = "#555";
                          (e.target as HTMLButtonElement).style.borderColor = "#222";
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer hint */}
      {configs.length > 0 && (
        <p className="text-xs text-gray-700 text-center">
          {configs.length} configuration{configs.length !== 1 ? "s" : ""} saved ·{" "}
          <a href="https://costsignal.io/builder" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-accent">
            Open Builder →
          </a>
        </p>
      )}
    </div>
  );
}
