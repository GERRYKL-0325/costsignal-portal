import React from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { PLANS } from "@/lib/plans";
import { UpgradeButton, ManageBillingButton } from "./PricingClient";

export default async function PricingPage() {
  const { userId } = await auth();
  const isLoggedIn = !!userId;
  return (
    <>
      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 1.5rem", height: "56px",
        background: "rgba(10,10,10,0.95)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #1a1a1a",
      }}>
        <Link href="/" style={{ fontWeight: 700, fontSize: "1rem", letterSpacing: "-0.02em", textDecoration: "none", color: "inherit" }}>
          Cost<span style={{ color: "#4ade80" }}>Signal</span>
          <span style={{ marginLeft: "0.5rem", fontSize: "0.7rem", fontWeight: 500, color: "#555", letterSpacing: "0.06em", textTransform: "uppercase" }}>Portal</span>
        </Link>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Link href="https://costsignal.io" style={{ fontSize: "0.8rem", color: "#555", textDecoration: "none", padding: "0.35rem 0.75rem", border: "1px solid #222", borderRadius: "6px" }}>← costsignal.io</Link>
          <Link href="/sign-in" style={{ fontSize: "0.8rem", color: "#aaa", textDecoration: "none", padding: "0.35rem 0.75rem", border: "1px solid #222", borderRadius: "6px" }}>Sign in</Link>
          <Link href="/sign-up" style={{ fontSize: "0.85rem", color: "#000", fontWeight: 700, textDecoration: "none", padding: "0.4rem 1rem", background: "#4ade80", borderRadius: "6px" }}>Get started free</Link>
        </div>
      </nav>

      <main style={{ minHeight: "100vh", background: "#0a0a0a", paddingTop: "56px", color: "#e8e8e8", fontFamily: "Inter, sans-serif" }}>

        {/* Hero */}
        <section style={{ textAlign: "center", padding: "5rem 1.5rem 3.5rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#0d1a10", border: "1px solid #1a3a1a", borderRadius: "100px", padding: "0.3rem 0.85rem", marginBottom: "1.5rem" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
            <span style={{ fontSize: "0.72rem", color: "#4ade80", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Simple pricing</span>
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "1rem", lineHeight: 1.1 }}>
            Start free. Upgrade when it pays off.
          </h1>
          <p style={{ fontSize: "1.05rem", color: "#666", maxWidth: "500px", margin: "0 auto 0.75rem", lineHeight: 1.7 }}>
            Live cost data from BLS, FRED &amp; EIA — cleaned, formatted, and ready for your financial models.
          </p>
        </section>

        {/* Pricing cards */}
        <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 1.5rem 4rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "1.25rem" }}>

            <PricingCard
              label="Free"
              price={0}
              tagline={PLANS.free.tagline}
              features={PLANS.free.features}
              limits={[...PLANS.free.limits]}
              cta={
                <Link href="/sign-up" style={{
                  display: "block", textAlign: "center", padding: "0.75rem 1.5rem",
                  background: "transparent", color: "#e8e8e8",
                  fontWeight: 700, fontSize: "0.875rem", borderRadius: "8px",
                  textDecoration: "none", border: "1px solid #2a2a2a",
                }}>
                  Create free account →
                </Link>
              }
              recommended={false}
              badge={null}
            />

            <PricingCard
              label="Pro"
              price={29}
              tagline={PLANS.pro.tagline}
              features={PLANS.pro.features}
              limits={[]}
              cta={<UpgradeButton plan="pro" label="Upgrade to Pro" style="primary" isLoggedIn={isLoggedIn} />}
              recommended={true}
              badge="Most popular"
            />

            <PricingCard
              label="API"
              price={49}
              tagline={PLANS.api.tagline}
              features={PLANS.api.features}
              limits={[]}
              cta={<UpgradeButton plan="api" label="Get API access" style="secondary" isLoggedIn={isLoggedIn} />}
              recommended={false}
              badge={null}
            />

          </div>
        </section>

        {/* Comparison table */}
        <section style={{ maxWidth: "860px", margin: "0 auto", padding: "0 1.5rem 5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.25rem", color: "#888", letterSpacing: "-0.01em" }}>
            Full comparison
          </h2>
          <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "12px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                  <th style={{ textAlign: "left", padding: "0.875rem 1.25rem", color: "#555", fontWeight: 500 }}></th>
                  <th style={{ textAlign: "center", padding: "0.875rem 1.25rem", color: "#777", fontWeight: 600 }}>Free</th>
                  <th style={{ textAlign: "center", padding: "0.875rem 1.25rem", color: "#60a5fa", fontWeight: 600 }}>Pro $29</th>
                  <th style={{ textAlign: "center", padding: "0.875rem 1.25rem", color: "#4ade80", fontWeight: 600 }}>API $49</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Series access", free: "30 series", pro: "All 150+", api: "All 150+" },
                  { feature: "Historical data", free: "3 years", pro: "Back to Jan 2015", api: "Back to Jan 2015" },
                  { feature: "Excel & CSV exports", free: "5 / month", pro: "Unlimited", api: "Unlimited" },
                  { feature: "Saved presets", free: "1", pro: "50", api: "Unlimited" },
                  { feature: "Builder access", free: "✓", pro: "✓", api: "✓" },
                  { feature: "TAM Engine", free: "✓", pro: "✓", api: "✓" },
                  { feature: "REST API access", free: "✗", pro: "✗", api: "✓" },
                  { feature: "API calls / day", free: "—", pro: "—", api: "1,000" },
                  { feature: "API key management", free: "✗", pro: "✗", api: "✓" },
                  { feature: "Usage analytics", free: "✗", pro: "✗", api: "✓" },
                  { feature: "Priority support", free: "✗", pro: "✓", api: "✓" },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: i < 10 ? "1px solid #161616" : "none", background: i % 2 === 0 ? "transparent" : "#0d0d0d" }}>
                    <td style={{ padding: "0.75rem 1.25rem", color: "#999" }}>{row.feature}</td>
                    <td style={{ textAlign: "center", padding: "0.75rem 1.25rem", color: row.free === "✗" || row.free === "—" ? "#2a2a2a" : "#666" }}>{row.free}</td>
                    <td style={{ textAlign: "center", padding: "0.75rem 1.25rem", color: row.pro === "✗" || row.pro === "—" ? "#2a2a2a" : "#e8e8e8", fontWeight: row.pro !== "✗" && row.pro !== "—" ? 500 : 400 }}>{row.pro}</td>
                    <td style={{ textAlign: "center", padding: "0.75rem 1.25rem", color: row.api === "✗" ? "#2a2a2a" : "#4ade80", fontWeight: row.api !== "✗" ? 500 : 400 }}>{row.api}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Upgrade CTA */}
        <section style={{ maxWidth: "540px", margin: "0 auto", padding: "0 1.5rem 6rem", textAlign: "center" }}>
          <div style={{ background: "#0d1a10", border: "1px solid #1a3a1a", borderRadius: "12px", padding: "2.25rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#e8e8e8", marginBottom: "0.5rem" }}>
              Already a subscriber?
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#555", lineHeight: 1.7, marginBottom: "1.25rem" }}>
              Update payment, change plans, or cancel anytime from the Stripe billing portal.
            </p>
            <ManageBillingButton />
            <p style={{ marginTop: "1rem", fontSize: "0.75rem", color: "#333" }}>
              Questions? <a href="mailto:hello@costsignal.io" style={{ color: "#555", textDecoration: "none" }}>hello@costsignal.io</a>
            </p>
          </div>
        </section>

        <footer style={{ borderTop: "1px solid #111", padding: "1.5rem", textAlign: "center", color: "#333", fontSize: "0.8rem" }}>
          © {new Date().getFullYear()} CostSignal ·{" "}
          <Link href="https://costsignal.io" style={{ color: "#444", textDecoration: "none" }}>costsignal.io</Link>
          {" · "}
          <Link href="/" style={{ color: "#444", textDecoration: "none" }}>Portal</Link>
        </footer>
      </main>
    </>
  );
}

