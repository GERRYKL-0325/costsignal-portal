import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
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

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavLink href="/dashboard" label="Overview" icon="◈" exact />
          <NavLink href="/dashboard/keys" label="API Keys" icon="🔑" />
          <NavLink href="/dashboard/usage" label="Usage" icon="📊" />
        </nav>

        {/* Docs link */}
        <div className="px-3 py-3 border-t border-border">
          <a
            href="https://costsignal.io/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-bg transition-colors"
          >
            <span>↗</span>
            <span>API Docs</span>
          </a>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-56 flex flex-col">
        {/* Top bar */}
        <header className="h-14 border-b border-border bg-bg2/50 backdrop-blur-sm flex items-center justify-end px-6 sticky top-0 z-10">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

function NavLink({
  href,
  label,
  icon,
  exact,
}: {
  href: string;
  label: string;
  icon: string;
  exact?: boolean;
}) {
  // Active state handled client-side; use static styles here
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-bg transition-colors group"
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
