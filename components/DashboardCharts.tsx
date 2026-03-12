"use client";

import { useEffect, useRef } from "react";

type DayCount = { date: string; count: number }; // date: "Mon 10", count: N

type SavedConfig = {
  id: string;
  name: string;
  series_slugs: string[];
  from_year: number | null;
  to_year: number | null;
  format: string | null;
  description: string | null;
};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Chart: any;
  }
}

function builderDeepLink(
  seriesSlugs: string[],
  fromYear?: number | null,
  toYear?: number | null,
  format?: string | null
) {
  const params = new URLSearchParams();
  if (seriesSlugs?.length) params.set("slugs", seriesSlugs.join(","));
  if (fromYear) params.set("from", `${fromYear}-1`);
  if (toYear) params.set("to", `${toYear}-12`);
  if (format) params.set("format", format);
  const qs = params.toString();
  return `https://costsignal.io/builder${qs ? `?${qs}` : ""}`;
}

export function WeeklyUsageChart({ days }: { days: DayCount[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null);

  useEffect(() => {
    function renderChart() {
      if (!canvasRef.current || !window.Chart) return;
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }

      const labels = days.map((d) => d.date);
      const data = days.map((d) => d.count);
      const maxVal = Math.max(...data, 1);

      chartRef.current = new window.Chart(canvasRef.current, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "API calls",
              data,
              backgroundColor: data.map((v) =>
                v === 0 ? "#1a1a1a" : `rgba(74, 222, 128, ${0.35 + 0.65 * (v / maxVal)})`
              ),
              borderColor: data.map((v) => (v === 0 ? "#222" : "#4ade80")),
              borderWidth: 1,
              borderRadius: 4,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 400 },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#111",
              borderColor: "#2a2a2a",
              borderWidth: 1,
              titleColor: "#fff",
              bodyColor: "#aaa",
              padding: 10,
              callbacks: {
                label: (ctx: { parsed: { y: number } }) =>
                  `${ctx.parsed.y} call${ctx.parsed.y !== 1 ? "s" : ""}`,
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                color: "#555",
                font: { size: 11, family: "Inter, sans-serif" },
              },
              border: { color: "#1a1a1a" },
            },
            y: {
              beginAtZero: true,
              grid: { color: "#141414" },
              ticks: {
                color: "#444",
                font: { size: 10, family: "Inter, sans-serif" },
                precision: 0,
                maxTicksLimit: 5,
              },
              border: { color: "#1a1a1a", dash: [3, 3] },
            },
          },
        },
      });
    }

    if (window.Chart) {
      renderChart();
    } else {
      // Load Chart.js from CDN if not already loaded
      const existing = document.getElementById("chartjs-cdn");
      if (!existing) {
        const script = document.createElement("script");
        script.id = "chartjs-cdn";
        script.src = "https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js";
        script.onload = renderChart;
        document.head.appendChild(script);
      } else {
        // Script tag exists but Chart may not be ready yet; poll briefly
        let attempts = 0;
        const poll = setInterval(() => {
          attempts++;
          if (window.Chart) {
            clearInterval(poll);
            renderChart();
          } else if (attempts > 40) {
            clearInterval(poll);
          }
        }, 100);
      }
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [days]);

  const totalCalls = days.reduce((s, d) => s + d.count, 0);

  return (
    <div
      style={{
        background: "#111",
        border: "1px solid #1e1e1e",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "1rem 1.25rem 0.75rem",
          borderBottom: "1px solid #1a1a1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2 style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff", margin: 0 }}>
          Last 7 days
        </h2>
        <span
          style={{
            fontSize: "0.75rem",
            color: totalCalls > 0 ? "#4ade80" : "#444",
            fontWeight: 600,
          }}
        >
          {totalCalls} call{totalCalls !== 1 ? "s" : ""}
        </span>
      </div>
      <div style={{ padding: "1rem 1.25rem", height: "140px", position: "relative" }}>
        {totalCalls === 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#333",
              fontSize: "0.8rem",
            }}
          >
            No API calls yet — make your first request to see activity
          </div>
        )}
        <canvas ref={canvasRef} style={{ opacity: totalCalls === 0 ? 0.2 : 1 }} />
      </div>
    </div>
  );
}

export function RecentPresets({ configs }: { configs: SavedConfig[] }) {
  if (configs.length === 0) return null;

  return (
    <div
      style={{
        background: "#111",
        border: "1px solid #1e1e1e",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "1rem 1.25rem 0.75rem",
          borderBottom: "1px solid #1a1a1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2 style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff", margin: 0 }}>
          Recent presets
        </h2>
        <a
          href="/dashboard/platform/configs"
          style={{ fontSize: "0.75rem", color: "#4ade80", textDecoration: "none" }}
        >
          View all →
        </a>
      </div>
      <div style={{ padding: "0.75rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {configs.slice(0, 3).map((cfg) => (
          <a
            key={cfg.id}
            href={builderDeepLink(cfg.series_slugs, cfg.from_year, cfg.to_year, cfg.format)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.6rem 0.875rem",
              background: "#0d0d0d",
              border: "1px solid #1a1a1a",
              borderRadius: "8px",
              textDecoration: "none",
              transition: "border-color 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1e3a1e";
              (e.currentTarget as HTMLAnchorElement).style.background = "#0f1a0f";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1a1a1a";
              (e.currentTarget as HTMLAnchorElement).style.background = "#0d0d0d";
            }}
          >
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#e8e8e8",
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "260px",
                }}
              >
                {cfg.name}
              </p>
              <p style={{ fontSize: "0.7rem", color: "#444", margin: "0.1rem 0 0" }}>
                {cfg.series_slugs.length} series
                {cfg.from_year && cfg.to_year
                  ? ` · ${cfg.from_year}–${cfg.to_year}`
                  : ""}
              </p>
            </div>
            <span
              style={{
                fontSize: "0.72rem",
                color: "#4ade80",
                fontWeight: 700,
                letterSpacing: "0.02em",
                flexShrink: 0,
                marginLeft: "0.75rem",
              }}
            >
              Load →
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
