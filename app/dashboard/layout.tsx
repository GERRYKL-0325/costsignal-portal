import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { ReactNode } from "react";
import SidebarNav, { SidebarBottom } from "@/components/SidebarNav";
import SidebarPlanBadge from "@/components/SidebarPlanBadge";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar */}
      <aside className="w-56 bg-bg2 border-r border-border flex flex-col fixed h-full z-10">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-accent" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">
              CostSignal
            </span>
          </div>
        </div>

        {/* User info + plan badge */}
        <SidebarPlanBadge email={email} />

        {/* Nav — client component for active state */}
        <SidebarNav />

        {/* Bottom links */}
        <SidebarBottom />
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-56 flex flex-col">
        {/* Top bar */}
        <header className="h-14 border-b border-border bg-bg2/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
          {/* Left: page context or breadcrumb — leave empty for now */}
          <div />
          {/* Right: signed-in indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ textAlign: "right" }}>
              {fullName && (
                <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#e8e8e8", margin: 0 }}>{fullName}</p>
              )}
              {email && (
                <p style={{ fontSize: "0.68rem", color: "#555", margin: 0 }}>{email}</p>
              )}
            </div>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
