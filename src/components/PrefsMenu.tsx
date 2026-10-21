"use client";
import { useEffect, useRef, useState } from "react";
import { levelLabel } from "@/lib/prefs";
import PrefsControls from "./PrefsControls";
import { usePrefs } from "./PrefsProvider";

/** Header button + popover for choosing level and play style (desktop). */
export default function PrefsMenu() {
  const { prefs, ready } = usePrefs();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div ref={box} className="relative">
      <button className="btn !min-h-9 !px-3" aria-expanded={open} aria-controls="prefs-panel" aria-haspopup="dialog" onClick={() => setOpen((o) => !o)}>
        <span aria-hidden="true">⚙</span> {ready ? levelLabel(prefs.level) : "Level"}
      </button>
      {open && (
        <div id="prefs-panel" role="dialog" aria-label="Preferences" className="fade-in absolute right-0 z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-line bg-bg p-4 shadow-2xl">
          <PrefsControls />
          <p className="mt-3 text-xs text-muted">Saved in this browser only. You can change these any time.</p>
        </div>
      )}
    </div>
  );
}
