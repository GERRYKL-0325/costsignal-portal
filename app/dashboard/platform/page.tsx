import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { PLANS, type PlanId } from "@/lib/plans";
import { PresetSparkline } from "@/components/PresetSparkline";
import { SourceBadges } from "@/components/SourceBadges";

async function getPlatformData(userId: string, userEmail?: string) {
  let { data: dbUser } = await supabaseAdmin
    .from("users")
    .select("id, plan, plan_started_at")
    .eq("clerk_user_id", userId)
    .single();

  // Auto-provision: create user record if missing (e.g. webhook missed on signup)
  if (!dbUser) {
    const { data: newUser } = await supabaseAdmin
      .from("users")
      .insert({ clerk_user_id: userId, plan: "free", email: userEmail ?? null })
      .select("id, plan, plan_started_at")
      .single();
    dbUser = newUser;
  }

  if (!dbUser) return null;

  const plan = (dbUser.plan ?? "free") as PlanId;

  const [configsResult, downloadsResult, configCountResult] = await Promise.all([
    supabaseAdmin
      .from("saved_configs")
      .select("id, name, description, series_slugs, from_year, to_year, format, created_at")
      .eq("user_id", dbUser.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabaseAdmin
      .from("download_history")
      .select("id, series_slugs, format, from_year, to_year, downloaded_at")
      .eq("user_id", dbUser.id)
      .order("downloaded_at", { ascending: false })
      .limit(10),
    supabaseAdmin
      .from("saved_configs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", dbUser.id),
  ]);

  return {
    plan,
    plan_started_at: dbUser.plan_started_at,
    configs: configsResult.data ?? [],
    configCount: configCountResult.count ?? 0,
    downloads: downloadsResult.data ?? [],
  };
}

function builderDeepLink(seriesSlugs: string[], fromYear?: number | null, toYear?: number | null, format?: string | null) {
  const params = new URLSearchParams();
  if (seriesSlugs?.length) params.set("slugs", seriesSlugs.join(","));
  if (fromYear) params.set("from", `${fromYear}-1`);
  if (toYear) params.set("to", `${toYear}-12`);
  if (format) params.set("format", format);
  const qs = params.toString();
  return `https://portal.costsignal.io/builder${qs ? `?${qs}` : ""}`;
}

export default async function PlatformPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const data = await getPlatformData(userId, userEmail);

  if (!data) {
    return (
      <div className="text-center py-20 text-gray-500">
        Account not found. Try signing out and back in.
      </div>
    );
  }

  const { plan, configs, configCount, downloads } = data;
  const planDetails = PLANS[plan];
  const isFree = plan === "free";

  const planBadgeStyle: Record<PlanId, { bg: string; color: string }> = {
    free: { bg: "#2a2a2a", color: "#aaa" },
    pro: { bg: "#1e3a5f", color: "#60a5fa" },
    api: { bg: "#0d2e1a", color: "#4ade80" },
  };
  const badge = planBadgeStyle[plan];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Presets</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Saved configurations, download history, and account plan.
          </p>
        </div>
        {/* Plan badge */}
        <div className="flex items-center gap-3">
          <span style={{
            background: badge.bg, color: badge.color,
            fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.75rem",
            borderRadius: "100px", letterSpacing: "0.05em", textTransform: "uppercase",
          }}>
            {planDetails.label}
          </span>
          {isFree ? (
            <Link href="/pricing" style={{
              fontSize: "0.8rem", fontWeight: 600, color: "#000",
              background: "#4ade80", padding: "0.35rem 0.875rem",
              borderRadius: "6px", textDecoration: "none",
            }}>
              Upgrade →
            </Link>
          ) : (
            <a href="mailto:hello@costsignal.io?subject=CostSignal%20Plan%20Management" style={{
              fontSize: "0.8rem", color: "#aaa", border: "1px solid #2a2a2a",
              padding: "0.35rem 0.875rem", borderRadius: "6px", textDecoration: "none",
            }}>
              Manage plan
            </a>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Saved configs", value: configCount.toString(), sub: `of ${planDetails.savedConfigs} max` },
          { label: "Downloads logged", value: downloads.length.toString(), sub: "recent downloads shown" },
          { label: "Plan", value: planDetails.label, sub: plan === "free" ? "Free tier" : "Paid plan" },
          { label: "Member since", value: data.plan_started_at ? new Date(data.plan_started_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—", sub: "plan start date" },
        ].map(stat => (
          <div key={stat.label} style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "1rem 1.25rem" }}>
            <p style={{ fontSize: "0.68rem", color: "#555", marginBottom: "0.3rem" }}>{stat.label}</p>
            <p style={{ fontSize: "1.4rem", fontWeight: 700, color: "#e8e8e8", lineHeight: 1.1 }}>{stat.value}</p>
            <p style={{ fontSize: "0.68rem", color: "#444", marginTop: "0.2rem" }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Open Builder", href: "https://portal.costsignal.io/builder", icon: "🔧", desc: "Build custom cost indices" },
          { label: "TAM Engine", href: "https://costsignal.io/tam", icon: "📐", desc: "Market sizing calculator" },
          { label: "API Docs", href: "https://costsignal.io/docs", icon: "📖", desc: "REST API reference" },
        ].map(link => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "#111", border: "1px solid #1a1a1a", borderRadius: "12px",
              padding: "1.25rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.875rem",
              transition: "border-color 0.15s",
            }}
            className="hover:border-accent/30"
          >
            <span style={{ fontSize: "1.375rem" }}>{link.icon}</span>
            <div>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#e8e8e8" }}>{link.label} →</div>
              <div style={{ fontSize: "0.75rem", color: "#555", marginTop: "0.15rem" }}>{link.desc}</div>
            </div>
          </a>
        ))}
      </div>

      {/* Plan limits */}
      {isFree && (
        <div style={{ background: "#0d1a10", border: "1px solid #1a3a1a", borderRadius: "12px", padding: "1.25rem 1.5rem" }}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Free plan limits</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {planDetails.maxSeries} series per export · {planDetails.maxDownloadsPerMonth} downloads/month · {planDetails.historyYears}-year history · {planDetails.savedConfigs} saved configs
              </p>
            </div>
            <Link href="/pricing" style={{
              fontSize: "0.8rem", fontWeight: 600, color: "#4ade80",
              border: "1px solid #2a4a2a", padding: "0.35rem 0.875rem",
              borderRadius: "6px", textDecoration: "none",
            }}>
              See all plans →
            </Link>
          </div>
        </div>
      )}

      {/* Saved configurations */}
      <div className="bg-bg2 border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Saved Configurations</h2>
          <Link href="/dashboard/platform/configs" className="text-xs text-accent hover:underline">
            View all →
          </Link>
        </div>
        {configs.length === 0 ? (
          <div className="px-5 py-10 text-center text-gray-500 text-sm">
            <p>No saved configurations yet.</p>
            <a href="https://portal.costsignal.io/builder" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline text-xs mt-1 inline-block">
              Save one from the Builder →
            </a>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {configs.map(config => (
              <div key={config.id} className="px-5 py-4 flex items-center justify-between gap-4">
                {/* Sparkline */}
                <div style={{ flexShrink: 0, opacity: 0.8 }}>
                  <PresetSparkline slugs={config.series_slugs} width={56} height={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{config.name}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.15rem" }}>
                    <p className="text-xs text-gray-500" style={{ margin: 0 }}>
                      {config.series_slugs.length} series
                      {config.from_year && config.to_year ? ` · ${config.from_year}–${config.to_year}` : ""}
                      {" "}· {new Date(config.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    <SourceBadges slugs={config.series_slugs} />
                  </div>
                  {config.description && (
                    <p className="text-xs text-gray-600 mt-0.5 truncate">{config.description}</p>
                  )}
                </div>
                <a
                  href={builderDeepLink(config.series_slugs, config.from_year, config.to_year, config.format)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "0.78rem", fontWeight: 600, color: "#4ade80",
                    border: "1px solid #1a3a1a", padding: "0.3rem 0.75rem",
                    borderRadius: "6px", textDecoration: "none", whiteSpace: "nowrap",
                  }}
                >
                  Load in Builder →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Download history */}
      <div className="bg-bg2 border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-white">Recent Downloads</h2>
        </div>
        {downloads.length === 0 ? (
          <div style={{ padding: "2.5rem 1.5rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.75rem", marginBottom: "0.625rem" }}>📥</div>
            <p style={{ color: "#aaa", fontWeight: 600, fontSize: "0.85rem", margin: "0 0 0.3rem" }}>No downloads yet</p>
            <p style={{ color: "#444", fontSize: "0.75rem", margin: 0 }}>
              Export data from the{" "}
              <a href="https://portal.costsignal.io/builder" target="_blank" rel="noopener noreferrer" style={{ color: "#4ade80", textDecoration: "none" }}>
                Builder
              </a>{" "}
              and your history will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-gray-400 text-xs">
                  <th className="text-left px-5 py-3 font-medium">Series</th>
                  <th className="text-left px-5 py-3 font-medium">Format</th>
                  <th className="text-left px-5 py-3 font-medium">Years</th>
                  <th className="text-left px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {downloads.map(dl => (
                  <tr key={dl.id} className="hover:bg-bg/50 transition-colors">
                    <td className="px-5 py-3 text-gray-300 text-xs max-w-[260px] truncate">
                      {dl.series_slugs?.slice(0, 3).join(", ")}
                      {(dl.series_slugs?.length ?? 0) > 3 && ` +${dl.series_slugs!.length - 3} more`}
                    </td>
                    <td className="px-5 py-3">
                      <span style={{
                        background: "#1a1a1a", color: "#aaa", fontSize: "0.7rem",
                        fontFamily: "monospace", padding: "0.15rem 0.5rem", borderRadius: "4px",
                      }}>
                        {dl.format ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {dl.from_year && dl.to_year ? `${dl.from_year}–${dl.to_year}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(dl.downloaded_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User info footer */}
      <p className="text-xs text-gray-600 pb-4">
        Signed in as <span className="text-gray-500">{user?.emailAddresses[0]?.emailAddress}</span>
      </p>
    </div>
  );
}
