import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

async function getDbUser(userId: string) {
  const { data } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();
  return data;
}

// POST /api/user/downloads — log a download
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await getDbUser(userId);
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { series_slugs, format, from_year, to_year } = body;

  const { data, error } = await supabaseAdmin
    .from("download_history")
    .insert({
      user_id: dbUser.id,
      series_slugs: series_slugs ?? null,
      format: format ?? null,
      from_year: from_year ?? null,
      to_year: to_year ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ download: data }, { status: 201 });
}

// GET /api/user/downloads — list recent downloads
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await getDbUser(userId);
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { data, error } = await supabaseAdmin
    .from("download_history")
    .select("*")
    .eq("user_id", dbUser.id)
    .order("downloaded_at", { ascending: false })
    .limit(25);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ downloads: data ?? [] });
}
