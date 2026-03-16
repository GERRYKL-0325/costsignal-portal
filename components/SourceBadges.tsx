"use client";

/** Derives data-source badges from an array of series slugs.
 *  Each unique source prefix (bls, eia, fred, census, etc.) gets a
 *  color-coded chip. Only shows up to 3 unique sources to keep it compact.
 */

type Source = {
  key: string;
  label: string;
  bg: string;
  color: string;
};

const SOURCE_MAP: Record<string, Omit<Source, "key">> = {
  bls:    { label: "BLS",    bg: "#1a2a4a", color: "#60a5fa" },
  eia:    { label: "EIA",    bg: "#2a1a10", color: "#fb923c" },
  fred:   { label: "FRED",   bg: "#1a1a3a", color: "#a78bfa" },
  census: { label: "Census", bg: "#2a1a1a", color: "#f87171" },
  ism:    { label: "ISM",    bg: "#1a2a2a", color: "#34d399" },
  pmi:    { label: "PMI",    bg: "#1a2a2a", color: "#34d399" },
};

function detectSources(slugs: string[]): Source[] {
  const seen = new Set<string>();
  const result: Source[] = [];

  for (const slug of slugs) {
    const parts = slug.split("-");
    if (!parts.length) continue;
    // Try 1-part prefix first, then 2-part (e.g. "bls-ppi" → "bls")
    const prefix = parts[0].toLowerCase();
    if (!seen.has(prefix)) {
      const meta = SOURCE_MAP[prefix];
      if (meta) {
        seen.add(prefix);
        result.push({ key: prefix, ...meta });
      } else {
        // Unknown source — use a generic neutral badge
        seen.add(prefix);
        result.push({ key: prefix, label: prefix.toUpperCase(), bg: "#1a1a1a", color: "#666" });
      }
    }
    if (result.length >= 3) break;
  }

  return result;
}

export function SourceBadges({
  slugs,
  maxShow = 3,
}: {
  slugs: string[];
  maxShow?: number;
}) {
  const sources = detectSources(slugs).slice(0, maxShow);
  if (sources.length === 0) return null;

  return (
    <span style={{ display: "inline-flex", gap: "0.3rem", flexWrap: "wrap" }}>
      {sources.map((s) => (
        <span
          key={s.key}
          style={{
            background: s.bg,
            color: s.color,
            fontSize: "0.6rem",
            fontWeight: 700,
            fontFamily: "monospace",
            letterSpacing: "0.04em",
            padding: "0.1rem 0.4rem",
            borderRadius: "3px",
            lineHeight: 1.6,
          }}
        >
          {s.label}
        </span>
      ))}
    </span>
  );
}
