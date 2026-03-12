"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type UsageLog = {
  id: number;
  endpoint: string;
  series_requested: string[] | null;
  status_code: number | null;
  response_time_ms: number | null;
  created_at: string;
  key_prefix: string;
};

export default function UsageClient({
  logs,
  fromDate,
  toDate,
}: {
  logs: UsageLog[];
  fromDate: string;
  toDate: string;
}) {
  const router = useRouter();
  const [from, setFrom] = useState(fromDate);
  const [to, setTo] = useState(toDate);

  function handleFilter(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/dashboard/usage?from=${from}&to=${to}`);
  }

  function handleExportCsv() {
    const headers = ["Timestamp", "Endpoint", "Series", "Status", "Response Time (ms)", "Key Prefix"];
    const rows = logs.map((l) => [
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
            {logs.length} request{logs.length !== 1 ? "s" : ""} in selected range
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          disabled={logs.length === 0}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-bg2 border border-border text-gray-300 hover:text-white hover:border-gray-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ↓ Export CSV
        </button>
      </div>

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

      {/* Logs table */}
      <div className="bg-bg2 border border-border rounded-xl overflow-hidden">
        {logs.length === 0 ? (
          <div className="px-5 py-14 text-center text-gray-500 text-sm">
            No API calls in this date range.
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
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
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
