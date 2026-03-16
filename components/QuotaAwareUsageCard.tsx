"use client";

import { useEffect, useState } from "react";

export default function QuotaAwareUsageCard({
  used,
  limit,
}: {
  used: number;
  limit: number;
}) {
  const [alertPct, setAlertPct] = useState(80);

  useEffect(() => {
    const stored = localStorage.getItem("cs_quota_alert_pct");
    if (stored) setAlertPct(Number(stored));
  }, []);

  const pct = Math.min(100, Math.round((used / limit) * 100));
  const warnThreshold = alertPct;
  const critThreshold = Math.min(warnThreshold + 15, 100);

  const barColor = pct >= critThreshold ? "#f87171" : pct >= warnThreshold ? "#facc15" : "#4ade80";
  const textColor = pct >= critThreshold ? "#f87171" : pct >= warnThreshold ? "#facc15" : "#fff";

  return (
    <>
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem", marginBottom: "0.6rem" }}>
        <span style={{ fontSize: "1.5rem", fontWeight: 700, color: textColor, lineHeight: 1 }}>
          {used.toLocaleString()}
        </span>
        <span style={{ fontSize: "0.78rem", color: "#444" }}>
          / {limit.toLocaleString()}
        </span>
      </div>
      <div style={{ height: "4px", background: "#1e1e1e", borderRadius: "100px", overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: barColor,
          borderRadius: "100px",
          transition: "width 0.4s ease",
        }} />
      </div>
      <div style={{ marginTop: "0.35rem", fontSize: "0.68rem", color: "#444" }}>
        {pct >= critThreshold
          ? <span style={{ color: "#f87171", fontWeight: 600 }}>Limit nearly reached</span>
          : pct >= warnThreshold
          ? <span style={{ color: "#facc15" }}>{pct}% used</span>
          : `${pct}% used`}
      </div>
    </>
  );
}
