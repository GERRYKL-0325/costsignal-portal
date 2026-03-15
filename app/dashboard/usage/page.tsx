import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import UsageClient from "./UsageClient";

export default async function UsagePage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const params = await Promise.resolve(searchParams);

  // Get Supabase user
  const { data: dbUser } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  if (!dbUser) {
    return (
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Usage Logs</h1>
        <p className="text-gray-400 text-sm">
          No usage data yet. Make your first API call to see logs here.
        </p>
      </div>
    );
  }

  // Date range
  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const defaultTo = now.toISOString().split("T")[0];

  const fromDate = params.from ?? defaultFrom;
  const toDate = params.to ?? defaultTo;

  // Build last-7-days buckets
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

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Parallel fetches: filtered logs + last 7 days raw logs + monthly count
  const [logsResult, last7DaysResult, monthCountResult] = await Promise.all([
    supabaseAdmin
      .from("usage_logs")
      .select(
        "id, endpoint, series_requested, status_code, response_time_ms, created_at, key_prefix"
      )
      .eq("user_id", dbUser.id)
      .gte("created_at", `${fromDate}T00:00:00Z`)
      .lte("created_at", `${toDate}T23:59:59Z`)
      .order("created_at", { ascending: false })
      .limit(500),
    supabaseAdmin
      .from("usage_logs")
      .select("created_at")
      .eq("user_id", dbUser.id)
      .gte("created_at", sevenDaysAgo)
      .order("created_at", { ascending: true }),
    supabaseAdmin
      .from("usage_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", dbUser.id)
      .gte("created_at", startOfMonth),
  ]);

  // Bucket last-7-days logs into daily counts
  const logsForChart = last7DaysResult.data ?? [];
  const dayCounts = days7.map(({ date, start, end }) => ({
    date,
    count: logsForChart.filter(
      (l) => l.created_at >= start && l.created_at < end
    ).length,
  }));

  return (
    <UsageClient
      logs={logsResult.data ?? []}
      fromDate={fromDate}
      toDate={toDate}
      dayCounts={dayCounts}
      callsThisMonth={monthCountResult.count ?? 0}
    />
  );
}
