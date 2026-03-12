import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

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

  return NextResponse.json({
    plan: dbUser.plan ?? "free",
    plan_started_at: dbUser.plan_started_at,
  });
}
