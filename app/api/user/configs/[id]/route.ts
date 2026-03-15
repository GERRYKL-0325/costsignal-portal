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

// PATCH /api/user/configs/[id] — update name and/or description
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await getDbUser(userId);
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const updates: Record<string, string | null> = {};
  if (typeof body.name === "string" && body.name.trim()) {
    updates.name = body.name.trim().slice(0, 80);
  }
  if ("description" in body) {
    updates.description = typeof body.description === "string" ? body.description.trim().slice(0, 200) || null : null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("saved_configs")
    .update(updates)
    .eq("id", id)
    .eq("user_id", dbUser.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ config: data });
}

// DELETE /api/user/configs/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await getDbUser(userId);
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { id } = await params;

  const { error } = await supabaseAdmin
    .from("saved_configs")
    .delete()
    .eq("id", id)
    .eq("user_id", dbUser.id); // ensures ownership

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
