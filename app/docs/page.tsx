import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Reference — CostSignal",
  description: "Complete API reference for the CostSignal REST API. Authenticate, fetch series, and export data.",
};

// ---------------------------------------------------------------------------
// Static code examples
// ---------------------------------------------------------------------------

const CURL_AUTH = `curl https://api.costsignal.io/v1/series \\
  -H "X-API-Key: cs_live_yourkey"`;

const CURL_DATA = `curl "https://api.costsignal.io/v1/data/ppi-metals?from=2020-01&to=2024-12" \\
  -H "X-API-Key: cs_live_yourkey"`;

const CURL_EXPORT = `curl "https://api.costsignal.io/v1/export/excel?slugs=ppi-metals,cpi-all&from=2020-01" \\
  -H "X-API-Key: cs_live_yourkey" \\
  --output report.xlsx`;

const PYTHON_AUTH = `import requests

API_KEY = "cs_live_yourkey"
BASE_URL = "https://api.costsignal.io/v1"
HEADERS = {"X-API-Key": API_KEY}

# List all series
r = requests.get(f"{BASE_URL}/series", headers=HEADERS)
series = r.json()
print(f"{len(series['data'])} series available")`;

const PYTHON_DATA = `# Fetch data for a specific series
r = requests.get(
    f"{BASE_URL}/data/ppi-metals",
    headers=HEADERS,
    params={"from": "2020-01", "to": "2024-12"},
)
result = r.json()
for point in result["data"][:5]:
    print(point["date"], point["value"])`;

const PYTHON_EXPORT = `# Download an Excel workbook
r = requests.get(
    f"{BASE_URL}/export/excel",
    headers=HEADERS,
    params={"slugs": "ppi-metals,cpi-all", "from": "2020-01"},
)
with open("report.xlsx", "wb") as f:
    f.write(r.content)`;

const JS_AUTH = `const API_KEY = "cs_live_yourkey";
const BASE_URL = "https://api.costsignal.io/v1";

// List all series
const res = await fetch(\`\${BASE_URL}/series\`, {
  headers: { "X-API-Key": API_KEY },
});
const { data } = await res.json();
console.log(\`\${data.length} series available\`);`;

const JS_DATA = `// Fetch data for a specific series
const params = new URLSearchParams({ from: "2020-01", to: "2024-12" });
const res = await fetch(
  \`\${BASE_URL}/data/ppi-metals?\${params}\`,
  { headers: { "X-API-Key": API_KEY } }
);
const result = await res.json();
result.data.slice(0, 5).forEach(({ date, value }) =>
  console.log(date, value)
);`;

const JS_EXPORT = `// Download an Excel workbook
const params = new URLSearchParams({
  slugs: "ppi-metals,cpi-all",
  from: "2020-01",
});
const res = await fetch(
  \`\${BASE_URL}/export/excel?\${params}\`,
  { headers: { "X-API-Key": API_KEY } }
);
const blob = await res.blob();
// In a browser context:
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url; a.download = "report.xlsx"; a.click();`;

const SERIES_RESPONSE = `{
  "data": [
    {
      "slug": "ppi-metals",
      "name": "PPI — Metals & Metal Products",
      "source": "BLS",
      "category": "Manufacturing",
      "frequency": "monthly",
      "description": "Producer Price Index for metals and metal products, NSA",
      "available_from": "2015-01",
      "available_to": "2024-11"
    },
    // ... 149 more series
  ],
  "total": 150,
  "meta": {
    "request_id": "req_abc123",
    "quota_used": 1,
    "quota_remaining": 9999
  }
}`;

const DATA_RESPONSE = `{
  "slug": "ppi-metals",
  "name": "PPI — Metals & Metal Products",
  "source": "BLS",
  "unit": "Index (1982=100)",
  "frequency": "monthly",
  "data": [
    { "date": "2020-01", "value": 175.3 },
    { "date": "2020-02", "value": 174.8 },
    { "date": "2020-03", "value": 169.1 },
    // ...
    { "date": "2024-12", "value": 223.7 }
  ],
  "meta": {
    "request_id": "req_def456",
    "points": 60,
    "quota_used": 1,
    "quota_remaining": 9998
  }
}`;

