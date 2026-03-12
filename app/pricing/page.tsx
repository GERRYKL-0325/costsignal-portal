import Link from "next/link";
import { PLANS } from "@/lib/plans";

export default function PricingPage() {
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
          <Link href="/sign-up" style={{ fontSize: "0.85rem", color: "#000", fontWeight: 700, textDecoration: "none", padding: "0.4rem 1rem", background: "#4ade80", borderRadius: "6px" }}>Get started</Link>
        </div>
      </nav>

      <main style={{ minHeight: "100vh", background: "#0a0a0a", paddingTop: "56px", color: "#e8e8e8", fontFamily: "Inter, sans-serif" }}>
        {/* Hero */}
        <section style={{ textAlign: "center", padding: "5rem 1.5rem 3rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#0d1a10", border: "1px solid #1a3a1a", borderRadius: "100px", padding: "0.3rem 0.85rem", marginBottom: "1.5rem" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
            <span style={{ fontSize: "0.72rem", color: "#4ade80", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Simple pricing</span>
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "1rem", lineHeight: 1.1 }}>
            Start free, scale when you&apos;re ready
          </h1>
          <p style={{ fontSize: "1.05rem", color: "#666", maxWidth: "480px", margin: "0 auto 0.75rem", lineHeight: 1.7 }}>
            All plans include access to 96+ BLS, FRED, and EIA economic series.
          </p>
          <p style={{ fontSize: "0.85rem", color: "#444", maxWidth: "480px", margin: "0 auto" }}>
            💬 No payment integration yet — email{" "}
            <a href="mailto:hello@costsignal.io" style={{ color: "#4ade80", textDecoration: "none" }}>
              hello@costsignal.io
            </a>{" "}
            to upgrade to Pro or API.
          </p>
        </section>

        {/* Pricing cards */}
        <section style={{ maxWidth: "980px", margin: "0 auto", padding: "0 1.5rem 4rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
            {/* Free */}
            <PricingCard
              planId="free"
              label="Free"
              price={0}
              description="Get started with the essentials."
              features={PLANS.free.features}
              cta="Create free account"
              ctaHref="/sign-up"
              ctaStyle="secondary"
              recommended={false}
              badge={null}
            />

            {/* Pro */}
            <PricingCard
              planId="pro"
              label="Pro"
              price={29}
              description="For power users who need full history and unlimited exports."
              features={PLANS.pro.features}
              cta="Upgrade to Pro"
              ctaHref="mailto:hello@costsignal.io?subject=CostSignal%20Pro%20Upgrade"
              ctaStyle="primary"
              recommended={true}
              badge="Most popular"
            />

            {/* API */}
            <PricingCard
              planId="api"
              label="API"
              price={49}
              description="For developers integrating cost data into their own products."
              features={PLANS.api.features}
              cta="Get API access"
              ctaHref="mailto:hello@costsignal.io?subject=CostSignal%20API%20Access"
              ctaStyle="secondary"
              recommended={false}
              badge={null}
            />
          </div>
        </section>

        {/* Feature comparison table */}
        <section style={{ maxWidth: "860px", margin: "0 auto", padding: "0 1.5rem 6rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem", color: "#e8e8e8" }}>
            Full comparison
          </h2>
          <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "12px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                  <th style={{ textAlign: "left", padding: "0.875rem 1.25rem", color: "#666", fontWeight: 500 }}>Feature</th>
                  <th style={{ textAlign: "center", padding: "0.875rem 1.25rem", color: "#aaa", fontWeight: 600 }}>Free</th>
                  <th style={{ textAlign: "center", padding: "0.875rem 1.25rem", color: "#60a5fa", fontWeight: 600 }}>Pro</th>
                  <th style={{ textAlign: "center", padding: "0.875rem 1.25rem", color: "#4ade80", fontWeight: 600 }}>API</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Series per export", free: "10", pro: "Unlimited", api: "Unlimited" },
                  { feature: "Downloads / month", free: "5", pro: "Unlimited", api: "Unlimited" },
                  { feature: "Historical data", free: "3 years", pro: "2015 → present", api: "2015 → present" },
                  { feature: "Builder access", free: "✓", pro: "✓", api: "✓" },
                  { feature: "TAM Engine", free: "✓", pro: "✓", api: "✓" },
                  { feature: "Saved templates", free: "3", pro: "Unlimited", api: "Unlimited" },
                  { feature: "REST API access", free: "✗", pro: "✗", api: "✓" },
                  { feature: "API calls / day", free: "—", pro: "—", api: "500" },
                  { feature: "API key management", free: "✗", pro: "✗", api: "✓" },
                  { feature: "Usage analytics", free: "✗", pro: "✗", api: "✓" },
                  { feature: "Priority support", free: "✗", pro: "✓", api: "✓" },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: i < 10 ? "1px solid #1a1a1a" : "none", background: i % 2 === 0 ? "transparent" : "#0d0d0d" }}>
                    <td style={{ padding: "0.75rem 1.25rem", color: "#aaa" }}>{row.feature}</td>
                    <td style={{ textAlign: "center", padding: "0.75rem 1.25rem", color: row.free === "✗" || row.free === "—" ? "#333" : "#666" }}>{row.free}</td>
                    <td style={{ textAlign: "center", padding: "0.75rem 1.25rem", color: row.pro === "✗" || row.pro === "—" ? "#333" : "#e8e8e8" }}>{row.pro}</td>
                    <td style={{ textAlign: "center", padding: "0.75rem 1.25rem", color: row.api === "✗" ? "#333" : "#4ade80" }}>{row.api}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ-style note */}
        <section style={{ maxWidth: "600px", margin: "0 auto", padding: "0 1.5rem 5rem", textAlign: "center" }}>
          <div style={{ background: "#0d1a10", border: "1px solid #1a3a1a", borderRadius: "12px", padding: "2rem" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>📬</div>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#e8e8e8", marginBottom: "0.5rem" }}>
              Want to upgrade?
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#666", lineHeight: 1.7, marginBottom: "1rem" }}>
              Stripe integration is coming soon. In the meantime, email us and we&apos;ll manually upgrade your account — usually within a few hours.
            </p>
            <a
              href="mailto:hello@costsignal.io?subject=CostSignal%20Plan%20Upgrade"
              style={{
                display: "inline-block", padding: "0.6rem 1.5rem",
                background: "#4ade80", color: "#000", fontWeight: 700,
                fontSize: "0.875rem", borderRadius: "8px", textDecoration: "none",
              }}
            >
              Email hello@costsignal.io →
            </a>
          </div>
        </section>

        <footer style={{ borderTop: "1px solid #111", padding: "1.5rem", textAlign: "center", color: "#333", fontSize: "0.8rem" }}>
          © {new Date().getFullYear()} CostSignal ·{" "}
          <Link href="https://costsignal.io" style={{ color: "#444", textDecoration: "none" }}>costsignal.io</Link>
          {" "}·{" "}
          <Link href="/" style={{ color: "#444", textDecoration: "none" }}>Portal home</Link>
        </footer>
      </main>
    </>
  );
}

function PricingCard({
  label,
  price,
  description,
  features,
  cta,
  ctaHref,
  ctaStyle,
  recommended,
  badge,
}: {
  planId: string;
  label: string;
  price: number;
  description: string;
  features: readonly string[];
  cta: string;
  ctaHref: string;
  ctaStyle: "primary" | "secondary";
  recommended: boolean;
  badge: string | null;
}) {
  return (
    <div style={{
      background: "#111",
      border: recommended ? "1px solid #4ade80" : "1px solid #1a1a1a",
      borderRadius: "16px",
      padding: "2rem",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      boxShadow: recommended ? "0 0 32px rgba(74, 222, 128, 0.08)" : "none",
    }}>
      {badge && (
        <div style={{
          position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)",
          background: "#4ade80", color: "#000", fontSize: "0.7rem", fontWeight: 700,
          padding: "0.25rem 0.75rem", borderRadius: "100px", letterSpacing: "0.04em",
          whiteSpace: "nowrap",
        }}>
          {badge}
        </div>
      )}

      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", color: "#555", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          {label}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
          <span style={{ fontSize: "2.5rem", fontWeight: 800, color: "#e8e8e8", letterSpacing: "-0.03em" }}>
            {price === 0 ? "Free" : `$${price}`}
          </span>
          {price > 0 && <span style={{ color: "#555", fontSize: "0.875rem" }}>/mo</span>}
        </div>
        <p style={{ color: "#666", fontSize: "0.875rem", lineHeight: 1.6, marginTop: "0.5rem" }}>
          {description}
        </p>
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {features.map((f, i) => (
          <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.875rem", color: "#aaa" }}>
            <span style={{ color: "#4ade80", flexShrink: 0, marginTop: "1px" }}>✓</span>
            {f}
          </li>
        ))}
      </ul>

      <a
        href={ctaHref}
        style={{
          display: "block", textAlign: "center", padding: "0.75rem 1.5rem",
          background: ctaStyle === "primary" ? "#4ade80" : "transparent",
          color: ctaStyle === "primary" ? "#000" : "#e8e8e8",
          fontWeight: 700, fontSize: "0.9rem", borderRadius: "8px", textDecoration: "none",
          border: ctaStyle === "secondary" ? "1px solid #2a2a2a" : "none",
          transition: "all 0.15s",
        }}
      >
        {cta} →
      </a>
    </div>
  );
}
