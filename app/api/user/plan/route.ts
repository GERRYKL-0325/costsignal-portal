import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { PLANS, type PlanId } from "@/lib/plans";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: dbUser, error } = await supabaseAdmin
    .from("users")
    .select("id, plan, plan_started_at")
    .eq("clerk_user_id", userId)
    .single();

  if (error || !dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const plan = (dbUser.plan ?? "free") as PlanId;
  const planDetails = PLANS[plan];

  return NextResponse.json({
    plan,
    plan_started_at: dbUser.plan_started_at,
    savedConfigs: planDetails.savedConfigs,
    apiCallsPerMonth: planDetails.apiCallsPerMonth,
    maxSeries: planDetails.maxSeries,
    maxDownloadsPerMonth: planDetails.maxDownloadsPerMonth,
    historyYears: planDetails.historyYears,
    apiAccess: planDetails.apiAccess,
  });
}
