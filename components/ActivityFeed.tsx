"use client";

import { useEffect, useState } from "react";

export type ActivityItem = {
  type: "series_added" | "preset_saved" | "api_key_created" | "download";
  label: string;
  ts: number; // epoch ms
};

const LS_KEY = "cs_activity";
const MAX_ITEMS = 20;

export function pushActivity(item: Omit<ActivityItem, "ts">) {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const existing: ActivityItem[] = raw ? JSON.parse(raw) : [];
    const next: ActivityItem[] = [
      { ...item, ts: Date.now() },
      ...existing,
    ].slice(0, MAX_ITEMS);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  } catch {
    // localStorage may be unavailable
  }
}

function timeAgo(ts: number): string {
  const diffMs = Date.now() - ts;
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}

const ICONS: Record<ActivityItem["type"], string> = {
  series_added: "📈",
  preset_saved: "💾",
  api_key_created: "🔑",
  download: "⬇️",
};

export default function ActivityFeed() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const parsed: ActivityItem[] = raw ? JSON.parse(raw) : [];
      setItems(parsed.slice(0, 5));
    } catch {
      setItems([]);
    }
    setLoaded(true);
  }, []);

  if (!loaded) return null;

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
        <h2
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "#fff",
            margin: 0,
          }}
        >
          Recent Activity
        </h2>
      </div>

      {items.length === 0 ? (
        <div
          style={{
            padding: "2rem 1.25rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "#1a1a1a",
              margin: "0 auto 0.75rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.25rem",
            }}
          >
            📋
          </div>
          <p
            style={{
              color: "#444",
              fontSize: "0.8rem",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            No activity yet.{" "}
            <a
              href="/builder"
              style={{ color: "#4ade80", textDecoration: "none" }}
            >
              Open the Builder →
            </a>
          </p>
        </div>
      ) : (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: "0.25rem 0",
          }}
        >
          {items.map((item, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                padding: "0.6rem 1.25rem",
                borderBottom:
                  i < items.length - 1 ? "1px solid #141414" : "none",
              }}
            >
              <span style={{ fontSize: "0.9rem", flexShrink: 0 }}>
                {ICONS[item.type]}
              </span>
              <span
                style={{
                  flex: 1,
                  fontSize: "0.8rem",
                  color: "#bbb",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </span>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "#444",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {timeAgo(item.ts)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
