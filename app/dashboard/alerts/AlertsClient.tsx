"use client";

import { useState } from "react";

// Common series slugs with human-readable labels
const SERIES_OPTIONS = [
  { slug: "bls-ppi-metals", label: "PPI — Metals" },
  { slug: "bls-ppi-lumber", label: "PPI — Lumber" },
  { slug: "bls-ppi-petroleum", label: "PPI — Petroleum" },
  { slug: "bls-cpi-all", label: "CPI — All Urban Consumers" },
  { slug: "bls-emp-wages", label: "Employment — Avg Hourly Wages" },
  { slug: "eia-crude-wti", label: "EIA — WTI Crude Oil" },
  { slug: "eia-nat-gas", label: "EIA — Natural Gas" },
  { slug: "fred-pce", label: "FRED — PCE Deflator" },
  { slug: "fred-fedfunds", label: "FRED — Federal Funds Rate" },
  { slug: "fred-cpi", label: "FRED — CPI (All Items)" },
];

const OPERATORS = [
  { value: ">", label: "rises above  (>)" },
  { value: "<", label: "falls below  (<)" },
  { value: ">=", label: "reaches or exceeds  (≥)" },
  { value: "<=", label: "drops to or below  (≤)" },
];

interface Alert {
  id: string;
  series_slug: string;
  series_label: string;
  operator: string;
  threshold: number;
  notification_email: string;
  enabled: boolean;
  triggered_at: string | null;
  created_at: string;
}

interface Props {
  initialAlerts: Alert[];
  dbUserId: string;
  userEmail: string;
}

function operatorSymbol(op: string) {
  return op === ">=" ? "≥" : op === "<=" ? "≤" : op;
}

