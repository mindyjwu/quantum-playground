"use client";
import Link from "next/link";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { termById } from "@/data/glossary";
import type { Segment } from "@/lib/glossary";

/**
 * A jargon word that explains itself. Works by tap/click, keyboard (Enter/Space) and mouse hover; closes on Escape,
 * on tapping elsewhere, or with the close button. The definition appears in a polite live region so screen readers announce it.
 */
export function GlossaryTerm({ id, children }: { id: string; children: React.ReactNode }) {
  const term = termById(id);
  const uid = useId();
  const box = useRef<HTMLSpanElement>(null);
  const pop = useRef<HTMLSpanElement>(null);
  const [pinned, setPinned] = useState(false);
  const [hover, setHover] = useState(false);
  const [pos, setPos] = useState({ dx: 0, above: false });
  const open = pinned || hover;

  useEffect(() => {
    if (!pinned) return;
    const away = (e: Event) => { if (box.current && !box.current.contains(e.target as Node)) setPinned(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { setPinned(false); setHover(false); } };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("pointerdown", away); document.removeEventListener("keydown", key); };
  }, [pinned]);

  // Keep the popover inside the screen: nudge sideways, and flip above the word if there's no room below.
  useLayoutEffect(() => {
    if (!open || !pop.current || !box.current) return;
    const m = 8;
    const r = pop.current.getBoundingClientRect();
    const b = box.current.getBoundingClientRect();
    let dx = 0;
    if (r.right > window.innerWidth - m) dx = window.innerWidth - m - r.right;
    if (r.left + dx < m) dx = m - r.left;
    const above = r.bottom > window.innerHeight - m && b.top - r.height - 8 > m;
    setPos((p) => (p.dx === dx && p.above === above ? p : { dx, above }));
  }, [open]);

  if (!term) return <>{children}</>;
  return (
    <span ref={box} className="relative inline">
      <button
        type="button" className="term" data-term={id} aria-expanded={open} aria-controls={open ? uid : undefined}
        onClick={() => setPinned((p) => !p)}
        onPointerEnter={(e) => { if (e.pointerType === "mouse") setHover(true); }}
        onPointerLeave={(e) => { if (e.pointerType === "mouse") setHover(false); }}
      >{children}</button>
      <span role="status" className="contents">
        {open && (
          <span
            ref={pop} id={uid} data-glossary-popover
            className="fade-in absolute z-30 block w-72 max-w-[calc(100vw-1rem)] rounded-xl border border-line bg-bg p-3 text-left text-sm leading-snug font-normal text-soft shadow-2xl"
            // `left`, not `transform`: the fade-in animation owns `transform` and would silently undo the nudge
            style={{ left: pos.dx, ...(pos.above ? { bottom: "calc(100% + 6px)" } : { top: "calc(100% + 6px)" }) }}
          >
            <span className="block font-semibold text-ink">{term.term}</span>
            <span className="mt-1 block">{term.short}</span>
            <span className="mt-2 flex items-center justify-between gap-3 text-xs">
              <Link className="text-accent underline underline-offset-2" href={`/glossary#${term.id}`}>All terms</Link>
              {pinned && <button type="button" className="text-muted underline underline-offset-2 hover:text-ink" onClick={() => { setPinned(false); setHover(false); }}>Close</button>}
            </span>
          </span>
        )}
      </span>
    </span>
  );
}

/** Renders annotated segments: plain text stays text, terms become tap-to-define. */
export function Segments({ segments }: { segments: Segment[] }) {
  return <>{segments.map((s, i) => (s.type === "term" ? <GlossaryTerm key={i} id={s.id}>{s.text}</GlossaryTerm> : <span key={i}>{s.text}</span>))}</>;
}
