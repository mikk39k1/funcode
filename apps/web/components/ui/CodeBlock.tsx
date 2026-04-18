"use client";

import { useState } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
  /** Colour for the code text — defaults to tertiary (lavender) */
  color?: "tertiary" | "secondary" | "primary" | "on-surface";
  className?: string;
}

const colorClasses: Record<NonNullable<CodeBlockProps["color"]>, string> = {
  tertiary: "text-tertiary",
  secondary: "text-secondary",
  primary: "text-primary",
  "on-surface": "text-on-surface",
};

export function CodeBlock({
  code,
  color = "tertiary",
  className = "",
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`
        group/code bg-surface-container-lowest rounded-md p-4
        flex justify-between items-center gap-4
        ${className}
      `}
    >
      <code
        className={`font-mono text-sm leading-relaxed ${colorClasses[color]}`}
      >
        {code}
      </code>
      <button
        onClick={handleCopy}
        aria-label="Copy to clipboard"
        className="
          text-on-surface-variant hover:text-primary
          transition-colors opacity-0 group-hover/code:opacity-100
          shrink-0 p-1 rounded-sm
        "
      >
        {copied ? (
          <span className="text-secondary text-xs font-mono">✓</span>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
        )}
      </button>
    </div>
  );
}
