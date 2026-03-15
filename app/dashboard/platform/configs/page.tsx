"use client";

import { useEffect, useRef, useState } from "react";
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

function builderDeepLink(
  seriesSlugs: string[],
  fromYear?: number | null,
  toYear?: number | null,
  format?: string | null
) {
  const params = new URLSearchParams();
  if (seriesSlugs?.length) params.set("slugs", seriesSlugs.join(","));
  if (fromYear) params.set("from", `${fromYear}-1`);
  if (toYear) params.set("to", `${toYear}-12`);
  if (format) params.set("format", format);
  const qs = params.toString();
  return `https://portal.costsignal.io/builder${qs ? `?${qs}` : ""}`;
}

// ── Inline rename row ──────────────────────────────────────────────────────────
function RenameRow({
  config,
  onSave,
  onCancel,
}: {
  config: SavedConfig;
  onSave: (id: string, name: string, description: string | null) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(config.name);
  const [description, setDescription] = useState(config.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  async function handleSave() {
    if (!name.trim()) { setError("Name is required"); return; }
    setSaving(true);
    setError(null);
    try {
      await onSave(config.id, name.trim(), description.trim() || null);
    } catch {
      setError("Save failed — try again");
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        background: "#0d1a10",
        border: "1px solid #1a3a1a",
        borderRadius: "10px",
        padding: "1rem 1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.625rem",
      }}
    >
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") onCancel();
          }}
          placeholder="Preset name"
          style={{
            flex: 1,
            background: "#111",
            border: "1px solid #2a4a2a",
            borderRadius: "7px",
            padding: "0.45rem 0.75rem",
            color: "#e8e8e8",
            fontSize: "0.875rem",
            outline: "none",
            fontFamily: "Inter, sans-serif",
          }}
          onFocus={(e) => { e.target.style.borderColor = "#4ade80"; }}
          onBlur={(e) => { e.target.style.borderColor = "#2a4a2a"; }}
        />
        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          style={{
            background: saving || !name.trim() ? "#1a3a1a" : "#4ade80",
            color: saving || !name.trim() ? "#4ade80" : "#000",
            border: "none",
            borderRadius: "7px",
            padding: "0.45rem 0.875rem",
            fontSize: "0.8rem",
            fontWeight: 700,
            cursor: saving || !name.trim() ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
            transition: "all 0.15s",
          }}
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={onCancel}
          style={{
            background: "transparent",
            border: "1px solid #2a2a2a",
            borderRadius: "7px",
            padding: "0.45rem 0.75rem",
            color: "#666",
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={200}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") onCancel();
        }}
        placeholder="Description (optional)"
        style={{
          background: "#111",
          border: "1px solid #222",
          borderRadius: "7px",
          padding: "0.35rem 0.75rem",
          color: "#999",
          fontSize: "0.78rem",
          outline: "none",
          fontFamily: "Inter, sans-serif",
        }}
        onFocus={(e) => { e.target.style.borderColor = "#2a4a2a"; }}
        onBlur={(e) => { e.target.style.borderColor = "#222"; }}
      />
      {error && (
        <p style={{ fontSize: "0.72rem", color: "#f87171", margin: 0 }}>{error}</p>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function SavedConfigsPage() {
  const [configs, setConfigs] = useState<SavedConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renamedId, setRenamedId] = useState<string | null>(null); // flash on save

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
      setConfigs((prev) => prev.filter((c) => c.id !== id));
    }
    setDeletingId(null);
    setConfirmDeleteId(null);
  }

  async function handleRename(id: string, name: string, description: string | null) {
    const res = await fetch(`/api/user/configs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    if (!res.ok) throw new Error("PATCH failed");
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name, description } : c))
    );
    setRenamingId(null);
    setRenamedId(id);
    setTimeout(() => setRenamedId(null), 2000);
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
        <Link
          href="/dashboard/platform"
          className="text-xs text-gray-400 hover:text-white border border-border px-3 py-1.5 rounded-lg transition-colors"
        >
          ← Platform
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-16 text-gray-500 text-sm">
          Loading configurations…
        </div>
      ) : configs.length === 0 ? (
        /* Empty state */
        <div className="bg-bg2 border border-border rounded-xl py-16 text-center">
          <div className="text-3xl mb-4">📂</div>
          <p className="text-gray-400 font-medium text-sm">
            No saved configurations yet
          </p>
          <p className="text-gray-600 text-xs mt-1 mb-4">
            Save one from the Builder and it will appear here.
          </p>
          <a
            href="https://portal.costsignal.io/builder"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "0.6rem 1.25rem",
              background: "#4ade80",
              color: "#000",
              fontWeight: 700,
              fontSize: "0.85rem",
              borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            Open Builder →
          </a>
        </div>
      ) : (
        <div className="bg-bg2 border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            {configs.map((config) => (
              <div key={config.id} className="px-5 py-4">
                {renamingId === config.id ? (
                  <RenameRow
                    config={config}
                    onSave={handleRename}
                    onCancel={() => setRenamingId(null)}
                  />
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p
                          className="text-sm font-semibold"
                          style={{
                            color: renamedId === config.id ? "#4ade80" : "#fff",
                            transition: "color 0.4s",
                          }}
                        >
                          {config.name}
                          {renamedId === config.id && (
                            <span
                              style={{
                                marginLeft: "0.5rem",
                                fontSize: "0.68rem",
                                fontWeight: 600,
                                color: "#4ade80",
                                background: "#0d2e1a",
                                padding: "0.1rem 0.4rem",
                                borderRadius: "4px",
                              }}
                            >
                              ✓ saved
                            </span>
                          )}
                        </p>
                        <span
                          style={{
                            background: "#1a1a1a",
                            color: "#555",
                            fontSize: "0.68rem",
                            fontFamily: "monospace",
                            padding: "0.1rem 0.5rem",
                            borderRadius: "4px",
                          }}
                        >
                          {config.series_slugs.length} series
                        </span>
                        {config.format && (
                          <span
                            style={{
                              background: "#1a1a1a",
                              color: "#555",
                              fontSize: "0.68rem",
                              fontFamily: "monospace",
                              padding: "0.1rem 0.5rem",
                              borderRadius: "4px",
                            }}
                          >
                            {config.format}
                          </span>
                        )}
                      </div>
                      {config.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {config.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5">
                        <p className="text-xs text-gray-600">
                          {config.series_slugs.slice(0, 4).join(", ")}
                          {config.series_slugs.length > 4 &&
                            ` +${config.series_slugs.length - 4} more`}
                        </p>
                        {config.from_year && config.to_year && (
                          <span className="text-xs text-gray-700">
                            {config.from_year}–{config.to_year}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-700 mt-1">
                        Saved{" "}
                        {new Date(config.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={builderDeepLink(
                          config.series_slugs,
                          config.from_year,
                          config.to_year,
                          config.format
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          color: "#4ade80",
                          border: "1px solid #1a3a1a",
                          padding: "0.3rem 0.75rem",
                          borderRadius: "6px",
                          textDecoration: "none",
                        }}
                      >
                        Load →
                      </a>

                      {/* Rename button */}
                      <button
                        onClick={() => {
                          setConfirmDeleteId(null);
                          setRenamingId(config.id);
                        }}
                        title="Rename preset"
                        style={{
                          fontSize: "0.75rem",
                          color: "#555",
                          background: "transparent",
                          border: "1px solid #222",
                          padding: "0.3rem 0.55rem",
                          borderRadius: "6px",
                          cursor: "pointer",
                          transition: "color 0.15s, border-color 0.15s",
                          lineHeight: 1,
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = "#aaa";
                          (e.currentTarget as HTMLButtonElement).style.borderColor = "#444";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = "#555";
                          (e.currentTarget as HTMLButtonElement).style.borderColor = "#222";
                        }}
                      >
                        ✏
                      </button>

                      {/* Delete button / confirm */}
                      {confirmDeleteId === config.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDelete(config.id)}
                            disabled={deletingId === config.id}
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              color: "#fff",
                              background: "#dc2626",
                              border: "none",
                              padding: "0.3rem 0.6rem",
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
                          >
                            {deletingId === config.id ? "Deleting…" : "Confirm"}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            style={{
                              fontSize: "0.75rem",
                              color: "#666",
                              background: "transparent",
                              border: "1px solid #2a2a2a",
                              padding: "0.3rem 0.6rem",
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setRenamingId(null);
                            setConfirmDeleteId(config.id);
                          }}
                          style={{
                            fontSize: "0.75rem",
                            color: "#555",
                            background: "transparent",
                            border: "1px solid #222",
                            padding: "0.3rem 0.6rem",
                            borderRadius: "6px",
                            cursor: "pointer",
                            transition: "color 0.15s, border-color 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color = "#ef4444";
                            (e.currentTarget as HTMLButtonElement).style.borderColor = "#3a1a1a";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color = "#555";
                            (e.currentTarget as HTMLButtonElement).style.borderColor = "#222";
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer hint */}
      {configs.length > 0 && (
        <p className="text-xs text-gray-700 text-center">
          {configs.length} configuration{configs.length !== 1 ? "s" : ""} saved ·{" "}
          <a
            href="https://portal.costsignal.io/builder"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-accent"
          >
            Open Builder →
          </a>
        </p>
      )}
    </div>
  );
}
