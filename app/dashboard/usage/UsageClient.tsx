"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { WeeklyUsageChart } from "@/components/DashboardCharts";

type UsageLog = {
  id: number;
  endpoint: string;
  series_requested: string[] | null;
  status_code: number | null;
  response_time_ms: number | null;
  created_at: string;
  key_prefix: string;
};

function computeStats(logs: UsageLog[]) {
  const total = logs.length;
  const successful = logs.filter((l) => l.status_code != null && l.status_code >= 200 && l.status_code < 300).length;
  const successRate = total > 0 ? Math.round((successful / total) * 100) : null;
  const latencies = logs.map((l) => l.response_time_ms).filter((l): l is number => l != null);
  const avgLatency = latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : null;
  const uniqueSeries = new Set(logs.flatMap((l) => l.series_requested ?? [])).size;
  return { total, successRate, avgLatency, uniqueSeries };
}

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
      onMouseEnter={(e) => {
        if (!copied) {
          (e.currentTarget as HTMLButtonElement).style.color = "#aaa";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#333";
        }
      }}
      onMouseLeave={(e) => {
        if (!copied) {
          (e.currentTarget as HTMLButtonElement).style.color = "#444";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#222";
        }
      }}
    >
      {copied ? "✓ copied" : "curl ↗"}
    </button>
  );
}

type DayCount = { date: string; count: number };

