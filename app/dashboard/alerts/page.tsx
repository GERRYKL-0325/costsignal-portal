import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import AlertsClient from "./AlertsClient";

async function getDbUserId(clerkUserId: string, email: string): Promise<string> {
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
  return newUser!.id;
}

export default async function AlertsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? "";
  const dbUserId = await getDbUserId(userId, email);

  const { data: alerts } = await supabaseAdmin
    .from("series_alerts")
    .select("*")
    .eq("user_id", dbUserId)
    .order("created_at", { ascending: false });

  return (
    <AlertsClient
      initialAlerts={alerts ?? []}
      dbUserId={dbUserId}
      userEmail={email}
    />
  );
}
