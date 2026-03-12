import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { generateApiKey, getActiveKey } from "@/lib/api-keys";
import KeysClient from "./KeysClient";

async function ensureUser(clerkUserId: string, email: string) {
  // Upsert user row
  const { data: existing } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (existing) return existing.id;

  const { data: newUser, error } = await supabaseAdmin
    .from("users")
    .insert({ clerk_user_id: clerkUserId, email })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to create user: ${error.message}`);
  return newUser.id;
}

export default async function KeysPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // We need email — get it from Clerk
  const { currentUser } = await import("@clerk/nextjs/server");
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? "";

  const dbUserId = await ensureUser(userId, email);
  let activeKey = await getActiveKey(dbUserId);

  // First visit — auto-generate key
  let newlyGeneratedKey: string | null = null;
  if (!activeKey) {
    const { rawKey } = await generateApiKey(dbUserId);
    newlyGeneratedKey = rawKey;
    activeKey = await getActiveKey(dbUserId);
  }

  return (
    <KeysClient
      activeKey={activeKey}
      newlyGeneratedKey={newlyGeneratedKey}
      dbUserId={dbUserId}
    />
  );
}
