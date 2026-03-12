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

  const { data: logs } = await supabaseAdmin
    .from("usage_logs")
    .select(
      "id, endpoint, series_requested, status_code, response_time_ms, created_at, key_prefix"
    )
    .eq("user_id", dbUser.id)
    .gte("created_at", `${fromDate}T00:00:00Z`)
    .lte("created_at", `${toDate}T23:59:59Z`)
    .order("created_at", { ascending: false })
    .limit(500);

  return (
    <UsageClient
      logs={logs ?? []}
      fromDate={fromDate}
      toDate={toDate}
    />
  );
}
