"use client";
import { useEffect, useMemo, useState } from "react";
import { GLOSSARY } from "@/data/glossary";

export default function GlossaryList() {
  const [q, setQ] = useState("");
  const items = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term)).filter((t) => !needle || `${t.term} ${t.match.join(" ")} ${t.short}`.toLowerCase().includes(needle));
  }, [q]);

  // Scroll to a term linked as /glossary#id once the list is on screen.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView({ block: "center" });
  }, []);

  return (
    <div className="mt-6">
      <label className="block max-w-md text-sm">
        <span className="text-soft">Search the glossary</span>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. entanglement, RSA, noise…"
          className="mt-1 w-full rounded-lg border border-line bg-card2 px-3 py-2 text-ink placeholder:text-muted" />
      </label>
      <p className="mt-2 text-sm text-muted" role="status">{items.length} of {GLOSSARY.length} terms</p>
      {items.length === 0 ? <p className="card mt-4 p-6 text-center text-soft">No term matches “{q}”.</p> : (
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {items.map((t) => (
            <div key={t.id} id={t.id} className="card scroll-mt-28 p-4 target:!border-accent">
              <dt className="font-semibold text-ink">{t.term}</dt>
              <dd className="mt-1 text-sm text-soft">{t.short}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
