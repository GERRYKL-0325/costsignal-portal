"use client";

import { useEffect, useState } from "react";

const USE_CASES = [
  {
    emoji: "🏗️",
    title: "Construction & Real Estate",
    description: "Track input costs for project budgeting",
    slugs: "steel_mill,lumber_soft,concrete,drywall,copper_wire,diesel",
  },
  {
    emoji: "🏭",
    title: "Manufacturing & Industrials",
    description: "Monitor raw material costs and margins",
    slugs: "steel_mill,aluminum,copper,industrial_gases,plastics_resin",
  },
  {
    emoji: "⚡",
    title: "Energy & Commodities",
    description: "Follow oil, gas, and commodity prices",
    slugs: "wti_crude,natgas_spot,diesel,jet_fuel,coal_spot",
  },
  {
    emoji: "📈",
    title: "Finance & Investment",
    description: "Track macro signals and credit conditions",
    slugs: "fed_funds,hy_spread,ig_spread,spread_10y3m,vix,nfci",
  },
  {
    emoji: "📊",
    title: "FP&A / Corporate Finance",
    description: "Monitor inflation and cost pressures on margins",
    slugs: "cpi_all,avg_hourly_earnings,corp_profits,personal_saving_rate,ppi_finished",
  },
  {
    emoji: "🔍",
    title: "Research & Analysis",
    description: "Explore all data freely",
    slugs: null,
  },
];

export default function OnboardingModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem("cs_onboarding_done");
    if (!done) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function handleSelect(slugs: string | null) {
    localStorage.setItem("cs_onboarding_done", "1");
    const url = slugs
      ? `https://portal.costsignal.io/builder?s=${slugs}`
      : "https://portal.costsignal.io/builder";
    window.location.href = url;
  }

  function handleSkip() {
    localStorage.setItem("cs_onboarding_done", "1");
    window.location.href = "https://portal.costsignal.io/builder";
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.85)",
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
          borderRadius: "1rem",
          maxWidth: "680px",
          width: "100%",
          padding: "2rem",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h2
          style={{
            color: "#fff",
            fontSize: "1.5rem",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "0.5rem",
          }}
        >
          What are you analyzing?
        </h2>
        <p
          style={{
            color: "#888",
            textAlign: "center",
            fontSize: "0.9rem",
            marginBottom: "1.75rem",
          }}
        >
          We&apos;ll pre-load the most relevant data series for your workflow.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "0.75rem",
          }}
        >
          {USE_CASES.map((uc) => (
            <button
              key={uc.title}
              onClick={() => handleSelect(uc.slugs)}
              style={{
                backgroundColor: "#111",
                border: "1px solid #1e1e1e",
                borderRadius: "0.75rem",
                padding: "1rem",
                textAlign: "left",
                cursor: "pointer",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#4ade80";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#1e1e1e";
              }}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>
                {uc.emoji}
              </div>
              <div
                style={{
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  marginBottom: "0.25rem",
                }}
              >
                {uc.title}
              </div>
              <div style={{ color: "#888", fontSize: "0.8rem" }}>
                {uc.description}
              </div>
            </button>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <button
            onClick={handleSkip}
            style={{
              background: "none",
              border: "none",
              color: "#4ade80",
              fontSize: "0.85rem",
              cursor: "pointer",
              textDecoration: "underline",
              opacity: 0.8,
            }}
          >
            Skip — I&apos;ll explore on my own
          </button>
        </div>
      </div>
    </div>
  );
}
