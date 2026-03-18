"use client";

import { useState } from "react";

type Tab = "curl" | "python" | "js";

interface DocsTabGroupProps {
  curlAuth: string;
  curlData: string;
  curlExport: string;
  pythonAuth: string;
  pythonData: string;
  pythonExport: string;
  jsAuth: string;
  jsData: string;
  jsExport: string;
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // fallback — ignore
    }
  }

  return (
    <div style={{ position: "relative" }}>
      <pre
        style={{
          background: "#0a0a0a",
          border: "1px solid #2a2a2a",
          borderRadius: "0 0 8px 8px",
          padding: "1.25rem 1.5rem",
          overflowX: "auto",
          fontSize: "0.78rem",
          lineHeight: 1.7,
          color: "#d4d4d4",
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace",
          whiteSpace: "pre",
          margin: 0,
          minHeight: "160px",
        }}
      >
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        style={{
          position: "absolute",
          top: "0.75rem",
          right: "0.75rem",
          background: copied ? "#14532d" : "#1e1e1e",
          border: "1px solid #333",
          borderRadius: "5px",
          color: copied ? "#4ade80" : "#666",
          fontSize: "0.7rem",
          fontWeight: 600,
          padding: "3px 10px",
          cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        {copied ? "✓ copied" : "copy"}
      </button>
    </div>
  );
}

const SECTIONS = [
  { key: "auth", label: "1. Authenticate" },
  { key: "data", label: "2. Fetch data" },
  { key: "export", label: "3. Export Excel" },
] as const;
type Section = typeof SECTIONS[number]["key"];

const TABS: { key: Tab; label: string }[] = [
  { key: "curl", label: "cURL" },
  { key: "python", label: "Python" },
  { key: "js", label: "JavaScript" },
];

export default function DocsTabGroup(props: DocsTabGroupProps) {
  const [tab, setTab] = useState<Tab>("curl");
  const [section, setSection] = useState<Section>("auth");

  const codeMap: Record<Tab, Record<Section, string>> = {
    curl: { auth: props.curlAuth, data: props.curlData, export: props.curlExport },
    python: { auth: props.pythonAuth, data: props.pythonData, export: props.pythonExport },
    js: { auth: props.jsAuth, data: props.jsData, export: props.jsExport },
  };

  return (
    <div style={{ marginBottom: "2rem" }}>
      {/* Language tab strip */}
      <div
        style={{
          display: "flex",
          gap: "0",
          marginBottom: "0",
          borderBottom: "1px solid #2a2a2a",
        }}
      >
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              background: tab === key ? "#111" : "transparent",
              border: "none",
              borderBottom: tab === key ? "2px solid #4ade80" : "2px solid transparent",
              color: tab === key ? "#fff" : "#555",
              fontSize: "0.82rem",
              fontWeight: tab === key ? 600 : 400,
              padding: "0.6rem 1.125rem",
              cursor: "pointer",
              transition: "all 0.15s",
              marginBottom: "-1px",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Section sub-nav */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          padding: "0.75rem 1rem",
          background: "#111",
          borderLeft: "1px solid #2a2a2a",
          borderRight: "1px solid #2a2a2a",
          overflowX: "auto",
        }}
      >
        {SECTIONS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSection(key)}
            style={{
              background: section === key ? "#1e1e1e" : "transparent",
              border: `1px solid ${section === key ? "#333" : "transparent"}`,
              borderRadius: "5px",
              color: section === key ? "#e8e8e8" : "#555",
              fontSize: "0.75rem",
              fontWeight: section === key ? 600 : 400,
              padding: "0.3rem 0.75rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Code */}
      <CodeBlock code={codeMap[tab][section]} />
    </div>
  );
}
