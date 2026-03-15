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
          {/* Right: user initials avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            {email && (
              <p style={{ fontSize: "0.7rem", color: "#555", margin: 0 }}>{email}</p>
            )}
            {(() => {
              const initials = (
                (user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? "")
              ).toUpperCase() || email?.[0]?.toUpperCase() || "?";
              return (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "#0d1a10",
                    border: "2px solid #4ade80",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "#4ade80",
                    letterSpacing: "0.04em",
                    flexShrink: 0,
                    fontFamily: "Inter, sans-serif",
                  }}
                  title={fullName || email}
                >
                  {initials}
                </div>
              );
            })()}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