const ERROR_RESPONSE = `{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing API key. Pass your key in the X-API-Key header.",
    "docs": "https://portal.costsignal.io/docs"
  }
}`;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  return (
    <pre
      style={{
        background: "#111",
        border: "1px solid #2a2a2a",
        borderRadius: "8px",
        padding: "1rem 1.25rem",
        overflowX: "auto",
        fontSize: "0.8rem",
        lineHeight: 1.65,
        color: "#d4d4d4",
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace",
        whiteSpace: "pre",
        margin: 0,
      }}
    >
      <code>{code}</code>
    </pre>
  );
}

function Badge({
  label,
  color,
}: {
  label: string;
  color: "green" | "blue" | "gray" | "yellow";
}) {
  const colors: Record<string, { bg: string; text: string }> = {
    green: { bg: "#14532d", text: "#4ade80" },
    blue: { bg: "#1e3a5f", text: "#60a5fa" },
    gray: { bg: "#2a2a2a", text: "#9ca3af" },
    yellow: { bg: "#451a03", text: "#fbbf24" },
  };
  const { bg, text } = colors[color];
  return (
    <span
      style={{
        background: bg,
        color: text,
        borderRadius: "4px",
        padding: "2px 8px",
        fontSize: "0.7rem",
        fontWeight: 700,
        fontFamily: "monospace",
        letterSpacing: "0.02em",
        display: "inline-block",
      }}
    >
      {label}
    </span>
  );
}

function SectionAnchor({ id, title }: { id: string; title: string }) {
  return (
    <h2
      id={id}
      style={{
        fontSize: "1.125rem",
        fontWeight: 700,
        color: "#fff",
        marginTop: "2.5rem",
        marginBottom: "0.75rem",
        paddingBottom: "0.5rem",
        borderBottom: "1px solid #2a2a2a",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      {title}
    </h2>
  );
}

interface EndpointRowProps {
  method: "GET" | "POST" | "DELETE";
  path: string;
  description: string;
  auth?: boolean;
}
function EndpointRow({ method, path, description, auth = true }: EndpointRowProps) {
  const methodColor: Record<string, string> = {
    GET: "#4ade80",
    POST: "#60a5fa",
    DELETE: "#f87171",
  };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        padding: "0.75rem 1rem",
        background: "#111",
        border: "1px solid #2a2a2a",
        borderRadius: "8px",
        marginBottom: "0.5rem",
      }}
    >
      <span
        style={{
          color: methodColor[method],
          fontFamily: "monospace",
          fontWeight: 700,
          fontSize: "0.75rem",
          minWidth: "2.5rem",
          paddingTop: "1px",
        }}
      >
        {method}
      </span>
      <code style={{ color: "#e8e8e8", fontSize: "0.82rem", flex: "0 0 auto", minWidth: "220px" }}>
        {path}
      </code>
      <span style={{ color: "#9ca3af", fontSize: "0.82rem", flex: 1 }}>{description}</span>
      {auth && (
        <span style={{ color: "#555", fontSize: "0.72rem", whiteSpace: "nowrap" }}>
          🔑 auth
        </span>
      )}
    </div>
  );
}

