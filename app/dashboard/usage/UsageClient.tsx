"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useCallback } from "react";
import { WeeklyUsageChart } from "@/components/DashboardCharts";

// ── Constants ─────────────────────────────────────────────────────────────────

const PLAN_PRICES: Record<string, number> = { free: 0, pro: 29, api: 49 };
const PLAN_CALL_LIMITS: Record<string, number> = { free: 100, pro: 10_000, api: 30_000 };

const SOURCE_COLORS: Record<string, string> = {
  bls: "#4ade80",
  eia: "#60a5fa",
  fred: "#f59e0b",
};
function getSourceColor(slug: string): string {
  const prefix = slug.split("-")[0];
  return SOURCE_COLORS[prefix] ?? "#555";
}

// ── Types ─────────────────────────────────────────────────────────────────────

type UsageLog = {
  id: number;
  endpoint: string;
  series_requested: string[] | null;
  status_code: number | null;
  response_time_ms: number | null;
  created_at: string;
  key_prefix: string;
};
type DayCount = { date: string; count: number };

// ── Stats ─────────────────────────────────────────────────────────────────────

function computeStats(logs: UsageLog[]) {
  const total = logs.length;
  const successful = logs.filter((l) => l.status_code != null && l.status_code >= 200 && l.status_code < 300).length;
  const successRate = total > 0 ? Math.round((successful / total) * 100) : null;
  const latencies = logs.map((l) => l.response_time_ms).filter((l): l is number => l != null);
  const avgLatency = latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : null;
  const uniqueSeries = new Set(logs.flatMap((l) => l.series_requested ?? [])).size;
  return { total, successRate, avgLatency, uniqueSeries };
}

// ── Sparkline (SVG, no deps) ─────────────────────────────────────────────────

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const W = 64, H = 18;
  const max = Math.max(...values, 1);
  if (values.length < 2) {
    return <span style={{ color: "#333", fontSize: "0.65rem" }}>—</span>;
  }
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - (v / max) * H;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", flexShrink: 0 }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={pts}
        opacity={0.8}
      />
    </svg>
  );
}

// ── Series breakdown with sparklines ─────────────────────────────────────────

