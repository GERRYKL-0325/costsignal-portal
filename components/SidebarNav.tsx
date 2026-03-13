"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", sub: "Overview & activity", icon: "◈", exact: true },
  { href: "/dashboard/keys", label: "API Keys", sub: "Authenticate your requests", icon: "🔑" },
  { href: "/dashboard/usage", label: "Usage", sub: "Track your API calls", icon: "📊" },
  { href: "/dashboard/platform", label: "Platform", sub: "Saved presets", icon: "🌐" },
];

export default function SidebarNav() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {NAV_LINKS.map(({ href, label, sub, icon, exact }) => {
        const active = isActive(href, exact);
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.625rem",
              padding: "0.5rem 0.75rem",
              borderRadius: "8px",
              fontSize: "0.875rem",
              textDecoration: "none",
              transition: "background 0.15s, color 0.15s",
              background: active ? "#161616" : "transparent",
              color: active ? "#fff" : "#9ca3af",
              borderLeft: active ? "2px solid #4ade80" : "2px solid transparent",
              fontWeight: active ? 600 : 400,
            }}
          >
            <span style={{ fontSize: "1rem", marginTop: "0.1rem" }}>{icon}</span>
            <span style={{ display: "flex", flexDirection: "column" }}>
              <span>{label}</span>
              <span style={{ fontSize: "0.68rem", color: "#555", fontWeight: 400, marginTop: "0.1rem" }}>{sub}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function SidebarBottom() {
  return (
    <div className="px-3 py-3 border-t border-border space-y-1">
      <a
        href="https://costsignal.io/builder"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-bg transition-colors"
      >
        <span>←</span>
        <span>Back to Builder</span>
      </a>
      <a
        href="https://costsignal.io/docs"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-bg transition-colors"
      >
        <span>↗</span>
        <span>Docs</span>
      </a>
      <Link
        href="/pricing"
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-bg transition-colors"
      >
        <span>💳</span>
        <span>Pricing</span>
      </Link>
      <SignOutButton redirectUrl="/">
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-bg transition-colors">
          <span>⎋</span>
          <span>Sign out</span>
        </button>
      </SignOutButton>
    </div>
  );
}