interface ParamRowProps {
  name: string;
  type: string;
  required?: boolean;
  description: string;
}
function ParamRow({ name, type, required, description }: ParamRowProps) {
  return (
    <tr>
      <td
        style={{
          padding: "0.5rem 0.75rem",
          fontFamily: "monospace",
          fontSize: "0.78rem",
          color: "#e8e8e8",
          borderBottom: "1px solid #1e1e1e",
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </td>
      <td
        style={{
          padding: "0.5rem 0.75rem",
          fontSize: "0.78rem",
          color: "#60a5fa",
          borderBottom: "1px solid #1e1e1e",
          fontFamily: "monospace",
        }}
      >
        {type}
      </td>
      <td
        style={{
          padding: "0.5rem 0.75rem",
          fontSize: "0.72rem",
          borderBottom: "1px solid #1e1e1e",
        }}
      >
        {required ? (
          <Badge label="required" color="yellow" />
        ) : (
          <Badge label="optional" color="gray" />
        )}
      </td>
      <td
        style={{
          padding: "0.5rem 0.75rem",
          fontSize: "0.78rem",
          color: "#9ca3af",
          borderBottom: "1px solid #1e1e1e",
        }}
      >
        {description}
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Tabs (client component for interactivity)
// ---------------------------------------------------------------------------

import DocsTabGroup from "./DocsTabGroup";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DocsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d" }}>
      {/* Top bar */}
      <div
        style={{
          borderBottom: "1px solid #1e1e1e",
          padding: "1rem 1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          background: "#111",
        }}
      >
        <Link
          href="/dashboard"
          style={{ color: "#555", fontSize: "0.82rem", textDecoration: "none" }}
        >
          ← Dashboard
        </Link>
        <span style={{ color: "#333" }}>/</span>
        <span style={{ color: "#e8e8e8", fontSize: "0.82rem", fontWeight: 600 }}>
          API Reference
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Badge label="v1" color="green" />
          <Badge label="150+ series" color="blue" />
        </div>
      </div>

      <div style={{ display: "flex", maxWidth: "1100px", margin: "0 auto" }}>
        {/* Left sidebar — TOC */}
        <aside
          style={{
            width: "200px",
            flexShrink: 0,
            padding: "2rem 1rem",
            borderRight: "1px solid #1e1e1e",
            position: "sticky",
            top: 0,
            height: "100vh",
            overflowY: "auto",
          }}
          className="hidden md:block"
        >
          <p style={{ color: "#555", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
            Contents
          </p>
          {[
            { id: "overview", label: "Overview" },
            { id: "auth", label: "Authentication" },
            { id: "rate-limits", label: "Rate limits" },
            { id: "endpoints", label: "Endpoints" },
            { id: "series-list", label: "→ GET /series" },
            { id: "series-data", label: "→ GET /data/{slug}" },
            { id: "export", label: "→ GET /export/excel" },
            { id: "errors", label: "Errors" },
            { id: "examples", label: "Examples" },
          ].map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              style={{
                display: "block",
                color: "#666",
                fontSize: "0.78rem",
                textDecoration: "none",
                padding: "0.3rem 0",
                paddingLeft: label.startsWith("→") ? "0.75rem" : "0",
              }}
            >
              {label}
            </a>
          ))}
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: "2rem 2.5rem", maxWidth: "800px" }}>
          {/* Hero */}
          <div style={{ marginBottom: "2.5rem" }}>
            <h1
              style={{
                fontSize: "1.75rem",
                fontWeight: 800,
                color: "#fff",
                marginBottom: "0.5rem",
                letterSpacing: "-0.02em",
              }}
            >
              API Reference
            </h1>
            <p style={{ color: "#9ca3af", lineHeight: 1.6, maxWidth: "560px" }}>
              The CostSignal API gives programmatic access to 150+ economic cost series — producer
              prices, commodities, labor, energy, and freight — updated monthly from BLS, EIA, and
              FRED.
            </p>
          </div>

          {/* ── Overview ── */}
          <SectionAnchor id="overview" title="Overview" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "0.75rem",
              marginBottom: "1.5rem",
            }}
          >
            {[
              { label: "Base URL", value: "api.costsignal.io/v1", icon: "🌐" },
              { label: "Format", value: "JSON (UTF-8)", icon: "📄" },
              { label: "Auth", value: "X-API-Key header", icon: "🔑" },
            ].map(({ label, value, icon }) => (
              <div
                key={label}
                style={{
                  background: "#111",
                  border: "1px solid #2a2a2a",
                  borderRadius: "8px",
                  padding: "0.875rem 1rem",
                }}
              >
                <span style={{ fontSize: "1rem" }}>{icon}</span>
                <p style={{ color: "#555", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "0.5rem", marginBottom: "0.2rem" }}>
                  {label}
                </p>
                <p style={{ color: "#e8e8e8", fontSize: "0.82rem", fontFamily: "monospace" }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* ── Auth ── */}
          <SectionAnchor id="auth" title="Authentication" />
          <p style={{ color: "#9ca3af", fontSize: "0.875rem", lineHeight: 1.65, marginBottom: "1rem" }}>
            Every request must include your API key in the{" "}
            <code
              style={{
                background: "#1e1e1e",
                borderRadius: "4px",
                padding: "1px 6px",
                fontSize: "0.78rem",
                color: "#4ade80",
              }}
            >
              X-API-Key
            </code>{" "}
            header. Keys are prefixed with{" "}
            <code
              style={{
                background: "#1e1e1e",
                borderRadius: "4px",
                padding: "1px 6px",
                fontSize: "0.78rem",
                color: "#4ade80",
              }}
            >
              cs_live_
            </code>
            . Generate and manage keys in the{" "}
            <Link href="/dashboard/keys" style={{ color: "#4ade80", textDecoration: "none" }}>
              API Keys
            </Link>{" "}
            section of the dashboard.
          </p>
          <CodeBlock code={CURL_AUTH} />

          <div
            style={{
              background: "#1a1a0a",
              border: "1px solid #2a2a00",
              borderRadius: "8px",
              padding: "0.875rem 1rem",
              marginTop: "1rem",
              fontSize: "0.82rem",
              color: "#d1d5db",
              display: "flex",
              gap: "0.625rem",
            }}
          >
            <span>⚠️</span>
            <span>
              Never expose your API key in client-side code or public repositories. Rotate keys immediately if compromised via{" "}
              <Link href="/dashboard/keys" style={{ color: "#fbbf24" }}>
                the keys page
              </Link>
              .
            </span>
          </div>

          {/* ── Rate Limits ── */}
          <SectionAnchor id="rate-limits" title="Rate Limits" />
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#111",
              border: "1px solid #2a2a2a",
              borderRadius: "8px",
              overflow: "hidden",
              marginBottom: "1rem",
              fontSize: "0.82rem",
            }}
          >
            <thead>
              <tr style={{ background: "#161616" }}>
                {["Plan", "Calls / month", "Calls / day", "Burst"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "0.625rem 1rem",
                      textAlign: "left",
                      color: "#666",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      borderBottom: "1px solid #2a2a2a",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { plan: "Free", monthly: "100", daily: "10", burst: "5 / min" },
                { plan: "Pro", monthly: "10,000", daily: "500", burst: "60 / min" },
                { plan: "API", monthly: "30,000", daily: "1,000", burst: "120 / min" },
                { plan: "Enterprise", monthly: "Custom", daily: "Custom", burst: "Custom" },
              ].map(({ plan, monthly, daily, burst }) => (
                <tr key={plan}>
                  <td style={{ padding: "0.5rem 1rem", color: "#e8e8e8", borderBottom: "1px solid #1e1e1e", fontWeight: 600 }}>{plan}</td>
                  <td style={{ padding: "0.5rem 1rem", color: "#9ca3af", borderBottom: "1px solid #1e1e1e" }}>{monthly}</td>
                  <td style={{ padding: "0.5rem 1rem", color: "#9ca3af", borderBottom: "1px solid #1e1e1e" }}>{daily}</td>
                  <td style={{ padding: "0.5rem 1rem", color: "#9ca3af", borderBottom: "1px solid #1e1e1e" }}>{burst}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ color: "#666", fontSize: "0.78rem", marginBottom: "1.5rem" }}>
            When you exceed rate limits the API returns{" "}
            <code style={{ background: "#1e1e1e", borderRadius: "4px", padding: "1px 5px", color: "#f87171" }}>
              429 Too Many Requests
            </code>
            {" "}with a{" "}
            <code style={{ background: "#1e1e1e", borderRadius: "4px", padding: "1px 5px", color: "#e8e8e8" }}>
              Retry-After
            </code>{" "}
            header.
          </p>

          {/* ── Endpoints ── */}
          <SectionAnchor id="endpoints" title="Endpoints" />

          {/* /v1/series */}
          <h3
            id="series-list"
            style={{ color: "#e8e8e8", fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.5rem", marginTop: "1.5rem" }}
          >
            List series
          </h3>
          <EndpointRow method="GET" path="/v1/series" description="Returns metadata for all 150+ available series." />
          <p style={{ color: "#9ca3af", fontSize: "0.82rem", margin: "0.75rem 0" }}>
            No parameters required. Useful for building dropdowns, validating slugs, and discovering available data.
          </p>

          <p style={{ color: "#666", fontSize: "0.78rem", fontWeight: 700, marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Query parameters
          </p>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#111",
              border: "1px solid #2a2a2a",
              borderRadius: "8px",
              overflow: "hidden",
              marginBottom: "1rem",
            }}
          >
            <thead>
              <tr style={{ background: "#161616" }}>
                {["Parameter", "Type", "", "Description"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "0.5rem 0.75rem",
                      textAlign: "left",
                      color: "#555",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      borderBottom: "1px solid #2a2a2a",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <ParamRow name="category" type="string" description="Filter by category slug: manufacturing, energy, labor, freight, real_estate" />
              <ParamRow name="source" type="string" description="Filter by source: BLS, EIA, FRED" />
              <ParamRow name="frequency" type="string" description="Filter by update frequency: monthly, quarterly" />
            </tbody>
          </table>

          <p style={{ color: "#666", fontSize: "0.78rem", fontWeight: 700, marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Response
          </p>
          <CodeBlock code={SERIES_RESPONSE} lang="json" />

          {/* /v1/data/{slug} */}
          <h3
            id="series-data"
            style={{ color: "#e8e8e8", fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.5rem", marginTop: "2rem" }}
          >
            Fetch series data
          </h3>
          <EndpointRow method="GET" path="/v1/data/{slug}" description="Returns time-series data points for a single series." />
          <p style={{ color: "#9ca3af", fontSize: "0.82rem", margin: "0.75rem 0" }}>
            Replace{" "}
            <code style={{ background: "#1e1e1e", borderRadius: "4px", padding: "1px 5px", color: "#60a5fa" }}>
              {"{slug}"}
            </code>{" "}
            with a series identifier such as{" "}
            <code style={{ background: "#1e1e1e", borderRadius: "4px", padding: "1px 5px", color: "#4ade80" }}>
              ppi-metals
            </code>
            . Get the full slug list from{" "}
            <code style={{ background: "#1e1e1e", borderRadius: "4px", padding: "1px 5px", color: "#4ade80" }}>
              /v1/series
            </code>
            .
          </p>

          <p style={{ color: "#666", fontSize: "0.78rem", fontWeight: 700, marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Query parameters
          </p>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#111",
              border: "1px solid #2a2a2a",
              borderRadius: "8px",
              overflow: "hidden",
              marginBottom: "1rem",
            }}
          >
            <thead>
              <tr style={{ background: "#161616" }}>
                {["Parameter", "Type", "", "Description"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "0.5rem 0.75rem",
                      textAlign: "left",
                      color: "#555",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      borderBottom: "1px solid #2a2a2a",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <ParamRow name="from" type="string" description="Start month in YYYY-MM format. Defaults to earliest available." />
              <ParamRow name="to" type="string" description="End month in YYYY-MM format. Defaults to latest available." />
              <ParamRow name="format" type="string" description="Response format. json (default) or csv." />
            </tbody>
          </table>

          <p style={{ color: "#666", fontSize: "0.78rem", fontWeight: 700, marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Response
          </p>
          <CodeBlock code={DATA_RESPONSE} lang="json" />

          {/* /v1/export/excel */}
          <h3
            id="export"
            style={{ color: "#e8e8e8", fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.5rem", marginTop: "2rem" }}
          >
            Export to Excel
          </h3>
          <EndpointRow method="GET" path="/v1/export/excel" description="Returns a formatted .xlsx workbook with one sheet per series." />
          <p style={{ color: "#9ca3af", fontSize: "0.82rem", margin: "0.75rem 0" }}>
            Generates a formatted Excel workbook with one sheet per series, a summary tab, and pre-applied number formatting. Counts as one API call per slug requested.
          </p>

          <p style={{ color: "#666", fontSize: "0.78rem", fontWeight: 700, marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Query parameters
          </p>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#111",
              border: "1px solid #2a2a2a",
              borderRadius: "8px",
              overflow: "hidden",
              marginBottom: "1rem",
            }}
          >
            <thead>
              <tr style={{ background: "#161616" }}>
                {["Parameter", "Type", "", "Description"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "0.5rem 0.75rem",
                      textAlign: "left",
                      color: "#555",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      borderBottom: "1px solid #2a2a2a",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <ParamRow name="slugs" required type="string" description="Comma-separated list of series slugs. Max 20 per request." />
              <ParamRow name="from" type="string" description="Start month in YYYY-MM format." />
              <ParamRow name="to" type="string" description="End month in YYYY-MM format." />
            </tbody>
          </table>
          <p style={{ color: "#555", fontSize: "0.78rem", marginBottom: "1.5rem" }}>
            Response content-type:{" "}
            <code style={{ background: "#1e1e1e", borderRadius: "4px", padding: "1px 5px", color: "#e8e8e8" }}>
              application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
            </code>
          </p>

          {/* ── Errors ── */}
          <SectionAnchor id="errors" title="Error codes" />
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#111",
              border: "1px solid #2a2a2a",
              borderRadius: "8px",
              overflow: "hidden",
              marginBottom: "1rem",
            }}
          >
            <thead>
              <tr style={{ background: "#161616" }}>
                {["Status", "Code", "Meaning"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "0.5rem 0.75rem",
                      textAlign: "left",
                      color: "#555",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      borderBottom: "1px solid #2a2a2a",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { status: "400", code: "BAD_REQUEST", meaning: "Missing or invalid query parameter." },
                { status: "401", code: "UNAUTHORIZED", meaning: "API key missing, invalid, or revoked." },
                { status: "403", code: "FORBIDDEN", meaning: "Your plan does not include API access." },
                { status: "404", code: "NOT_FOUND", meaning: "Series slug does not exist." },
                { status: "429", code: "RATE_LIMITED", meaning: "Monthly or per-minute quota exceeded." },
                { status: "500", code: "INTERNAL_ERROR", meaning: "Unexpected server error. Contact support." },
              ].map(({ status, code, meaning }) => (
                <tr key={status}>
                  <td style={{ padding: "0.5rem 0.75rem", fontFamily: "monospace", color: Number(status) >= 500 ? "#f87171" : Number(status) >= 400 ? "#fbbf24" : "#4ade80", borderBottom: "1px solid #1e1e1e", fontSize: "0.82rem" }}>{status}</td>
                  <td style={{ padding: "0.5rem 0.75rem", fontFamily: "monospace", color: "#e8e8e8", borderBottom: "1px solid #1e1e1e", fontSize: "0.78rem" }}>{code}</td>
                  <td style={{ padding: "0.5rem 0.75rem", color: "#9ca3af", borderBottom: "1px solid #1e1e1e", fontSize: "0.82rem" }}>{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <CodeBlock code={ERROR_RESPONSE} lang="json" />

          {/* ── Examples ── */}
          <SectionAnchor id="examples" title="Code examples" />
          <p style={{ color: "#9ca3af", fontSize: "0.875rem", lineHeight: 1.65, marginBottom: "1.25rem" }}>
            Full working examples for the three core workflows: listing series, fetching data, and exporting to Excel.
          </p>

          <DocsTabGroup
            curlAuth={CURL_AUTH}
            curlData={CURL_DATA}
            curlExport={CURL_EXPORT}
            pythonAuth={PYTHON_AUTH}
            pythonData={PYTHON_DATA}
            pythonExport={PYTHON_EXPORT}
            jsAuth={JS_AUTH}
            jsData={JS_DATA}
            jsExport={JS_EXPORT}
          />

          {/* Footer */}
          <div
            style={{
              marginTop: "3rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid #1e1e1e",
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p style={{ color: "#555", fontSize: "0.78rem" }}>
                Something unclear? Email{" "}
                <a href="mailto:support@costsignal.io" style={{ color: "#4ade80", textDecoration: "none" }}>
                  support@costsignal.io
                </a>
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <Link
                href="/dashboard/keys"
                style={{
                  background: "#4ade80",
                  color: "#000",
                  borderRadius: "6px",
                  padding: "0.5rem 1.125rem",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Get API Key →
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
