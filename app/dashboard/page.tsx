import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { getActiveKey } from "@/lib/api-keys";
import CopyButton from "@/components/CopyButton";
import { PLANS, type PlanId } from "@/lib/plans";
import { WeeklyUsageChart, RecentPresets } from "@/components/DashboardCharts";

async function getDashboardStats(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Get Supabase user
  const { data: dbUser } = await supabaseAdmin
    .from("users")
    .select("id, plan")
    .eq("clerk_user_id", userId)
    .single();

  if (!dbUser) return null;

  // 7-day window for bar chart
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [callsResult, keysResult, avgResult, recentResult, weekResult, configsResult] = await Promise.all([
    // Calls this month
    supabaseAdmin
      .from("usage_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", dbUser.id)
      .gte("created_at", startOfMonth),
    // Active keys count
    supabaseAdmin
      .from("api_keys")
      .select("id", { count: "exact", head: true })
      .eq("user_id", dbUser.id)
      .is("revoked_at", null),
    // Avg response time this month
    supabaseAdmin
      .from("usage_logs")
      .select("response_time_ms")
      .eq("user_id", dbUser.id)
      .gte("created_at", startOfMonth)
      .not("response_time_ms", "is", null),
    // Recent 10 calls
    supabaseAdmin
      .from("usage_logs")
      .select("endpoint, series_requested, created_at, status_code, response_time_ms")
      .eq("user_id", dbUser.id)
      .order("created_at", { ascending: false })
      .limit(10),
    // Last 7 days of calls (for bar chart — just timestamps)
    supabaseAdmin
      .from("usage_logs")
      .select("created_at")
      .eq("user_id", dbUser.id)
      .gte("created_at", sevenDaysAgo.toISOString()),
    // Recent saved configs (for quick-launch cards)
    supabaseAdmin
      .from("saved_configs")
      .select("id, name, series_slugs, from_year, to_year, format, description")
      .eq("user_id", dbUser.id)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const avgMs =
    avgResult.data && avgResult.data.length > 0
      ? Math.round(
          avgResult.data.reduce((sum, r) => sum + (r.response_time_ms ?? 0), 0) /
            avgResult.data.length
        )
      : null;

  // Build 7-day daily buckets
  const dayCountMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" }); // e.g. "Mon 10"
    dayCountMap[key] = 0;
  }
  (weekResult.data ?? []).forEach((row) => {
    const d = new Date(row.created_at);
    const key = d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
    if (key in dayCountMap) dayCountMap[key]++;
  });
  const weeklyDays = Object.entries(dayCountMap).map(([date, count]) => ({ date, count }));

  return {
    dbUserId: dbUser.id,
    plan: (dbUser.plan ?? "free") as PlanId,
    callsThisMonth: callsResult.count ?? 0,
    activeKeys: keysResult.count ?? 0,
    avgResponseMs: avgMs,
    recentCalls: recentResult.data ?? [],
    weeklyDays,
    recentConfigs: configsResult.data ?? [],
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
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Here&apos;s your CostSignal API activity at a glance.
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
          {isFree ? (
            <Link href="/pricing" style={{
              fontSize: "0.8rem", fontWeight: 600, color: "#000",
              background: "#4ade80", padding: "0.35rem 0.875rem",
              borderRadius: "6px", textDecoration: "none",
            }}>
              Upgrade →
            </Link>
          ) : (
            <a href="mailto:hello@costsignal.io?subject=CostSignal%20Plan%20Management" style={{
              fontSize: "0.8rem", color: "#aaa", border: "1px solid #2a2a2a",
              padding: "0.35rem 0.875rem", borderRadius: "6px", textDecoration: "none",
            }}>
              Manage plan
            </a>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="API calls this month"
          value={stats?.callsThisMonth.toLocaleString() ?? "—"}
          sub={`Since ${new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`}
        />
        <StatCard
          label="Active keys"
          value={stats?.activeKeys.toString() ?? "—"}
          sub="Non-revoked keys"
        />
        <StatCard
          label="Avg response time"
          value={
            stats?.avgResponseMs != null ? `${stats.avgResponseMs} ms` : "—"
          }
          sub="This month"
        />
      </div>

      {/* Usage chart + recent presets side-by-side */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <WeeklyUsageChart days={stats.weeklyDays} />
          </div>
          <div className="lg:col-span-2">
            {stats.recentConfigs.length > 0 ? (
              <RecentPresets configs={stats.recentConfigs} />
            ) : (
              <div
                style={{
                  background: "#111",
                  border: "1px solid #1e1e1e",
                  borderRadius: "12px",
                  padding: "1.5rem 1.25rem",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: "0.8rem", color: "#333", margin: 0 }}>No saved presets yet</p>
                <a
                  href="https://costsignal.io/builder"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "0.78rem", color: "#4ade80",
                    textDecoration: "none", fontWeight: 600,
                  }}
                >
                  Open Builder →
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick key copy */}
      {activeKey && (
        <div className="bg-bg2 border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Your API Key</h2>
            <a
              href="/dashboard/keys"
              className="text-xs text-accent hover:underline"
            >
              Manage keys →
            </a>
          </div>
          <div className="flex items-center gap-3">
            <code className="flex-1 font-mono text-sm bg-bg border border-border rounded-lg px-4 py-2.5 text-gray-300">
              {activeKey.key_prefix}••••••••••••••••••••••
            </code>
            <CopyButton value={`${activeKey.key_prefix}••••••••••••••••••••••`} label="Copy prefix" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Full key was shown once at creation. Go to{" "}
            <a href="/dashboard/keys" className="text-accent hover:underline">
              API Keys
            </a>{" "}
            to regenerate.
          </p>
        </div>
      )}

      {/* Recent calls */}
      <div className="bg-bg2 border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-white">Recent API Calls</h2>
        </div>
        {!stats || stats.recentCalls.length === 0 ? (
          <div className="px-5 py-10 text-center text-gray-500 text-sm">
            No calls yet. Start using your API key to see activity here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-gray-400 text-xs">
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
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="bg-bg2 border border-border rounded-xl p-5">
      <p className="text-xs text-gray-400 mb-2">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
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
