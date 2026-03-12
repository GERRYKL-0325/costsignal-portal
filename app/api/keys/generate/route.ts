import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateApiKey, rotateKey } from "@/lib/api-keys";

/**
 * POST /api/keys/generate
 *
 * Generates (or rotates) an API key for the authenticated user.
 *
 * Body: { rotate?: boolean }
 * Response: { rawKey: string; key: { id, key_prefix, created_at, last_used_at, label } }
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? "";

  // Ensure user exists in Supabase
  let dbUserId: string;
  const { data: existing } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  if (existing) {
    dbUserId = existing.id;
  } else {
    const { data: newUser, error } = await supabaseAdmin
      .from("users")
      .insert({ clerk_user_id: userId, email })
      .select("id")
      .single();
    if (error || !newUser) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
    dbUserId = newUser.id;
  }

  const body = await req.json().catch(() => ({}));
  const shouldRotate = body?.rotate === true;

  const { rawKey } = shouldRotate
    ? await rotateKey(dbUserId)
    : await generateApiKey(dbUserId);

  // Fetch the new key record (without hash) to return metadata
  const { data: keyRecord } = await supabaseAdmin
    .from("api_keys")
    .select("id, key_prefix, created_at, last_used_at, label")
    .eq("user_id", dbUserId)
    .is("revoked_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return NextResponse.json({ rawKey, key: keyRecord });
}
