import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { PLANS } from "@/lib/plans";

async function getDbUser(userId: string) {
  const { data } = await supabaseAdmin
    .from("users")
    .select("id, plan")
    .eq("clerk_user_id", userId)
    .single();
  return data;
}

// GET /api/user/configs — list saved configs
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await getDbUser(userId);
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { data, error } = await supabaseAdmin
    .from("saved_configs")
    .select("*")
    .eq("user_id", dbUser.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ configs: data ?? [] });
}

// POST /api/user/configs — save a new config
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await getDbUser(userId);
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Check plan config limit
  const plan = (dbUser.plan ?? "free") as keyof typeof PLANS;
  const limit = PLANS[plan].savedConfigs;

  const { count } = await supabaseAdmin
    .from("saved_configs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", dbUser.id);

  if ((count ?? 0) >= limit) {
    return NextResponse.json(
      { error: `Plan limit reached. ${plan === "free" ? "Upgrade to save more configurations." : ""}` },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { name, description, series_slugs, from_year, to_year, format } = body;

  if (!name || !series_slugs?.length) {
    return NextResponse.json({ error: "name and series_slugs are required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("saved_configs")
    .insert({
      user_id: dbUser.id,
      name,
      description: description ?? null,
      series_slugs,
      from_year: from_year ?? null,
      to_year: to_year ?? null,
      format: format ?? "wide",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ config: data }, { status: 201 });
}