function fmt(dt: string | null) {
  if (!dt) return "Never";
  return new Date(dt).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

export default function AlertsClient({ initialAlerts, dbUserId, userEmail }: Props) {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [slug, setSlug] = useState(SERIES_OPTIONS[0].slug);
  const [customSlug, setCustomSlug] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [operator, setOperator] = useState(">");
  const [threshold, setThreshold] = useState("");
  const [email, setEmail] = useState(userEmail);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const effectiveSlug = useCustom ? customSlug.trim() : slug;
  const effectiveLabel = useCustom
    ? (customSlug.trim() || "Custom series")
    : (SERIES_OPTIONS.find((s) => s.slug === slug)?.label ?? slug);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!effectiveSlug) { setError("Select or enter a series slug"); return; }
    if (!threshold || isNaN(Number(threshold))) { setError("Enter a valid threshold number"); return; }
    if (!email || !email.includes("@")) { setError("Enter a valid notification email"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          series_slug: effectiveSlug,
          series_label: effectiveLabel,
          operator,
          threshold: Number(threshold),
          notification_email: email,
          dbUserId,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Failed to create alert"); return; }
      setAlerts((prev) => [json.alert, ...prev]);
      setThreshold("");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(id: string, current: boolean) {
    setTogglingId(id);
    try {
      const res = await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled: !current, dbUserId }),
      });
      if (res.ok) {
        const { alert: updated } = await res.json();
        setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
      }
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this alert?")) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/alerts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, dbUserId }),
      });
      if (res.ok) {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  }

  const S = {
    page: { padding: "1.5rem", maxWidth: "760px" } as React.CSSProperties,
    heading: { fontSize: "1.1rem", fontWeight: 700, color: "#e8e8e8", letterSpacing: "-0.02em", marginBottom: "0.3rem" } as React.CSSProperties,
    sub: { fontSize: "0.8rem", color: "#555", marginBottom: "2rem" } as React.CSSProperties,
    card: { background: "#111", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" } as React.CSSProperties,
    label: { display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#666", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "0.4rem" },
    input: { width: "100%", background: "#0d0d0d", border: "1px solid #222", borderRadius: "8px", padding: "0.55rem 0.75rem", color: "#e8e8e8", fontSize: "0.85rem", boxSizing: "border-box" as const, outline: "none" },
    select: { width: "100%", background: "#0d0d0d", border: "1px solid #222", borderRadius: "8px", padding: "0.55rem 0.75rem", color: "#e8e8e8", fontSize: "0.85rem", boxSizing: "border-box" as const, outline: "none" },
    row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" } as React.CSSProperties,
    btn: {
      background: "#4ade80", color: "#000", fontWeight: 700, fontSize: "0.85rem",
      border: "none", borderRadius: "8px", padding: "0.6rem 1.5rem", cursor: "pointer",
      marginTop: "0.5rem",
    } as React.CSSProperties,
    alertCard: {
      background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "10px",
      padding: "1rem 1.25rem", display: "flex", alignItems: "flex-start",
      justifyContent: "space-between", gap: "1rem", marginBottom: "0.75rem",
    } as React.CSSProperties,
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <h1 style={S.heading}>🔔 Series Alerts</h1>
      <p style={S.sub}>
        Get notified by email when a data series crosses a threshold. Alerts are checked on each data refresh.
      </p>

      {/* Create form */}
      <div style={S.card}>
        <h2 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#aaa", marginBottom: "1.25rem", margin: "0 0 1.25rem" }}>
          New alert
        </h2>
        <form onSubmit={handleSubmit}>
          {/* Series picker */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={S.label}>Series</label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
              <button
                type="button"
                onClick={() => setUseCustom(false)}
                style={{
                  fontSize: "0.72rem", padding: "0.25rem 0.6rem", borderRadius: "6px", cursor: "pointer",
                  background: !useCustom ? "#4ade80" : "transparent",
                  color: !useCustom ? "#000" : "#666",
                  border: !useCustom ? "none" : "1px solid #2a2a2a",
                  fontWeight: !useCustom ? 700 : 400,
                }}
              >
                Catalog
              </button>
              <button
                type="button"
                onClick={() => setUseCustom(true)}
                style={{
                  fontSize: "0.72rem", padding: "0.25rem 0.6rem", borderRadius: "6px", cursor: "pointer",
                  background: useCustom ? "#4ade80" : "transparent",
                  color: useCustom ? "#000" : "#666",
                  border: useCustom ? "none" : "1px solid #2a2a2a",
                  fontWeight: useCustom ? 700 : 400,
                }}
              >
                Custom slug
              </button>
            </div>
            {useCustom ? (
              <input
                style={S.input}
                placeholder="e.g. bls-ppi-steel"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
              />
            ) : (
              <select style={S.select} value={slug} onChange={(e) => setSlug(e.target.value)}>
                {SERIES_OPTIONS.map((s) => (
                  <option key={s.slug} value={s.slug}>{s.label} ({s.slug})</option>
                ))}
              </select>
            )}
          </div>

          {/* Operator + Threshold */}
          <div style={S.row}>
            <div>
              <label style={S.label}>Condition</label>
              <select style={S.select} value={operator} onChange={(e) => setOperator(e.target.value)}>
                {OPERATORS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={S.label}>Threshold value</label>
              <input
                style={S.input}
                type="number"
                step="any"
                placeholder="e.g. 300"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={S.label}>Notify via email</label>
            <input
              style={S.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          {/* Preview */}
          {effectiveSlug && threshold && (
            <div style={{ marginBottom: "1rem", padding: "0.6rem 0.875rem", background: "#0a1a10", border: "1px solid #1a3a1a", borderRadius: "8px", fontSize: "0.8rem", color: "#4ade80" }}>
              📬 Alert when <code style={{ background: "#0d1a0d", padding: "0 0.3rem", borderRadius: "4px" }}>{effectiveSlug}</code>{" "}
              {operatorSymbol(operator)} <strong>{threshold}</strong> → email to {email || "…"}
            </div>
          )}

          {error && (
            <p style={{ color: "#f87171", fontSize: "0.8rem", marginBottom: "0.75rem" }}>{error}</p>
          )}

          <button type="submit" style={S.btn} disabled={saving}>
            {saving ? "Creating…" : "Create alert →"}
          </button>
        </form>
      </div>

      {/* Alert list */}
      <div>
        <h2 style={{ fontSize: "0.78rem", fontWeight: 600, color: "#444", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.875rem" }}>
          {alerts.length === 0 ? "No alerts yet" : `${alerts.length} alert${alerts.length !== 1 ? "s" : ""}`}
        </h2>

        {alerts.length === 0 && (
          <div style={{ padding: "3rem 1.5rem", textAlign: "center", background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "12px" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🔕</div>
            <p style={{ color: "#666", fontSize: "0.85rem" }}>
              No alerts configured. Create one above to start monitoring series thresholds.
            </p>
          </div>
        )}

        {alerts.map((a) => (
          <div key={a.id} style={{ ...S.alertCard, opacity: a.enabled ? 1 : 0.5 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Series + condition */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.35rem" }}>
                <code style={{ fontSize: "0.78rem", color: "#4ade80", background: "#0d1a0d", padding: "0.15rem 0.45rem", borderRadius: "5px" }}>
                  {a.series_slug}
                </code>
                <span style={{ fontSize: "0.82rem", color: "#aaa", fontWeight: 600 }}>
                  {operatorSymbol(a.operator)} {a.threshold}
                </span>
                {!a.enabled && (
                  <span style={{ fontSize: "0.65rem", background: "#1a1a1a", color: "#555", padding: "0.15rem 0.5rem", borderRadius: "100px" }}>
                    PAUSED
                  </span>
                )}
                {a.triggered_at && (
                  <span style={{ fontSize: "0.65rem", background: "#1a0a0a", color: "#f87171", padding: "0.15rem 0.5rem", borderRadius: "100px" }}>
                    ⚡ TRIGGERED
                  </span>
                )}
              </div>

              {/* Label + email */}
              <div style={{ fontSize: "0.75rem", color: "#555" }}>
                {a.series_label !== a.series_slug && (
                  <span style={{ marginRight: "0.75rem" }}>{a.series_label}</span>
                )}
                📧 {a.notification_email}
              </div>

              {/* Meta */}
              <div style={{ marginTop: "0.4rem", fontSize: "0.7rem", color: "#333", display: "flex", gap: "1rem" }}>
                <span>Created {fmt(a.created_at)}</span>
                {a.triggered_at && <span>Last fired {fmt(a.triggered_at)}</span>}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flexShrink: 0 }}>
              <button
                onClick={() => handleToggle(a.id, a.enabled)}
                disabled={togglingId === a.id}
                style={{
                  fontSize: "0.72rem", padding: "0.3rem 0.65rem", borderRadius: "6px",
                  cursor: "pointer", border: "1px solid #2a2a2a", background: "transparent",
                  color: a.enabled ? "#60a5fa" : "#4ade80",
                  fontWeight: 600,
                }}
              >
                {togglingId === a.id ? "…" : a.enabled ? "Pause" : "Resume"}
              </button>
              <button
                onClick={() => handleDelete(a.id)}
                disabled={deletingId === a.id}
                style={{
                  fontSize: "0.72rem", padding: "0.3rem 0.65rem", borderRadius: "6px",
                  cursor: "pointer", border: "1px solid #2a1a1a", background: "transparent",
                  color: "#f87171", fontWeight: 600,
                }}
              >
                {deletingId === a.id ? "…" : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info box */}
      <div style={{ marginTop: "2rem", padding: "1rem 1.25rem", background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "10px", fontSize: "0.78rem", color: "#555", lineHeight: 1.7 }}>
        <strong style={{ color: "#666" }}>How it works:</strong>{" "}
        Thresholds are checked each time CostSignal refreshes data from BLS, FRED &amp; EIA (typically daily).
        When a series value crosses your threshold, you&apos;ll receive a one-time email notification.
        The alert stays active and will fire again if the value crosses back over the threshold in a future refresh.
      </div>
    </div>
  );
}
