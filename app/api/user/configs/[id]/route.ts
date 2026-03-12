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