function PricingCard({ label, price, tagline, features, limits, cta, recommended, badge }: {
  label: string; price: number; tagline: string;
  features: readonly string[]; limits: string[];
  cta: React.ReactNode;
  recommended: boolean; badge: string | null;
}) {
  return (
    <div style={{
      background: "#111",
      border: recommended ? "1px solid #4ade80" : "1px solid #1a1a1a",
      borderRadius: "16px", padding: "2rem",
      display: "flex", flexDirection: "column", position: "relative",
      boxShadow: recommended ? "0 0 40px rgba(74,222,128,0.07)" : "none",
    }}>
      {badge && (
        <div style={{
          position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)",
          background: "#4ade80", color: "#000", fontSize: "0.68rem", fontWeight: 800,
          padding: "0.25rem 0.85rem", borderRadius: "100px", letterSpacing: "0.06em",
          textTransform: "uppercase", whiteSpace: "nowrap",
        }}>{badge}</div>
      )}

      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", color: "#555", textTransform: "uppercase", marginBottom: "0.6rem" }}>
          {label}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem", marginBottom: "0.6rem" }}>
          <span style={{ fontSize: "2.5rem", fontWeight: 800, color: "#e8e8e8", letterSpacing: "-0.03em" }}>
            {price === 0 ? "Free" : `$${price}`}
          </span>
          {price > 0 && <span style={{ color: "#444", fontSize: "0.85rem" }}>/month</span>}
        </div>
        <p style={{ color: "#555", fontSize: "0.85rem", lineHeight: 1.6, margin: 0 }}>{tagline}</p>
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 auto", flex: 1, display: "flex", flexDirection: "column", gap: "0.55rem", paddingBottom: "1.5rem" }}>
        {features.map((f, i) => (
          <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.875rem", color: "#aaa" }}>
            <span style={{ color: "#4ade80", flexShrink: 0, marginTop: "2px", fontSize: "0.75rem" }}>✓</span>
            {f}
          </li>
        ))}
        {limits.map((f, i) => (
          <li key={`l${i}`} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.875rem", color: "#444" }}>
            <span style={{ color: "#333", flexShrink: 0, marginTop: "2px", fontSize: "0.75rem" }}>✗</span>
            {f}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: "1.5rem" }}>
        {cta}
      </div>
    </div>
  );
}
