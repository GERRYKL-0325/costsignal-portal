import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { getActiveKey } from "@/lib/api-keys";
import CopyButton from "@/components/CopyButton";
import { WeeklyUsageChart, RecentPresets } from "@/components/DashboardCharts";
import { PLANS, type PlanId } from "@/lib/plans";
import OnboardingModal from "@/components/OnboardingModal";

type SavedConfig = {
  id: string;
  name: string;
  series_slugs: string[];
  from_year: number | null;
  to_year: number | null;
  format: string | null;
  description: string | null;
};

async function getDashboardStats(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Build last-7-days date boundaries (local day in UTC for simplicity)
  const days7: { date: string; start: string; end: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).toISOString();
    const label = d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
    days7.push({ date: label, start, end });
  }
  const sevenDaysAgo = days7[0].start;

  const { data: dbUser } = await supabaseAdmin
    .from("users")
    .select("id, plan")
    .eq("clerk_user_id", userId)
    .single();

  if (!dbUser) return null;

  const [callsResult, configsResult, recentResult, last7DaysLogs, recentPresetsResult, monthSeriesLogs] =
    await Promise.all([
      supabaseAdmin
        .from("usage_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", dbUser.id)
        .gte("created_at", startOfMonth),
      supabaseAdmin
        .from("saved_configs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", dbUser.id),
      supabaseAdmin
        .from("usage_logs")
        .select("endpoint, series_requested, created_at, status_code, response_time_ms")
        .eq("user_id", dbUser.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabaseAdmin
        .from("usage_logs")
        .select("created_at")
        .eq("user_id", dbUser.id)
        .gte("created_at", sevenDaysAgo)
        .order("created_at", { ascending: true }),
      supabaseAdmin
        .from("saved_configs")
        .select("id, name, description, series_slugs, from_year, to_year, format")
        .eq("user_id", dbUser.id)
        .order("created_at", { ascending: false })
        .limit(3),
      supabaseAdmin
        .from("usage_logs")
        .select("series_requested")
        .eq("user_id", dbUser.id)
        .gte("created_at", startOfMonth)
        .not("series_requested", "is", null),
    ]);

  // Bucket last-7-days logs into daily counts
  const logsForChart = last7DaysLogs.data ?? [];
  const dayCounts = days7.map(({ date, start, end }) => ({
    date,
    count: logsForChart.filter(
      (l) => l.created_at >= start && l.created_at < end
    ).length,
  }));

  // Tally top series this month
  const seriesCount: Record<string, number> = {};
  for (const row of (monthSeriesLogs.data ?? [])) {
    for (const slug of (row.series_requested ?? [])) {
      seriesCount[slug] = (seriesCount[slug] ?? 0) + 1;
    }
  }
  const topSeries = Object.entries(seriesCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([slug, count]) => ({ slug, count }));

  return {
    dbUserId: dbUser.id,
    plan: (dbUser.plan ?? "free") as PlanId,
    callsThisMonth: callsResult.count ?? 0,
    savedPresets: configsResult.count ?? 0,
    recentCalls: recentResult.data ?? [],
    dayCounts,
    recentPresets: (recentPresetsResult.data ?? []) as SavedConfig[],
    topSeries,
  };
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const firstName = user?.firstName ?? "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const stats = await getDashboardStats(userId);
  const activeKey = stats ? await getActiveKey(stats.dbUserId) : null;

  const plan = stats?.plan ?? "free";
  const planDetails = PLANS[plan];
  const isFree = plan === "free";
  const planBadgeStyle: Record<PlanId, { bg: string; color: string }> = {
    free: { bg: "#2a2a2a", color: "#aaa" },
    pro: { bg: "#1e3a5f", color: "#60a5fa" },
    api: { bg: "#0d2e1a", color: "#4ade80" },
  };
  const badge = planBadgeStyle[plan];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <OnboardingModal />
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {greeting}, {firstName}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Your CostSignal account hub
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span style={{
            background: badge.bg, color: badge.color,
            fontSize: "0.72rem", fontWeight: 700, padding: "0.25rem 0.75rem",
            borderRadius: "100px", letterSpacing: "0.05em", textTransform: "uppercase",
          }}>
            {planDetails.label}
          </span>
          {isFree && (
            <Link href="/pricing" style={{
              fontSize: "0.8rem", fontWeight: 600, color: "#000",
              background: "#4ade80", padding: "0.35rem 0.875rem",
              borderRadius: "6px", textDecoration: "none",
            }}>
              Upgrade →
            </Link>
          )}
        </div>
      </div>

      {/* ── Launch section — two big CTA cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href="/builder"
          style={{
            display: "block",
            background: "#111",
            border: "2px solid #4ade80",
            borderRadius: "16px",
            padding: "2rem 1.75rem",
            textDecoration: "none",
            transition: "background 0.15s",
          }}
        >
          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem" }}>
            Open Builder →
          </div>
          <div style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.5 }}>
            Build cost models with 200+ economic series
          </div>
        </a>
        <a
          href="https://costsignal.io/tam"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            background: "#111",
            border: "1px solid #1e1e1e",
            borderRadius: "16px",
            padding: "2rem 1.75rem",
            textDecoration: "none",
            transition: "background 0.15s",
          }}
        >
          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem" }}>
            TAM Calculator →
          </div>
          <div style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.5 }}>
            Estimate total addressable markets with live cost data
          </div>
        </a>
      </div>

      {/* ── Quick access — 3 smaller cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* API Key */}
        <Link
          href="/dashboard/keys"
          style={{
            display: "block",
            background: "#111",
            border: "1px solid #1e1e1e",
            borderRadius: "12px",
            padding: "1.25rem",
            textDecoration: "none",
          }}
        >
          <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "#555", marginBottom: "0.5rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Your API Key
          </div>
          {activeKey ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <code style={{ fontSize: "0.85rem", color: "#e8e8e8", fontFamily: "monospace" }}>
                {activeKey.key_prefix}••••••
              </code>
            </div>
          ) : (
            <div style={{ fontSize: "0.85rem", color: "#4ade80", fontWeight: 600 }}>
              Generate a key →
            </div>
          )}
        </Link>

        {/* API Calls — usage meter */}
        <Link
          href="/dashboard/usage"
          style={{
            display: "block",
            background: "#111",
            border: "1px solid #1e1e1e",
            borderRadius: "12px",
            padding: "1.25rem",
            textDecoration: "none",
          }}
        >
          <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "#555", marginBottom: "0.5rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            API Calls This Month
          </div>
          {(() => {
            const used = stats?.callsThisMonth ?? 0;
            const limit = planDetails.apiCallsPerMonth;
            const pct = Math.min(100, Math.round((used / limit) * 100));
            const barColor = pct >= 90 ? "#f87171" : pct >= 70 ? "#facc15" : "#4ade80";
            const textColor = pct >= 90 ? "#f87171" : pct >= 70 ? "#facc15" : "#fff";
            return (
              <>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem", marginBottom: "0.6rem" }}>
                  <span style={{ fontSize: "1.5rem", fontWeight: 700, color: textColor, lineHeight: 1 }}>
                    {used.toLocaleString()}
                  </span>
                  <span style={{ fontSize: "0.78rem", color: "#444" }}>
                    / {limit.toLocaleString()}
                  </span>
                </div>
                {/* progress bar */}
                <div style={{ height: "4px", background: "#1e1e1e", borderRadius: "100px", overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: barColor,
                    borderRadius: "100px",
                    transition: "width 0.4s ease",
                  }} />
                </div>
                <div style={{ marginTop: "0.35rem", fontSize: "0.68rem", color: "#444" }}>
                  {pct >= 90
                    ? <span style={{ color: "#f87171", fontWeight: 600 }}>Limit nearly reached</span>
                    : pct >= 70
                    ? <span style={{ color: "#facc15" }}>{pct}% used</span>
                    : `${pct}% used`}
                </div>
              </>
            );
          })()}
        </Link>

        {/* Saved Presets */}
        <Link
          href="/dashboard/platform"
          style={{
            display: "block",
            background: "#111",
            border: "1px solid #1e1e1e",
            borderRadius: "12px",
            padding: "1.25rem",
            textDecoration: "none",
          }}
        >
          <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "#555", marginBottom: "0.5rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Saved Presets
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff" }}>
            {stats?.savedPresets ?? 0}
          </div>
        </Link>
      </div>

      {/* Copy key inline if they have one */}
      {activeKey && (
        <div style={{
          background: "#111",
          border: "1px solid #1e1e1e",
          borderRadius: "12px",
          padding: "1rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <code style={{ fontSize: "0.82rem", color: "#999", fontFamily: "monospace" }}>
              {activeKey.key_prefix}••••••••••••••••••••••
            </code>
            <CopyButton value={activeKey.key_prefix} label="Copy prefix" />
          </div>
          <Link href="/dashboard/keys" style={{ fontSize: "0.78rem", color: "#4ade80", textDecoration: "none", fontWeight: 600 }}>
            Manage keys →
          </Link>
        </div>
      )}

      {/* ── Activity row: weekly chart + recent presets ── */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <WeeklyUsageChart days={stats.dayCounts} />
          {stats.recentPresets.length > 0 ? (
            <RecentPresets configs={stats.recentPresets} />
          ) : (
            /* Placeholder card when no presets saved yet */
            <div style={{
              background: "#111",
              border: "1px solid #1e1e1e",
              borderRadius: "12px",
              overflow: "hidden",
            }}>
              <div style={{
                padding: "1rem 1.25rem 0.75rem",
                borderBottom: "1px solid #1a1a1a",
              }}>
                <h2 style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff", margin: 0 }}>
                  Recent presets
                </h2>
              </div>
              <div style={{
                padding: "2rem 1.25rem",
                textAlign: "center",
                color: "#333",
                fontSize: "0.8rem",
                lineHeight: 1.6,
              }}>
                No presets yet.{" "}
                <a
                  href="/builder"
                  style={{ color: "#4ade80", textDecoration: "none" }}
                >
                  Save one from the Builder →
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Top series this month ── */}
      {stats && stats.topSeries.length > 0 && (
        <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px", overflow: "hidden" }}>
          <div style={{
            padding: "1rem 1.25rem 0.75rem",
            borderBottom: "1px solid #1a1a1a",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <h2 style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff", margin: 0 }}>
              Top series this month
            </h2>
            <span style={{ fontSize: "0.7rem", color: "#444" }}>
              by API call frequency
            </span>
          </div>
          <div style={{ padding: "0.75rem 1.25rem 1rem" }}>
            {(() => {
              const max = stats.topSeries[0]?.count ?? 1;
              return stats.topSeries.map(({ slug, count }, i) => {
                const pct = Math.round((count / max) * 100);
                const rank = i + 1;
                return (
                  <div key={slug} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: i < stats.topSeries.length - 1 ? "0.6rem" : 0 }}>
                    <span style={{ fontSize: "0.65rem", color: "#333", width: "1rem", textAlign: "right", flexShrink: 0 }}>
                      {rank}
                    </span>
                    <code style={{ fontSize: "0.72rem", color: "#aaa", fontFamily: "monospace", width: "13rem", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {slug}
                    </code>
                    <div style={{ flex: 1, height: "4px", background: "#1a1a1a", borderRadius: "100px", overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: rank === 1 ? "#4ade80" : "#2a4a3a",
                        borderRadius: "100px",
                      }} />
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "#555", width: "2.5rem", textAlign: "right", flexShrink: 0 }}>
                      {count}×
                    </span>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* ── Recent API activity (collapsed by default) ── */}
      <details style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px", overflow: "hidden" }}>
        <summary style={{
          padding: "1rem 1.25rem",
          cursor: "pointer",
          fontSize: "0.875rem",
          fontWeight: 600,
          color: "#fff",
          listStyle: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span>Recent API activity</span>
          <span style={{ fontSize: "0.75rem", color: "#555" }}>
            {stats ? `${stats.recentCalls.length} recent` : ""}
          </span>
        </summary>
        {!stats || stats.recentCalls.length === 0 ? (
          <div style={{ padding: "1.5rem", textAlign: "center", color: "#555", fontSize: "0.82rem" }}>
            No calls yet. Start using your API key to see activity here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-border text-gray-400 text-xs">
                  <th className="text-left px-5 py-3 font-medium">Endpoint</th>
                  <th className="text-left px-5 py-3 font-medium">Series</th>
                  <th className="text-left px-5 py-3 font-medium">Time</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.recentCalls.map((call, i) => (
                  <tr key={i} className="hover:bg-bg/50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-gray-300">
                      {call.endpoint}
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs max-w-[200px] truncate">
                      {call.series_requested?.join(", ") ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(call.created_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge code={call.status_code} />
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {call.response_time_ms != null
                        ? `${call.response_time_ms}ms`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </details>
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
  return <span className={`font-mono text-xs font-medium ${color}`}>{code}</span>;
}
