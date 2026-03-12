"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";

const NAV_LINKS = [
  { href: "/dashboard", label: "Overview", icon: "◈", exact: true },
  { href: "/dashboard/platform", label: "Platform", icon: "🌐" },
  { href: "/dashboard/keys", label: "API Keys", icon: "🔑" },
  { href: "/dashboard/usage", label: "Usage", icon: "📊" },
];

export default function SidebarNav() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {NAV_LINKS.map(({ href, label, icon, exact }) => {
        const active = isActive(href, exact);
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex",
              alignItems: "center",
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
            <span style={{ fontSize: "1rem" }}>{icon}</span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function SidebarBottom() {
  return (
    <div className="px-3 py-3 border-t border-border space-y-1">
      <Link
        href="/pricing"
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-bg transition-colors"
      >
        <span>💳</span>
        <span>Pricing</span>
      </Link>
      <a
        href="https://costsignal.io/docs"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-bg transition-colors"
      >
        <span>↗</span>
        <span>API Docs</span>
      </a>
      <SignOutButton redirectUrl="/">
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-bg transition-colors">
          <span>⎋</span>
          <span>Sign out</span>
        </button>
      </SignOutButton>
    </div>
  );
}
