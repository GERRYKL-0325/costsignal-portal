"use client";

import { useEffect, useState } from "react";

// ── Data ─────────────────────────────────────────────────────────────────────

const ROLES = [
  { id: "fpa",        label: "FP&A",        emoji: "📊", desc: "Financial planning & analysis" },
  { id: "research",   label: "Research",    emoji: "🔬", desc: "Independent or institutional research" },
  { id: "investment", label: "Investment",  emoji: "💼", desc: "PE, VC, public markets, credit" },
  { id: "operations", label: "Operations",  emoji: "⚙️",  desc: "Supply chain, logistics, manufacturing" },
  { id: "other",      label: "Other",       emoji: "✨", desc: "Explore on my own" },
] as const;

type RoleId = typeof ROLES[number]["id"];

const INDUSTRIES: Record<RoleId, { id: string; label: string; emoji: string; slugs: string }[]> = {
  fpa: [
    { id: "mfg",    label: "Manufacturing",  emoji: "🏭", slugs: "steel_mill,aluminum,copper,ppi_finished,avg_hourly_earnings" },
    { id: "const",  label: "Construction",   emoji: "🏗️", slugs: "steel_mill,lumber_soft,concrete,drywall,copper_wire" },
    { id: "energy", label: "Energy",         emoji: "⚡", slugs: "wti_crude,natgas_spot,diesel,jet_fuel,coal_spot" },
    { id: "health", label: "Healthcare",     emoji: "🏥", slugs: "cpi_medical,avg_hourly_earnings,corp_profits,personal_saving_rate" },
    { id: "retail", label: "Retail & CPG",   emoji: "🛒", slugs: "cpi_all,ppi_finished,avg_hourly_earnings,personal_saving_rate" },
  ],
  research: [
    { id: "macro",  label: "Macro Economics", emoji: "🌍", slugs: "cpi_all,fed_funds,spread_10y3m,nfci,unemployment" },
    { id: "fin",    label: "Financial Markets", emoji: "📈", slugs: "hy_spread,ig_spread,vix,fed_funds,spread_10y3m" },
    { id: "energy", label: "Energy & Commodities", emoji: "⚡", slugs: "wti_crude,natgas_spot,diesel,coal_spot,aluminum" },
    { id: "labor",  label: "Labor & Wages",   emoji: "👷", slugs: "avg_hourly_earnings,unemployment,nfci,cpi_all" },
    { id: "trade",  label: "Trade & Industry", emoji: "🚢", slugs: "ppi_finished,steel_mill,aluminum,copper,industrial_gases" },
  ],
  investment: [
    { id: "pe",     label: "PE / Buyouts",    emoji: "🏦", slugs: "corp_profits,hy_spread,ig_spread,fed_funds,nfci" },
    { id: "re",     label: "Real Estate",      emoji: "🏢", slugs: "lumber_soft,steel_mill,concrete,cpi_all,avg_hourly_earnings" },
    { id: "credit", label: "Credit / HY",      emoji: "📉", slugs: "hy_spread,ig_spread,spread_10y3m,fed_funds,vix" },
    { id: "energy", label: "Energy / Infra",   emoji: "⚡", slugs: "wti_crude,natgas_spot,diesel,coal_spot,copper" },
    { id: "public", label: "Public Markets",   emoji: "📊", slugs: "vix,fed_funds,spread_10y3m,corp_profits,nfci" },
  ],
  operations: [
    { id: "supply", label: "Supply Chain",     emoji: "🚚", slugs: "steel_mill,aluminum,copper,plastics_resin,diesel" },
    { id: "mfg",    label: "Manufacturing",    emoji: "🏭", slugs: "steel_mill,aluminum,copper,industrial_gases,ppi_finished" },
    { id: "const",  label: "Construction",     emoji: "🏗️", slugs: "steel_mill,lumber_soft,concrete,drywall,copper_wire" },
    { id: "food",   label: "Food & Ag",        emoji: "🌾", slugs: "cpi_food,corn_spot,wheat_spot,soybean_spot,diesel" },
    { id: "energy", label: "Energy / Fleet",   emoji: "⛽", slugs: "diesel,jet_fuel,natgas_spot,wti_crude,coal_spot" },
  ],
  other: [
    { id: "all",    label: "Explore everything", emoji: "🔍", slugs: "" },
    { id: "macro",  label: "Macro snapshot",     emoji: "🌍", slugs: "cpi_all,fed_funds,spread_10y3m,unemployment,nfci" },
    { id: "costs",  label: "Cost pressure index",emoji: "📊", slugs: "ppi_finished,avg_hourly_earnings,cpi_all,steel_mill,diesel" },
    { id: "energy", label: "Energy mix",          emoji: "⚡", slugs: "wti_crude,natgas_spot,diesel,coal_spot,jet_fuel" },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function builderUrl(slugs: string) {
  if (!slugs) return "https://portal.costsignal.io/builder";
  return `https://portal.costsignal.io/builder?s=${slugs}`;
}

// ── Step indicators ───────────────────────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: "0.375rem", justifyContent: "center", marginBottom: "1.75rem" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current - 1 ? "1.5rem" : "0.5rem",
            height: "0.5rem",
            borderRadius: "100px",
            background: i < current ? "#4ade80" : "#222",
            transition: "all 0.25s ease",
          }}
        />
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function OnboardingModal() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<RoleId | null>(null);
  const [industry, setIndustry] = useState<{ label: string; slugs: string } | null>(null);

  useEffect(() => {
    // Check both localStorage (device) and a server-set cookie (cross-device)
    const localDone = localStorage.getItem("cs_onboarding_done");
    const cookieDone = document.cookie.includes("cs_onboarded=1");
    if (!localDone && !cookieDone) setVisible(true);
  }, []);

  if (!visible) return null;

  function handleRoleSelect(r: RoleId) {
    setRole(r);
    // "Other" with free exploration → skip to step 3 with no industry pre-selection needed
    setStep(2);
  }

  function handleIndustrySelect(ind: { label: string; slugs: string }) {
    setIndustry(ind);
    setStep(3);
  }

  function markDone() {
    localStorage.setItem("cs_onboarding_done", "1");
    // Set a long-lived cookie so it persists across browsers/devices for this user
    document.cookie = "cs_onboarded=1; max-age=31536000; path=/; SameSite=Lax";
  }

  function handleLaunch() {
    markDone();
    window.location.href = builderUrl(industry?.slugs ?? "");
  }

  function handleSkip() {
    markDone();
    window.location.href = "https://portal.costsignal.io/builder";
  }

  const industries = role ? INDUSTRIES[role] : [];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.9)",
        backdropFilter: "blur(8px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          backgroundColor: "#0a0a0a",
          border: "1px solid #2a2a2a",
          borderRadius: "1.25rem",
          maxWidth: "600px",
          width: "100%",
          padding: "2.25rem 2rem",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 0 80px rgba(74,222,128,0.06)",
        }}
      >
        <StepDots current={step} total={3} />

        {/* ── STEP 1: Role ── */}
        {step === 1 && (
          <>
            <h2 style={{ color: "#fff", fontSize: "1.4rem", fontWeight: 700, textAlign: "center", margin: "0 0 0.5rem" }}>
              What&apos;s your role?
            </h2>
            <p style={{ color: "#666", textAlign: "center", fontSize: "0.85rem", margin: "0 0 1.75rem", lineHeight: 1.6 }}>
              We&apos;ll personalise your experience with the most relevant data.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleRoleSelect(r.id)}
                  style={{
                    backgroundColor: "#111",
                    border: "1px solid #1e1e1e",
                    borderRadius: "0.875rem",
                    padding: "1.1rem 1rem",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "border-color 0.15s, background 0.15s",
                    // "Other" spans full width if it's the 5th item
                    gridColumn: r.id === "other" ? "1 / -1" : undefined,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#4ade80";
                    (e.currentTarget as HTMLButtonElement).style.background = "#0d1a10";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#1e1e1e";
                    (e.currentTarget as HTMLButtonElement).style.background = "#111";
                  }}
                >
                  <div style={{ fontSize: "1.25rem", marginBottom: "0.3rem" }}>{r.emoji}</div>
                  <div style={{ color: "#fff", fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.2rem" }}>
                    {r.label}
                  </div>
                  <div style={{ color: "#555", fontSize: "0.75rem", lineHeight: 1.4 }}>{r.desc}</div>
                </button>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <button onClick={handleSkip} style={{ background: "none", border: "none", color: "#4ade80", fontSize: "0.82rem", cursor: "pointer", opacity: 0.7, textDecoration: "underline" }}>
                Skip — I&apos;ll explore on my own
              </button>
            </div>
          </>
        )}

        {/* ── STEP 2: Industry ── */}
        {step === 2 && role && (
          <>
            <h2 style={{ color: "#fff", fontSize: "1.4rem", fontWeight: 700, textAlign: "center", margin: "0 0 0.5rem" }}>
              What industry?
            </h2>
            <p style={{ color: "#666", textAlign: "center", fontSize: "0.85rem", margin: "0 0 1.75rem", lineHeight: 1.6 }}>
              We&apos;ll pre-load the most relevant cost series for you.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
              {industries.map((ind) => (
                <button
                  key={ind.id}
                  onClick={() => handleIndustrySelect({ label: ind.label, slugs: ind.slugs })}
                  style={{
                    backgroundColor: "#111",
                    border: "1px solid #1e1e1e",
                    borderRadius: "0.75rem",
                    padding: "1rem",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#4ade80";
                    (e.currentTarget as HTMLButtonElement).style.background = "#0d1a10";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#1e1e1e";
                    (e.currentTarget as HTMLButtonElement).style.background = "#111";
                  }}
                >
                  <div style={{ fontSize: "1.25rem", marginBottom: "0.3rem" }}>{ind.emoji}</div>
                  <div style={{ color: "#e8e8e8", fontWeight: 600, fontSize: "0.82rem" }}>{ind.label}</div>
                </button>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
              <button
                onClick={() => setStep(1)}
                style={{ background: "none", border: "none", color: "#555", fontSize: "0.8rem", cursor: "pointer", marginRight: "1.25rem" }}
              >
                ← Back
              </button>
              <button onClick={handleSkip} style={{ background: "none", border: "none", color: "#4ade80", fontSize: "0.82rem", cursor: "pointer", opacity: 0.7, textDecoration: "underline" }}>
                Skip
              </button>
            </div>
          </>
        )}

        {/* ── STEP 3: Launch ── */}
        {step === 3 && (
          <>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "#0d2e1a",
                border: "2px solid #4ade80",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                margin: "0 auto 1.25rem",
              }}
            >
              🚀
            </div>
            <h2 style={{ color: "#fff", fontSize: "1.4rem", fontWeight: 700, textAlign: "center", margin: "0 0 0.5rem" }}>
              You&apos;re all set!
            </h2>
            <p style={{ color: "#666", textAlign: "center", fontSize: "0.85rem", margin: "0 0 0.75rem", lineHeight: 1.6 }}>
              {industry
                ? <>We&apos;ve pre-loaded <strong style={{ color: "#e8e8e8" }}>{industry.label}</strong> series in the Builder ready for you.</>
                : <>The Builder is ready — explore 200+ economic data series.</>}
            </p>

            {/* Series preview pills */}
            {industry?.slugs && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", justifyContent: "center", margin: "1rem 0 1.5rem" }}>
                {industry.slugs.split(",").slice(0, 5).map((slug) => (
                  <span
                    key={slug}
                    style={{
                      fontSize: "0.7rem",
                      fontFamily: "monospace",
                      color: "#4ade80",
                      background: "#0d2e1a",
                      border: "1px solid #1a3a1a",
                      padding: "0.2rem 0.6rem",
                      borderRadius: "100px",
                    }}
                  >
                    {slug}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={handleLaunch}
              style={{
                width: "100%",
                padding: "0.875rem",
                background: "#4ade80",
                color: "#000",
                border: "none",
                borderRadius: "10px",
                fontSize: "0.95rem",
                fontWeight: 700,
                cursor: "pointer",
                marginBottom: "0.75rem",
              }}
            >
              Open Builder →
            </button>
            <div style={{ textAlign: "center" }}>
              <button
                onClick={() => setStep(2)}
                style={{ background: "none", border: "none", color: "#555", fontSize: "0.8rem", cursor: "pointer", marginRight: "1.25rem" }}
              >
                ← Back
              </button>
              <button
                onClick={handleSkip}
                style={{ background: "none", border: "none", color: "#555", fontSize: "0.8rem", cursor: "pointer" }}
              >
                Stay on Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
