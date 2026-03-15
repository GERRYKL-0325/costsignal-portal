import { currentUser } from "@clerk/nextjs/server";
import { ReactNode } from "react";
import MobileDashboardLayout from "@/components/MobileDashboardLayout";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  const initials = (
    (user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? "")
  ).toUpperCase() || email?.[0]?.toUpperCase() || "?";

  return (
    <MobileDashboardLayout
      email={email}
      fullName={fullName}
      initials={initials}
    >
      {children}
    </MobileDashboardLayout>
  );
}
