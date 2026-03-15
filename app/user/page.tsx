import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import UserProfileClient from "./UserProfileClient";

export default async function UserProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return <UserProfileClient />;
}
