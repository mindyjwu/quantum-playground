"use client";
import { useState } from "react";

export default function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable (e.g. insecure context): user can still select the text */ }
  };
  return (
    <div>
      <div className="mb-1 flex justify-end">
        <button onClick={copy} className="btn !min-h-8 !px-2.5 !py-1 text-xs" aria-label={`Copy ${label ?? "code"}`}>
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <pre className="mono overflow-x-auto rounded-xl border border-line bg-card2 p-3 text-[0.8rem] leading-relaxed text-ink" tabIndex={0}><code>{code}</code></pre>
    </div>
  );
}
