import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { getActiveKey } from "@/lib/api-keys";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "User";

  // Get plan
  const { data: dbUser } = await supabaseAdmin
    .from("users")
    .select("id, plan")
    .eq("clerk_user_id", userId)
    .single();

  const plan = (dbUser?.plan as "free" | "pro" | "api") ?? "free";

  // Get active key prefix
  let keyPrefix: string | null = null;
  if (dbUser?.id) {
    const activeKey = await getActiveKey(dbUser.id);
    if (activeKey?.key_prefix) {
      keyPrefix = activeKey.key_prefix + "••••";
    }
  }

  return (
    <SettingsClient
      fullName={fullName}
      email={email}
      plan={plan}
      keyPrefix={keyPrefix}
    />
  );
}
