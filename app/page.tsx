import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <>
      {/* ── Nav ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 1.5rem", height: "56px",
        background: "rgba(10,10,10,0.95)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #1a1a1a",
      }}>
        <div style={{ fontWeight: 700, fontSize: "1rem", letterSpacing: "-0.02em" }}>
          Cost<span style={{ color: "#4ade80" }}>Signal</span>
          <span style={{ marginLeft: "0.5rem", fontSize: "0.7rem", fontWeight: 500, color: "#555", letterSpacing: "0.06em", textTransform: "uppercase" }}>Portal</span>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Link href="https://costsignal.io" style={{ fontSize: "0.8rem", color: "#555", textDecoration: "none", padding: "0.35rem 0.75rem", border: "1px solid #222", borderRadius: "6px" }}>← costsignal.io</Link>
          <Link href="/pricing" style={{ fontSize: "0.8rem", color: "#888", textDecoration: "none", padding: "0.35rem 0.75rem" }}>Pricing</Link>
          <Link href="/sign-in" style={{ fontSize: "0.8rem", color: "#aaa", textDecoration: "none", padding: "0.35rem 0.75rem", border: "1px solid #222", borderRadius: "6px" }}>Sign in</Link>
          <Link href="/sign-up" style={{ fontSize: "0.85rem", color: "#000", fontWeight: 700, textDecoration: "none", padding: "0.4rem 1rem", background: "#4ade80", borderRadius: "6px" }}>Get started</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <main style={{ minHeight: "100vh", background: "#0a0a0a", paddingTop: "56px", display: "flex", flexDirection: "column" }}>
        <section style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "7rem 1.5rem 4rem", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#0d1a10", border: "1px solid #1a3a1a", borderRadius: "100px", padding: "0.3rem 0.85rem", marginBottom: "1.5rem" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
            <span style={{ fontSize: "0.72rem", color: "#4ade80", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Now live</span>
          </div>

          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700, letterSpacing: "-0.03em", color: "#e8e8e8", marginBottom: "1.25rem", lineHeight: 1.1 }}>
            Your CostSignal<br />
            <span style={{ color: "#4ade80" }}>API dashboard</span>
          </h1>

          <p style={{ fontSize: "1.05rem", color: "#666", maxWidth: "480px", lineHeight: 1.7, marginBottom: "2.5rem" }}>
            Manage API keys, monitor usage, and access 124+ BLS, FRED, and EIA economic series — all in one place.
          </p>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/sign-up" style={{
              padding: "0.8rem 2rem", background: "#4ade80", color: "#000",
              fontWeight: 700, fontSize: "0.95rem", borderRadius: "8px", textDecoration: "none",
            }}>Create free account →</Link>
            <Link href="/sign-in" style={{
              padding: "0.8rem 1.5rem", background: "transparent", color: "#aaa",
              fontWeight: 600, fontSize: "0.9rem", borderRadius: "8px", textDecoration: "none",
              border: "1px solid #222",
            }}>Sign in</Link>
          </div>

          {/* Plan tier teaser */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center", marginTop: "2.5rem" }}>
            {[
              { label: "Free", desc: "10 series · 5 downloads/mo", color: "#444", textColor: "#aaa" },
              { label: "Pro", desc: "$29/mo · Unlimited · Full history", color: "#1e3a5f", textColor: "#60a5fa" },
              { label: "API", desc: "$49/mo · REST API · 500 calls/day", color: "#0d2e1a", textColor: "#4ade80" },
            ].map(tier => (
              <div key={tier.label} style={{
                background: "#111", border: "1px solid #1a1a1a", borderRadius: "8px",
                padding: "0.6rem 1.1rem", display: "flex", alignItems: "center", gap: "0.5rem",
              }}>
                <span style={{ background: tier.color, color: tier.textColor, fontSize: "0.65rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "4px", letterSpacing: "0.06em", textTransform: "uppercase" }}>{tier.label}</span>
                <span style={{ fontSize: "0.78rem", color: "#555" }}>{tier.desc}</span>
              </div>
            ))}
          </div>
          <Link href="/pricing" style={{ display: "inline-block", marginTop: "0.75rem", fontSize: "0.8rem", color: "#4ade80", textDecoration: "none" }}>
            Compare plans →
          </Link>
        </section>

        {/* ── Feature cards ── */}
        <section style={{ maxWidth: "900px", margin: "0 auto", padding: "0 1.5rem 6rem", width: "100%" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
            {[
              { badge: "KEYS", title: "API key management", desc: "Generate, rotate, and revoke keys instantly. Every key is hashed at rest — never stored in plaintext." },
              { badge: "USAGE", title: "Usage analytics", desc: "See calls by endpoint, response times, and top series. 90-day rolling history." },
              { badge: "DATA", title: "124+ live series", desc: "BLS cost indices, FRED interest rates, EIA energy prices. Updated monthly, sourced from primary government APIs." },
            ].map(f => (
              <div key={f.badge} style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "1.5rem" }}>
                <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em", color: "#4ade80", marginBottom: "0.75rem", fontFamily: "monospace" }}>{f.badge}</div>
                <div style={{ fontWeight: 600, color: "#e8e8e8", marginBottom: "0.5rem", fontSize: "0.95rem" }}>{f.title}</div>
                <div style={{ fontSize: "0.82rem", color: "#555", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <footer style={{ borderTop: "1px solid #111", padding: "1.5rem", textAlign: "center", color: "#333", fontSize: "0.8rem" }}>
          © {new Date().getFullYear()} CostSignal · <Link href="https://costsignal.io" style={{ color: "#444", textDecoration: "none" }}>costsignal.io</Link>
        </footer>
      </main>
    </>
  );
}