export default function UsageClient({
  logs,
  fromDate,
  toDate,
  dayCounts,
  callsThisMonth,
}: {
  logs: UsageLog[];
  fromDate: string;
  toDate: string;
  dayCounts: DayCount[];
  callsThisMonth: number;
}) {
  const router = useRouter();
  const [from, setFrom] = useState(fromDate);
  const [to, setTo] = useState(toDate);
  const [endpointFilter, setEndpointFilter] = useState<string | null>(null);

  // Derive unique endpoints sorted by frequency
  const endpointCounts = logs.reduce<Record<string, number>>((acc, l) => {
    if (l.endpoint) acc[l.endpoint] = (acc[l.endpoint] ?? 0) + 1;
    return acc;
  }, {});
  const uniqueEndpoints = Object.entries(endpointCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([ep]) => ep);

  const filteredLogs = endpointFilter
    ? logs.filter((l) => l.endpoint === endpointFilter)
    : logs;

  const stats = computeStats(filteredLogs);

  function handleFilter(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/dashboard/usage?from=${from}&to=${to}`);
  }

  function handleExportCsv() {
    const headers = ["Timestamp", "Endpoint", "Series", "Status", "Response Time (ms)", "Key Prefix"];
    const rows = filteredLogs.map((l) => [
      l.created_at,
      l.endpoint,
      (l.series_requested ?? []).join(";"),
      l.status_code ?? "",
      l.response_time_ms ?? "",
      l.key_prefix,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `costsignal-usage-${fromDate}-${toDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Usage Logs</h1>
          <p className="text-gray-400 text-sm mt-1">
            {filteredLogs.length}{filteredLogs.length !== logs.length ? ` of ${logs.length}` : ""} request{filteredLogs.length !== 1 ? "s" : ""} in selected range
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Monthly calls badge */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "#111",
            border: "1px solid #1e1e1e",
            borderRadius: "10px",
            padding: "0.45rem 0.875rem",
          }}>
            <span style={{ fontSize: "0.68rem", color: "#555", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              This month
            </span>
            <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#4ade80" }}>
              {callsThisMonth.toLocaleString()}
            </span>
            <span style={{ fontSize: "0.68rem", color: "#444" }}>calls</span>
          </div>
          <button
            onClick={handleExportCsv}
            disabled={filteredLogs.length === 0}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-bg2 border border-border text-gray-300 hover:text-white hover:border-gray-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ↓ Export CSV
          </button>
        </div>
      </div>

      {/* 7-day activity chart */}
      <WeeklyUsageChart days={dayCounts} />

      {/* Stats summary */}
      {logs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Total Calls",
              value: stats.total.toLocaleString(),
              color: "#fff",
            },
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
            {
              label: "Unique Series",
              value: stats.uniqueSeries > 0 ? stats.uniqueSeries.toLocaleString() : "—",
              color: "#fff",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-bg2 border border-border rounded-xl p-4"
            >
              <div className="text-xs text-gray-500 mb-1.5 font-medium tracking-wide uppercase">
                {label}
              </div>
              <div className="text-xl font-bold" style={{ color }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Date range filter */}
      <form
        onSubmit={handleFilter}
        className="bg-bg2 border border-border rounded-xl p-4 flex items-end gap-4 flex-wrap"
      >
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium rounded-lg bg-accent text-black hover:bg-accent-dim transition-colors"
        >
          Apply
        </button>
      </form>

      {/* Endpoint filter pills */}
      {uniqueEndpoints.length > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.72rem", color: "#555", marginRight: "0.25rem" }}>Filter:</span>
          <button
            onClick={() => setEndpointFilter(null)}
            style={{
              padding: "0.25rem 0.75rem",
              borderRadius: "100px",
              fontSize: "0.72rem",
              fontWeight: endpointFilter === null ? 700 : 400,
              fontFamily: "monospace",
              cursor: "pointer",
              border: `1px solid ${endpointFilter === null ? "#4ade80" : "#222"}`,
              background: endpointFilter === null ? "#0d2e1a" : "transparent",
              color: endpointFilter === null ? "#4ade80" : "#555",
              transition: "all 0.15s",
            }}
          >
            All ({logs.length})
          </button>
          {uniqueEndpoints.map((ep) => (
            <button
              key={ep}
              onClick={() => setEndpointFilter(endpointFilter === ep ? null : ep)}
              style={{
                padding: "0.25rem 0.75rem",
                borderRadius: "100px",
                fontSize: "0.72rem",
                fontWeight: endpointFilter === ep ? 700 : 400,
                fontFamily: "monospace",
                cursor: "pointer",
                border: `1px solid ${endpointFilter === ep ? "#4ade80" : "#222"}`,
                background: endpointFilter === ep ? "#0d2e1a" : "transparent",
                color: endpointFilter === ep ? "#4ade80" : "#555",
                transition: "all 0.15s",
              }}
            >
              {ep} ({endpointCounts[ep]})
            </button>
          ))}
        </div>
      )}

      {/* Logs table */}
      <div className="bg-bg2 border border-border rounded-xl overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="px-5 py-14 text-center text-gray-500 text-sm">
            {logs.length === 0 ? "No API calls in this date range." : "No calls match the selected endpoint filter."}
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
                    <td className="px-5 py-3 font-mono text-xs text-gray-300">
                      {log.endpoint}
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs max-w-[200px]">
                      <div className="flex flex-wrap gap-1">
                        {(log.series_requested ?? []).slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="px-1.5 py-0.5 bg-bg border border-border rounded text-gray-300 font-mono"
                          >
                            {s}
                          </span>
                        ))}
                        {(log.series_requested ?? []).length > 3 && (
                          <span className="text-gray-500">
                            +{(log.series_requested ?? []).length - 3}
                          </span>
                        )}
                        {!log.series_requested?.length && "—"}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge code={log.status_code} />
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {log.response_time_ms != null
                        ? `${log.response_time_ms}ms`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <CurlCopyButton log={log} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {logs.length >= 500 && (
        <p className="text-xs text-gray-500 text-center">
          Showing first 500 results. Narrow the date range for more specific results.
        </p>
      )}
    </div>
  );
}

function StatusBadge({ code }: { code: number | null }) {
  if (!code) return <span className="text-gray-500 text-xs">—</span>;
  const color =
    code >= 200 && code < 300
      ? "text-accent"
      : code >= 400 && code < 500
      ? "text-yellow-400"
      : "text-red-400";
  return (
    <span className={`font-mono text-xs font-medium ${color}`}>{code}</span>
  );
}
