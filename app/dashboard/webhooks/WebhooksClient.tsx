"use client";

import { useState } from "react";

const EVENT_OPTIONS = [
  { value: "data.refreshed", label: "data.refreshed", desc: "New data ingested for a series" },
  { value: "quota.warning", label: "quota.warning", desc: "API usage hits 80% of plan limit" },
  { value: "series.added", label: "series.added", desc: "New series available in the index" },
];

interface Webhook {
  id: string;
  url: string;
  secret: string;
  events: string[];
  label: string;
  enabled: boolean;
  last_triggered_at: string | null;
  last_status_code: number | null;
  created_at: string;
}

interface Props {
  initialWebhooks: Webhook[];
  dbUserId: string;
}

export default function WebhooksClient({ initialWebhooks, dbUserId }: Props) {
  const [webhooks, setWebhooks] = useState<Webhook[]>(initialWebhooks);
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [label, setLabel] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [testResults, setTestResults] = useState<Record<string, string>>({});
  const [testing, setTesting] = useState<string | null>(null);

  function toggleEvent(val: string) {
    setSelectedEvents((prev) =>
      prev.includes(val) ? prev.filter((e) => e !== val) : [...prev, val]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!url.startsWith("http")) { setError("URL must start with http:// or https://"); return; }
    if (selectedEvents.length === 0) { setError("Select at least one event"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, secret, events: selectedEvents, label, dbUserId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setWebhooks((prev) => [data.webhook, ...prev]);
      setUrl(""); setSecret(""); setLabel(""); setSelectedEvents([]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/webhooks?id=${id}&dbUserId=${dbUserId}`, { method: "DELETE" });
    if (res.ok) setWebhooks((prev) => prev.filter((w) => w.id !== id));
  }

  async function handleTest(webhook: Webhook) {
    setTesting(webhook.id);
    setTestResults((prev) => ({ ...prev, [webhook.id]: "..." }));
    try {
      const res = await fetch("/api/webhooks/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookId: webhook.id, dbUserId }),
      });
      const data = await res.json();
      setTestResults((prev) => ({
        ...prev,
        [webhook.id]: data.ok ? `✓ ${data.status}` : `✗ ${data.error ?? data.status}`,
      }));
    } catch {
      setTestResults((prev) => ({ ...prev, [webhook.id]: "✗ Network error" }));
    } finally {
      setTesting(null);
    }
  }

  const card: React.CSSProperties = {
    background: "#111",
    border: "1px solid #1e1e1e",
    borderRadius: "12px",
    padding: "1.25rem 1.5rem",
    marginBottom: "1rem",
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", marginBottom: "0.25rem" }}>
        Webhook Alerts
      </h1>
      <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "2rem" }}>
        Receive HTTP POST notifications when CostSignal events occur.
      </p>

      {/* Add webhook form */}
      <div style={card}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#e5e7eb", marginBottom: "1rem" }}>
          Register Webhook
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <div>
              <label style={labelStyle}>Endpoint URL</label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-service.com/webhooks/costsignal"
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Signing Secret <span style={{ color: "#6b7280" }}>(optional — used in X-CostSignal-Signature header)</span></label>
              <input
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="whsec_..."
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Label <span style={{ color: "#6b7280" }}>(optional)</span></label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Production webhook"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Events to receive</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.25rem" }}>
                {EVENT_OPTIONS.map(({ value, label: eLabel, desc }) => (
                  <label key={value} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(value)}
                      onChange={() => toggleEvent(value)}
                      style={{ marginTop: "0.2rem", accentColor: "#4ade80" }}
                    />
                    <span>
                      <span style={{ color: "#e5e7eb", fontSize: "0.875rem", fontFamily: "monospace" }}>{eLabel}</span>
                      <span style={{ color: "#6b7280", fontSize: "0.8rem", display: "block" }}>{desc}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ color: "#f87171", fontSize: "0.8rem", padding: "0.5rem 0.75rem", background: "#1a0a0a", borderRadius: "6px" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              style={{
                background: saving ? "#1a2e1a" : "#4ade80",
                color: saving ? "#4ade80" : "#000",
                border: "none",
                borderRadius: "8px",
                padding: "0.625rem 1.25rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
                alignSelf: "flex-start",
              }}
            >
              {saving ? "Saving..." : "Register Webhook"}
            </button>
          </div>
        </form>
      </div>

      {/* Registered webhooks */}
      {webhooks.length === 0 ? (
        <div style={{ ...card, textAlign: "center", color: "#6b7280", padding: "2rem" }}>
          No webhooks registered yet.
        </div>
      ) : (
        webhooks.map((wh) => (
          <div key={wh.id} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <span style={{ color: "#fff", fontSize: "0.875rem", fontWeight: 600 }}>
                    {wh.label || "Unnamed webhook"}
                  </span>
                  <span style={{
                    background: wh.enabled ? "#0f2218" : "#1a1a1a",
                    color: wh.enabled ? "#4ade80" : "#6b7280",
                    borderRadius: "4px",
                    fontSize: "0.7rem",
                    padding: "0.1rem 0.4rem",
                    fontWeight: 600,
                  }}>
                    {wh.enabled ? "ACTIVE" : "DISABLED"}
                  </span>
                </div>
                <div style={{ color: "#60a5fa", fontSize: "0.8rem", marginTop: "0.25rem", wordBreak: "break-all" }}>
                  {wh.url}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginTop: "0.5rem" }}>
                  {wh.events.map((ev) => (
                    <span key={ev} style={{
                      background: "#161616",
                      border: "1px solid #262626",
                      borderRadius: "4px",
                      fontSize: "0.7rem",
                      padding: "0.15rem 0.4rem",
                      color: "#9ca3af",
                      fontFamily: "monospace",
                    }}>
                      {ev}
                    </span>
                  ))}
                </div>
                <div style={{ color: "#4b5563", fontSize: "0.75rem", marginTop: "0.5rem" }}>
                  {wh.last_triggered_at
                    ? `Last triggered: ${new Date(wh.last_triggered_at).toLocaleString()} · Status: ${wh.last_status_code ?? "—"}`
                    : "Never triggered"}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <button
                  onClick={() => handleTest(wh)}
                  disabled={testing === wh.id}
                  style={{
                    background: "transparent",
                    border: "1px solid #262626",
                    color: "#9ca3af",
                    borderRadius: "6px",
                    padding: "0.375rem 0.75rem",
                    fontSize: "0.8rem",
                    cursor: testing === wh.id ? "not-allowed" : "pointer",
                  }}
                >
                  {testing === wh.id ? "Testing..." : "Test"}
                </button>
                <button
                  onClick={() => handleDelete(wh.id)}
                  style={{
                    background: "transparent",
                    border: "1px solid #3b0f0f",
                    color: "#ef4444",
                    borderRadius: "6px",
                    padding: "0.375rem 0.75rem",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
            {testResults[wh.id] && (
              <div style={{
                marginTop: "0.75rem",
                padding: "0.5rem 0.75rem",
                background: testResults[wh.id].startsWith("✓") ? "#0a1a0a" : "#1a0a0a",
                border: `1px solid ${testResults[wh.id].startsWith("✓") ? "#1a3a1a" : "#2a0f0f"}`,
                borderRadius: "6px",
                fontSize: "0.8rem",
                color: testResults[wh.id].startsWith("✓") ? "#4ade80" : "#f87171",
                fontFamily: "monospace",
              }}>
                {testResults[wh.id]}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "#9ca3af",
  fontSize: "0.8rem",
  marginBottom: "0.35rem",
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#0a0a0a",
  border: "1px solid #262626",
  borderRadius: "8px",
  padding: "0.5rem 0.75rem",
  color: "#fff",
  fontSize: "0.875rem",
  outline: "none",
  boxSizing: "border-box",
};
