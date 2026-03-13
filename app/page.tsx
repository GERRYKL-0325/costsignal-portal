import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("https://costsignal.io/builder");
  redirect("https://costsignal.io");
}
