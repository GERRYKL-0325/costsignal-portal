"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDateParam(param: string | null): string {
  if (!param) return "—";
  const [y, m] = param.split("-").map(Number);
  if (!y || !m) return param;
  return `${MONTH_SHORT[(m - 1) % 12]} ${y}`;
}

function SavePresetForm() {
  const params = useSearchParams();
  const router = useRouter();

  const slugsParam = params.get("slugs") ?? "";
  const fromParam = params.get("from");
  const toParam = params.get("to");
  const formatParam = params.get("format") ?? "wide";
  const nameParam = params.get("name") ?? "";
  const descParam = params.get("description") ?? "";

  const slugList = slugsParam ? slugsParam.split(",").map(s => s.trim()).filter(Boolean) : [];

  const [name, setName] = useState(nameParam);
  const [description, setDescription] = useState(descParam);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(nameParam);
  }, [nameParam]);

  async function handleSave() {
    if (!name.trim()) {
      setError("Preset name is required");
      return;
    }
    if (slugList.length === 0) {
      setError("No series selected — go back to the Builder and select at least one series");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Parse from/to to extract year numbers for storage
      const fromYear = fromParam ? parseInt(fromParam.split("-")[0]) : null;
      const toYear = toParam ? parseInt(toParam.split("-")[0]) : null;

      const res = await fetch("/api/user/configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          series_slugs: slugList,
          from_year: fromYear,
          to_year: toYear,
          format: formatParam,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save preset");
        return;
      }

      router.push("/dashboard/platform?saved=1");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a", display: "flex",
      alignItems: "center", justifyContent: "center", padding: "2rem",
    }}>
      <div style={{
        width: "100%", maxWidth: "480px",
        background: "#111", border: "1px solid #1a1a1a",
        borderRadius: "16px", padding: "2rem",
        boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
      }}>
        {/* Header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e8e8e8", marginBottom: "0.3rem" }}>
            ☁ Save builder preset
          </div>
          <div style={{ fontSize: "0.78rem", color: "#555" }}>
            Confirm the details below and save to your portal library
          </div>
        </div>

        {/* Preset summary */}
        <div style={{
          background: "#0d1a10", border: "1px solid #1a3a1a",
          borderRadius: "10px", padding: "1rem 1.25rem", marginBottom: "1.5rem",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
              <span style={{ fontSize: "0.72rem", color: "#555" }}>Series</span>
              <span style={{ fontSize: "0.72rem", color: "#4ade80", fontWeight: 600, textAlign: "right", flex: 1 }}>
                {slugList.length > 0
                  ? <>
                      {slugList.slice(0, 4).join(", ")}
                      {slugList.length > 4 && <span style={{ color: "#666" }}> +{slugList.length - 4} more</span>}
                    </>
                  : <span style={{ color: "#555" }}>None selected</span>
                }
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
              <span style={{ fontSize: "0.72rem", color: "#555" }}>Date range</span>
              <span style={{ fontSize: "0.72rem", color: "#aaa", fontWeight: 500 }}>
                {formatDateParam(fromParam)} – {formatDateParam(toParam)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
              <span style={{ fontSize: "0.72rem", color: "#555" }}>Format</span>
              <span style={{ fontSize: "0.72rem", color: "#aaa", fontWeight: 500, textTransform: "capitalize" }}>
                {formatParam === "wide" ? "Wide (dates as rows)" : "Long (one row per point)"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
              <span style={{ fontSize: "0.72rem", color: "#555" }}>Count</span>
              <span style={{ fontSize: "0.72rem", color: "#aaa" }}>{slugList.length} series</span>
            </div>
          </div>
        </div>

        {/* Form fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <label style={{ fontSize: "0.72rem", color: "#888", display: "block", marginBottom: "0.35rem" }}>
              Preset name *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='e.g. "Steel & Copper 2020–2025"'
              maxLength={80}
              onKeyDown={e => { if (e.key === "Enter") handleSave(); }}
              style={{
                width: "100%", background: "#161616", border: "1px solid #2a2a2a",
                borderRadius: "8px", padding: "0.6rem 0.75rem", color: "#e8e8e8",
                fontSize: "0.875rem", fontFamily: "Inter, sans-serif", outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={e => (e.target.style.borderColor = "#4ade80")}
              onBlur={e => (e.target.style.borderColor = "#2a2a2a")}
            />
          </div>
          <div>
            <label style={{ fontSize: "0.72rem", color: "#888", display: "block", marginBottom: "0.35rem" }}>
              Description <span style={{ color: "#444" }}>(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this preset for?"
              rows={2}
              maxLength={200}
              style={{
                width: "100%", background: "#161616", border: "1px solid #2a2a2a",
                borderRadius: "8px", padding: "0.6rem 0.75rem", color: "#e8e8e8",
                fontSize: "0.875rem", fontFamily: "Inter, sans-serif", outline: "none",
                resize: "vertical", boxSizing: "border-box",
              }}
              onFocus={e => (e.target.style.borderColor = "#4ade80")}
              onBlur={e => (e.target.style.borderColor = "#2a2a2a")}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "#1a0707", border: "1px solid #3a1010", borderRadius: "8px",
            padding: "0.65rem 0.875rem", marginBottom: "1rem",
            fontSize: "0.78rem", color: "#f87171",
          }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "0.7rem", background: saving ? "#2a4a2a" : "#4ade80",
              color: saving ? "#4ade80" : "#000", border: "none", borderRadius: "8px",
              fontSize: "0.875rem", fontWeight: 700, fontFamily: "Inter, sans-serif",
              cursor: saving ? "not-allowed" : "pointer", transition: "opacity 0.15s",
            }}
          >
            {saving ? "Saving…" : "Save preset"}
          </button>
          <button
            onClick={() => router.back()}
            disabled={saving}
            style={{
              padding: "0.7rem", background: "transparent", color: "#888",
              border: "1px solid #2a2a2a", borderRadius: "8px",
              fontSize: "0.875rem", fontFamily: "Inter, sans-serif",
              cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={e => {
              (e.target as HTMLButtonElement).style.borderColor = "#444";
              (e.target as HTMLButtonElement).style.color = "#ccc";
            }}
            onMouseLeave={e => {
              (e.target as HTMLButtonElement).style.borderColor = "#2a2a2a";
              (e.target as HTMLButtonElement).style.color = "#888";
            }}
          >
            Cancel
          </button>
        </div>

        {/* Footer */}
        <p style={{ fontSize: "0.68rem", color: "#333", marginTop: "1rem", textAlign: "center" }}>
          Saved presets appear in your{" "}
          <a href="/dashboard/platform/configs" style={{ color: "#555", textDecoration: "none" }}>
            platform library
          </a>
          {" "}and can be loaded into the Builder with one click
        </p>
      </div>
    </div>
  );
}

export default function SavePresetPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#555", fontSize: "0.875rem" }}>Loading…</div>
      </div>
    }>
      <SavePresetForm />
    </Suspense>
  );
}