function SeriesBreakdown({ logs }: { logs: UsageLog[] }) {
  const counts: Record<string, number> = {};
  // Build per-slug, per-day counts for sparklines (last 7 days)
  const now = Date.now();
  const DAY_MS = 86_400_000;
  const sparkData: Record<string, number[]> = {};

  for (const log of logs) {
    for (const slug of log.series_requested ?? []) {
      counts[slug] = (counts[slug] ?? 0) + 1;
      if (!sparkData[slug]) sparkData[slug] = Array(7).fill(0);
      const dayIdx = Math.floor((now - new Date(log.created_at).getTime()) / DAY_MS);
      if (dayIdx >= 0 && dayIdx < 7) sparkData[slug][6 - dayIdx]++;
    }
  }

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = sorted[0]?.[1] ?? 1;

  if (sorted.length === 0) {
    return (
      <div style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📊</div>
        <p style={{ color: "#aaa", fontWeight: 600, fontSize: "0.85rem", margin: "0 0 0.3rem" }}>No series data yet</p>
        <p style={{ color: "#444", fontSize: "0.75rem" }}>Series usage will appear here once you make API requests with slugs.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem 1.25rem 1.25rem" }}>
      <div style={{ marginBottom: "0.875rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ fontSize: "0.72rem", color: "#555" }}>
          {sorted.length} unique series across {logs.length} calls
        </span>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {Object.entries(SOURCE_COLORS).map(([src, color]) => (
            <span key={src} style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.65rem", color: "#666" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
              {src.toUpperCase()}
            </span>
          ))}
          <span style={{ fontSize: "0.65rem", color: "#444" }}>· sparkline = 7-day trend</span>
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", paddingLeft: "2rem" }}>
        <span style={{ fontSize: "0.6rem", color: "#333", width: "17rem", flexShrink: 0, letterSpacing: "0.05em", textTransform: "uppercase" }}>Series</span>
        <span style={{ fontSize: "0.6rem", color: "#333", flex: 1, letterSpacing: "0.05em", textTransform: "uppercase" }}>Calls (period)</span>
        <span style={{ fontSize: "0.6rem", color: "#333", width: "64px", flexShrink: 0, letterSpacing: "0.05em", textTransform: "uppercase" }}>7d trend</span>
        <span style={{ fontSize: "0.6rem", color: "#333", width: "2.75rem", textAlign: "right", flexShrink: 0, letterSpacing: "0.05em", textTransform: "uppercase" }}>Count</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {sorted.slice(0, 20).map(([slug, count], i) => {
          const pct = Math.round((count / max) * 100);
          const color = getSourceColor(slug);
          const spark = sparkData[slug] ?? Array(7).fill(0);
          return (
            <div key={slug} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "0.62rem", color: "#333", width: "1.25rem", textAlign: "right", flexShrink: 0 }}>
                {i + 1}
              </span>
              <code style={{ fontSize: "0.72rem", color: "#bbb", fontFamily: "monospace", width: "17rem", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                <span style={{ color, marginRight: "0.3rem", fontWeight: 700 }}>
                  {slug.split("-")[0].toUpperCase()}
                </span>
                {slug.split("-").slice(1).join("-")}
              </code>
              <div style={{ flex: 1, height: "5px", background: "#1a1a1a", borderRadius: "100px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: i === 0 ? color : color + "55", borderRadius: "100px", transition: "width 0.3s ease" }} />
              </div>
              <Sparkline values={spark} color={color} />
              <span style={{ fontSize: "0.7rem", color: "#555", width: "2.75rem", textAlign: "right", flexShrink: 0 }}>
                {count.toLocaleString()}×
              </span>
            </div>
          );
        })}
        {sorted.length > 20 && (
          <p style={{ fontSize: "0.7rem", color: "#444", textAlign: "center", margin: "0.5rem 0 0" }}>
            +{sorted.length - 20} more series
          </p>
        )}
      </div>
    </div>
  );
}

// ── Top Endpoints breakdown ───────────────────────────────────────────────────

function TopEndpoints({ logs }: { logs: UsageLog[] }) {
  if (logs.length === 0) {
    return (
      <div style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🔌</div>
        <p style={{ color: "#aaa", fontWeight: 600, fontSize: "0.85rem", margin: "0 0 0.3rem" }}>No endpoint data yet</p>
      </div>
    );
  }

  const counts: Record<string, { calls: number; success: number; latencies: number[] }> = {};
  for (const log of logs) {
    const ep = log.endpoint ?? "unknown";
    if (!counts[ep]) counts[ep] = { calls: 0, success: 0, latencies: [] };
    counts[ep].calls++;
    if (log.status_code != null && log.status_code >= 200 && log.status_code < 300) counts[ep].success++;
    if (log.response_time_ms != null) counts[ep].latencies.push(log.response_time_ms);
  }

  const sorted = Object.entries(counts).sort((a, b) => b[1].calls - a[1].calls);
  const maxCalls = sorted[0]?.[1].calls ?? 1;

  return (
    <div style={{ padding: "1rem 1.25rem 1.25rem" }}>
      <div style={{ marginBottom: "0.75rem" }}>
        <span style={{ fontSize: "0.72rem", color: "#555" }}>
          {sorted.length} endpoint{sorted.length !== 1 ? "s" : ""} · {logs.length} total calls
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
        {sorted.map(([ep, data]) => {
          const pct = Math.round((data.calls / maxCalls) * 100);
          const avgLat = data.latencies.length > 0
            ? Math.round(data.latencies.reduce((a, b) => a + b, 0) / data.latencies.length)
            : null;
          const successRate = Math.round((data.success / data.calls) * 100);
          const color = successRate >= 99 ? "#4ade80" : successRate >= 95 ? "#facc15" : "#f87171";
          return (
            <div key={ep}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.3rem" }}>
                <code style={{ fontSize: "0.73rem", color: "#ccc", fontFamily: "monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {ep}
                </code>
                <span style={{ fontSize: "0.68rem", color: "#888", whiteSpace: "nowrap" }}>
                  {data.calls.toLocaleString()} calls
                </span>
                <span style={{ fontSize: "0.68rem", color, whiteSpace: "nowrap" }}>
                  {successRate}% ok
                </span>
                {avgLat != null && (
                  <span style={{ fontSize: "0.68rem", color: "#555", whiteSpace: "nowrap" }}>
                    avg {avgLat}ms
                  </span>
                )}
              </div>
              <div style={{ height: "5px", background: "#1a1a1a", borderRadius: "100px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: "#4ade8055", borderRadius: "100px", transition: "width 0.3s ease" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Cost Estimate ─────────────────────────────────────────────────────────────

function CostEstimateCard({ callsThisMonth, plan }: { callsThisMonth: number; plan: string }) {
  const currentPrice = PLAN_PRICES[plan] ?? 0;
  const planLimit = PLAN_CALL_LIMITS[plan] ?? 100;
  const pctUsed = Math.min(100, Math.round((callsThisMonth / planLimit) * 100));

  // Estimate what Pro / API would cost for this usage
  const proCallsPerMonth = PLAN_CALL_LIMITS.pro;
  const apiCallsPerMonth = PLAN_CALL_LIMITS.api;

  let recommendation: string | null = null;
  let recommendedPlan: string | null = null;
  let recommendedPrice: number | null = null;

  if (plan === "free" && callsThisMonth > 80) {
    recommendation = "You're using most of your free quota.";
    recommendedPlan = "Pro";
    recommendedPrice = PLAN_PRICES.pro;
  } else if (plan === "pro" && callsThisMonth > proCallsPerMonth * 0.8) {
    recommendation = "You're near your Pro limit.";
    recommendedPlan = "API";
    recommendedPrice = PLAN_PRICES.api;
  }

  const barColor = pctUsed >= 90 ? "#f87171" : pctUsed >= 70 ? "#facc15" : "#4ade80";

  return (
    <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "1rem 1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        <h3 style={{ fontSize: "0.82rem", fontWeight: 600, color: "#ccc", margin: 0 }}>💡 Cost & Quota Estimate</h3>
        <span style={{ fontSize: "0.7rem", color: "#555" }}>
          {plan.charAt(0).toUpperCase() + plan.slice(1)} plan · ${currentPrice}/mo
        </span>
      </div>

      <div style={{ marginBottom: "0.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
          <span style={{ fontSize: "0.72rem", color: "#888" }}>{callsThisMonth.toLocaleString()} calls this month</span>
          <span style={{ fontSize: "0.72rem", color: barColor, fontWeight: 600 }}>{pctUsed}% of {planLimit.toLocaleString()} limit</span>
        </div>
        <div style={{ height: "6px", background: "#1a1a1a", borderRadius: "100px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pctUsed}%`, background: barColor, borderRadius: "100px", transition: "width 0.4s ease" }} />
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        {plan !== "pro" && (
          <div style={{ flex: 1, minWidth: "10rem", background: "#111", border: "1px solid #1e1e1e", borderRadius: "8px", padding: "0.6rem 0.875rem" }}>
            <div style={{ fontSize: "0.68rem", color: "#555", marginBottom: "0.2rem" }}>At Pro tier</div>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#60a5fa" }}>${PLAN_PRICES.pro}/mo</div>
            <div style={{ fontSize: "0.65rem", color: "#444", marginTop: "0.15rem" }}>{proCallsPerMonth.toLocaleString()} calls/mo included</div>
          </div>
        )}
        {plan !== "api" && (
          <div style={{ flex: 1, minWidth: "10rem", background: "#111", border: "1px solid #1e1e1e", borderRadius: "8px", padding: "0.6rem 0.875rem" }}>
            <div style={{ fontSize: "0.68rem", color: "#555", marginBottom: "0.2rem" }}>At API tier</div>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#4ade80" }}>${PLAN_PRICES.api}/mo</div>
            <div style={{ fontSize: "0.65rem", color: "#444", marginTop: "0.15rem" }}>{apiCallsPerMonth.toLocaleString()} calls/mo included</div>
          </div>
        )}
      </div>

      {recommendation && recommendedPlan && (
        <div style={{ marginTop: "0.75rem", background: "#0d1a10", border: "1px solid #1a3a1a", borderRadius: "8px", padding: "0.6rem 0.875rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
          <span style={{ fontSize: "0.72rem", color: "#aaa" }}>⚠️ {recommendation} Consider upgrading to <strong style={{ color: "#4ade80" }}>{recommendedPlan}</strong> (${recommendedPrice}/mo).</span>
          <a
            href={`mailto:hello@costsignal.io?subject=Upgrade%20to%20${recommendedPlan}`}
            style={{ fontSize: "0.7rem", color: "#4ade80", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap", border: "1px solid #1a3a1a", borderRadius: "5px", padding: "0.25rem 0.6rem" }}
          >
            Upgrade →
          </a>
        </div>
      )}
    </div>
  );
}

// ── Curl copy ─────────────────────────────────────────────────────────────────

function buildCurlSnippet(log: UsageLog): string {
  const base = "https://costsignal.io";
  const slugs = (log.series_requested ?? []).join(",");
  const qs = slugs ? `?slugs=${encodeURIComponent(slugs)}` : "";
  return `curl "${base}${log.endpoint}${qs}" \\\n  -H "X-API-Key: ${log.key_prefix}<YOUR_KEY>"`;
}

function CurlCopyButton({ log }: { log: UsageLog }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleCopy() {
    navigator.clipboard.writeText(buildCurlSnippet(log)).catch(() => {});
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      onClick={handleCopy}
      title="Copy as curl"
      style={{
        background: copied ? "#0d2e1a" : "transparent",
        color: copied ? "#4ade80" : "#444",
        border: `1px solid ${copied ? "#1a3a1a" : "#222"}`,
        borderRadius: "5px",
        padding: "0.2rem 0.5rem",
        fontSize: "0.65rem",
        fontFamily: "monospace",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.18s",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => { if (!copied) { (e.currentTarget as HTMLButtonElement).style.color = "#aaa"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#333"; } }}
      onMouseLeave={(e) => { if (!copied) { (e.currentTarget as HTMLButtonElement).style.color = "#444"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#222"; } }}
    >
      {copied ? "✓ copied" : "curl ↗"}
    </button>
  );
}

// ── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ code }: { code: number | null }) {
  if (!code) return <span className="text-gray-500 text-xs">—</span>;
  const color = code >= 200 && code < 300 ? "text-accent" : code >= 400 && code < 500 ? "text-yellow-400" : "text-red-400";
  return <span className={`font-mono text-xs font-medium ${color}`}>{code}</span>;
}

// ── Main client ───────────────────────────────────────────────────────────────

export default function UsageClient({
  logs,
  fromDate,
  toDate,
  dayCounts,
  callsThisMonth,
  plan = "free",
}: {
  logs: UsageLog[];
  fromDate: string;
  toDate: string;
  dayCounts: DayCount[];
  callsThisMonth: number;
  plan?: string;
}) {
  const router = useRouter();
  const [from, setFrom] = useState(fromDate);
  const [to, setTo] = useState(toDate);
  const [endpointFilter, setEndpointFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"logs" | "series" | "endpoints">("logs");

  const endpointCounts = logs.reduce<Record<string, number>>((acc, l) => {
    if (l.endpoint) acc[l.endpoint] = (acc[l.endpoint] ?? 0) + 1;
    return acc;
  }, {});
  const uniqueEndpoints = Object.entries(endpointCounts).sort((a, b) => b[1] - a[1]).map(([ep]) => ep);

  const filteredLogs = endpointFilter ? logs.filter((l) => l.endpoint === endpointFilter) : logs;
  const stats = computeStats(filteredLogs);

  function handleFilter(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/dashboard/usage?from=${from}&to=${to}`);
  }

  function handleExportCsv() {
    const headers = ["timestamp", "endpoint", "series", "status", "latency_ms", "key_prefix"];
    const rows = filteredLogs.map((l) => [
      l.created_at,
      l.endpoint,
      (l.series_requested ?? []).join("|"),
      l.status_code ?? "",
      l.response_time_ms ?? "",
      l.key_prefix,
    ]);
    const csv = [headers, ...rows].map((r) => r.map(String).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `costsignal-usage-${from}-to-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleExportPdf() {
    window.print();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5 print:space-y-4">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 className="text-2xl font-bold text-white mb-0.5">Usage Analytics</h1>
          <p className="text-sm text-gray-500">API call logs, series breakdown &amp; quota tracking</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
          <button
            onClick={handleExportCsv}
            disabled={filteredLogs.length === 0}
            style={{
              padding: "0.45rem 1rem",
              fontSize: "0.78rem",
              fontWeight: 600,
              borderRadius: "7px",
              border: "1px solid #222",
              background: "transparent",
              color: filteredLogs.length === 0 ? "#333" : "#aaa",
              cursor: filteredLogs.length === 0 ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
          >
            {filteredLogs.length === 0 ? "No data" : "↓ CSV"}
          </button>
          <button
            onClick={handleExportPdf}
            style={{
              padding: "0.45rem 1rem",
              fontSize: "0.78rem",
              fontWeight: 600,
              borderRadius: "7px",
              border: "1px solid #222",
              background: "transparent",
              color: "#aaa",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            🖨 PDF
          </button>
        </div>
      </div>

      {/* 7-day activity chart */}
      <WeeklyUsageChart days={dayCounts} />

      {/* Cost estimate card */}
      <CostEstimateCard callsThisMonth={callsThisMonth} plan={plan} />

      {/* Stats summary */}
      {logs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Calls", value: stats.total.toLocaleString(), color: "#fff" },
            {
              label: "Success Rate",
              value: stats.successRate != null ? `${stats.successRate}%` : "—",
              color: stats.successRate != null && stats.successRate >= 99 ? "#4ade80" : stats.successRate != null && stats.successRate >= 95 ? "#facc15" : "#f87171",
            },
            {
              label: "Avg Latency",
              value: stats.avgLatency != null ? `${stats.avgLatency}ms` : "—",
              color: stats.avgLatency != null && stats.avgLatency < 200 ? "#4ade80" : stats.avgLatency != null && stats.avgLatency < 500 ? "#facc15" : "#f87171",
            },
            { label: "Unique Series", value: stats.uniqueSeries > 0 ? stats.uniqueSeries.toLocaleString() : "—", color: "#fff" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-bg2 border border-border rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1.5 font-medium tracking-wide uppercase">{label}</div>
              <div className="text-xl font-bold" style={{ color }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Date range filter */}
      <form onSubmit={handleFilter} className="bg-bg2 border border-border rounded-xl p-4 flex items-end gap-4 flex-wrap">
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent/50 transition-colors" />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent/50 transition-colors" />
        </div>
        <button type="submit" className="px-4 py-2 text-sm font-medium rounded-lg bg-accent text-black hover:bg-accent-dim transition-colors">
          Apply
        </button>
      </form>

      {/* Endpoint filter pills */}
      {uniqueEndpoints.length > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.72rem", color: "#555", marginRight: "0.25rem" }}>Filter:</span>
          <button
            onClick={() => setEndpointFilter(null)}
            style={{ padding: "0.25rem 0.75rem", borderRadius: "100px", fontSize: "0.72rem", fontWeight: endpointFilter === null ? 700 : 400, fontFamily: "monospace", cursor: "pointer", border: `1px solid ${endpointFilter === null ? "#4ade80" : "#222"}`, background: endpointFilter === null ? "#0d2e1a" : "transparent", color: endpointFilter === null ? "#4ade80" : "#555", transition: "all 0.15s" }}
          >
            All ({logs.length})
          </button>
          {uniqueEndpoints.map((ep) => (
            <button
              key={ep}
              onClick={() => setEndpointFilter(endpointFilter === ep ? null : ep)}
              style={{ padding: "0.25rem 0.75rem", borderRadius: "100px", fontSize: "0.72rem", fontWeight: endpointFilter === ep ? 700 : 400, fontFamily: "monospace", cursor: "pointer", border: `1px solid ${endpointFilter === ep ? "#4ade80" : "#222"}`, background: endpointFilter === ep ? "#0d2e1a" : "transparent", color: endpointFilter === ep ? "#4ade80" : "#555", transition: "all 0.15s" }}
            >
              {ep} ({endpointCounts[ep]})
            </button>
          ))}
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display: "flex", gap: "0.125rem", borderBottom: "1px solid #1a1a1a" }}>
        {([
          { id: "logs", label: "Request Logs" },
          { id: "series", label: "By Series" },
          { id: "endpoints", label: "Top Endpoints" },
        ] as const).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{ background: "transparent", border: "none", borderBottom: `2px solid ${activeTab === id ? "#4ade80" : "transparent"}`, color: activeTab === id ? "#e8e8e8" : "#555", padding: "0.5rem 1rem", fontSize: "0.82rem", fontWeight: activeTab === id ? 600 : 400, cursor: "pointer", transition: "color 0.15s", marginBottom: "-1px" }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "series" && (
        <div className="bg-bg2 border border-border rounded-xl overflow-hidden">
          <div style={{ padding: "1rem 1.25rem 0.75rem", borderBottom: "1px solid #1a1a1a" }}>
            <h2 style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff", margin: 0 }}>Series call frequency</h2>
            <p style={{ fontSize: "0.72rem", color: "#555", margin: "0.2rem 0 0" }}>
              How many times each series slug appeared in requests · 7-day sparkline shows recent trend
            </p>
          </div>
          <SeriesBreakdown logs={filteredLogs} />
        </div>
      )}

      {activeTab === "endpoints" && (
        <div className="bg-bg2 border border-border rounded-xl overflow-hidden">
          <div style={{ padding: "1rem 1.25rem 0.75rem", borderBottom: "1px solid #1a1a1a" }}>
            <h2 style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff", margin: 0 }}>Top Endpoints</h2>
            <p style={{ fontSize: "0.72rem", color: "#555", margin: "0.2rem 0 0" }}>
              Which API routes are called most — with success rate and average latency
            </p>
          </div>
          <TopEndpoints logs={filteredLogs} />
        </div>
      )}

      {activeTab === "logs" && (
        <div className="bg-bg2 border border-border rounded-xl overflow-hidden">
          {filteredLogs.length === 0 ? (
            <div style={{ padding: "3.5rem 1.5rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.875rem" }}>{logs.length === 0 ? "📡" : "🔍"}</div>
              <p style={{ color: "#ccc", fontWeight: 600, fontSize: "0.9rem", margin: "0 0 0.375rem" }}>
                {logs.length === 0 ? "No API calls yet" : "No calls match this filter"}
              </p>
              <p style={{ color: "#444", fontSize: "0.78rem", margin: "0 0 1.25rem", lineHeight: 1.5 }}>
                {logs.length === 0
                  ? "Your usage logs will appear here once you start making API requests."
                  : "Try changing the date range or endpoint filter above."}
              </p>
              {logs.length === 0 && (
                <a href="/dashboard/keys" style={{ display: "inline-block", padding: "0.5rem 1.25rem", background: "#4ade80", color: "#000", fontWeight: 700, fontSize: "0.8rem", borderRadius: "7px", textDecoration: "none" }}>
                  Get your API key →
                </a>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-gray-400 text-xs">
                    <th className="text-left px-5 py-3 font-medium">Timestamp</th>
                    <th className="text-left px-5 py-3 font-medium">Endpoint</th>
                    <th className="text-left px-5 py-3 font-medium">Series</th>
                    <th className="text-left px-5 py-3 font-medium">Status</th>
                    <th className="text-left px-5 py-3 font-medium">Latency</th>
                    <th className="text-left px-5 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-bg/50 transition-colors">
                      <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-gray-300">{log.endpoint}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs max-w-[200px]">
                        <div className="flex flex-wrap gap-1">
                          {(log.series_requested ?? []).slice(0, 3).map((s) => (
                            <span key={s} className="px-1.5 py-0.5 bg-bg border border-border rounded text-gray-300 font-mono">
                              {s}
                            </span>
                          ))}
                          {(log.series_requested ?? []).length > 3 && (
                            <span className="text-gray-500">+{(log.series_requested ?? []).length - 3}</span>
                          )}
                          {!log.series_requested?.length && "—"}
                        </div>
                      </td>
                      <td className="px-5 py-3"><StatusBadge code={log.status_code} /></td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{log.response_time_ms != null ? `${log.response_time_ms}ms` : "—"}</td>
                      <td className="px-4 py-3"><CurlCopyButton log={log} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "logs" && logs.length >= 500 && (
        <p className="text-xs text-gray-500 text-center">
          Showing first 500 results. Narrow the date range for more specific results.
        </p>
      )}
    </div>
  );
}
