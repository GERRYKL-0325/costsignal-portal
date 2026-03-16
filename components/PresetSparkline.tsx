"use client";

/** Deterministic sparkline SVG from a list of series slugs.
 *  No real data is used — points are seeded by hashing the slugs,
 *  giving each preset a visually unique but consistent thumbnail.
 */

function hashStr(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function seededPoints(seed: number, count = 9): number[] {
  const rand = lcg(seed);
  // Base random walk
  const pts: number[] = [];
  let v = 0.3 + rand() * 0.4;
  for (let i = 0; i < count; i++) {
    v += (rand() - 0.48) * 0.28;
    v = Math.max(0.06, Math.min(0.94, v));
    pts.push(v);
  }
  return pts;
}

function smoothPath(
  pts: number[],
  width: number,
  height: number,
  pad: number
): string {
  const w = width - pad * 2;
  const h = height - pad * 2;
  const coords = pts.map((v, i) => [
    pad + (i / (pts.length - 1)) * w,
    pad + (1 - v) * h,
  ]);

  let d = `M ${coords[0][0].toFixed(1)} ${coords[0][1].toFixed(1)}`;
  for (let i = 1; i < coords.length; i++) {
    const [x1, y1] = coords[i - 1];
    const [x2, y2] = coords[i];
    const cpx = ((x1 + x2) / 2).toFixed(1);
    d += ` C ${cpx} ${y1.toFixed(1)}, ${cpx} ${y2.toFixed(1)}, ${x2.toFixed(
      1
    )} ${y2.toFixed(1)}`;
  }
  return d;
}

export function PresetSparkline({
  slugs,
  width = 88,
  height = 36,
  color = "#4ade80",
}: {
  slugs: string[];
  width?: number;
  height?: number;
  color?: string;
}) {
  const seed = slugs.reduce(
    (acc, s) => ((acc << 5) + acc + hashStr(s)) >>> 0,
    5381
  );
  const pts = seededPoints(seed);
  const pad = 3;
  const linePath = smoothPath(pts, width, height, pad);

  // Close path downward for fill area
  const coordsLast = pts.at(-1)!;
  const coordsFirst = pts[0];
  const w = width - pad * 2;
  const h = height - pad * 2;
  const firstX = pad;
  const lastX = pad + w;
  const bottom = pad + h + 1;
  const firstY = pad + (1 - coordsFirst) * h;
  const fillPath =
    linePath +
    ` L ${lastX.toFixed(1)} ${bottom.toFixed(1)} L ${firstX.toFixed(
      1
    )} ${bottom.toFixed(1)} L ${firstX.toFixed(1)} ${firstY.toFixed(1)} Z`;

  // Dot at last point
  const dotX = lastX;
  const dotY = (pad + (1 - coordsLast) * h).toFixed(1);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`sg-${seed}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity={0.18} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#sg-${seed})`} />
      <path
        d={linePath}
        stroke={color}
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.9}
      />
      <circle cx={dotX} cy={dotY} r={2.5} fill={color} />
    </svg>
  );
}
