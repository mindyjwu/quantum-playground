"use client";
import Link from "next/link";
import { LEVELS, START_PATHS, levelLabel } from "@/lib/prefs";
import PrefsControls from "./PrefsControls";
import { usePrefs } from "./PrefsProvider";

/** First visit: choose a level and style. After that: a short, level-specific path. */
export default function StartHere() {
  const { prefs, ready, setPrefs } = usePrefs();
  if (!ready) return <div className="min-h-24" aria-hidden="true" />; // avoids a flash of the wrong card

  if (!prefs.welcomed) {
    return (
      <section aria-labelledby="start-title" className="card fade-in p-5 sm:p-6">
        <h2 id="start-title" className="text-xl font-semibold">Welcome. Where would you like to start?</h2>
        <p className="mt-1 max-w-2xl text-sm text-soft">Pick the level that fits you and how you like to play. Nothing is locked, and you can change either any time from the ⚙ button at the top.</p>
        <div className="mt-4 max-w-xl"><PrefsControls /></div>
        <button className="btn btn-primary mt-5" onClick={() => setPrefs({ welcomed: true })}>Show me where to start</button>
      </section>
    );
  }

  const level = LEVELS.find((l) => l.id === prefs.level)!;
  return (
    <section aria-labelledby="path-title" className="card fade-in p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="path-title" className="text-lg font-semibold">Your path · <span className="text-accent">{levelLabel(prefs.level)}</span></h2>
        <button className="text-xs text-muted underline underline-offset-2 hover:text-ink" onClick={() => setPrefs({ welcomed: false })}>Change</button>
      </div>
      <p className="mt-1 text-sm text-soft">{level.blurb}</p>
      <ol className="mt-3 grid gap-2 sm:grid-cols-3">
        {START_PATHS[prefs.level].map((p, i) => (
          <li key={p.href + p.label}>
            <Link href={p.href} className="block h-full rounded-xl border border-line p-3 transition-colors hover:border-accent">
              <span className="mono text-xs text-muted">Step {i + 1}</span>
              <span className="block text-sm font-semibold">{p.label}</span>
              <span className="block text-xs text-soft">{p.why}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
