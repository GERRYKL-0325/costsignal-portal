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
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="px-3 py-2 text-xs font-medium rounded-lg bg-bg border border-border text-gray-400 hover:text-white hover:border-gray-600 transition-all whitespace-nowrap"
    >
      {copied ? "✓ Copied" : label}
    </button>
  );
}
