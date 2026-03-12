"use client";

import { useState } from "react";

export default function CopyButton({
  value,
  label = "Copy",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={handleCopy}
        className="px-3 py-2 text-xs font-medium rounded-lg bg-bg border border-border text-gray-400 hover:text-white hover:border-gray-600 transition-all whitespace-nowrap"
        style={{
          borderColor: copied ? "#4ade80" : undefined,
          color: copied ? "#4ade80" : undefined,
        }}
      >
        {copied ? "✓ Copied" : label}
      </button>
      {copied && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#4ade80",
            color: "#000",
            fontSize: "0.7rem",
            fontWeight: 700,
            padding: "0.2rem 0.55rem",
            borderRadius: "6px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 50,
            boxShadow: "0 2px 8px rgba(74,222,128,0.3)",
          }}
        >
          Copied!
          {/* Arrow */}
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: "5px solid #4ade80",
            }}
          />
        </div>
      )}
    </div>
  );
}
