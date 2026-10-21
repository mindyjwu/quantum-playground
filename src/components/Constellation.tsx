"use client";
import Link from "next/link";
import { useMemo } from "react";
import { VIEW, buildConstellation, litStars, summarize } from "@/lib/constellation";
import { EMPTY_PUZZLES, PUZZLES_KEY, normalizePuzzleProgress } from "@/lib/puzzles";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { EMPTY_PROGRESS, PROGRESS_KEY, type ProgressState } from "./Progress";

/** Every lesson, quiz and puzzle you complete lights a star. Saved progress only, stored in this browser. */
export default function Constellation() {
  const [progress, , pReady] = useLocalStorage<ProgressState>(PROGRESS_KEY, EMPTY_PROGRESS);
  const [rawPuzzles, , zReady] = useLocalStorage(PUZZLES_KEY, EMPTY_PUZZLES);
  const groups = useMemo(buildConstellation, []);
  const ready = pReady && zReady;
  const lit = useMemo(() => (ready ? litStars(progress, normalizePuzzleProgress(rawPuzzles)) : new Set<string>()), [ready, progress, rawPuzzles]);
  const sum = summarize(groups, lit);

  return (
    <section aria-labelledby="const-title" className="card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="const-title" className="text-lg font-semibold">Your constellation</h2>
        <span className="text-sm text-soft" role="status">{ready ? `${sum.lit} of ${sum.total} stars lit` : " "}</span>
      </div>
      <p className="mt-1 text-sm text-soft">Finish lessons, quizzes and puzzles to light the stars. Nothing leaves your device.</p>

      <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} role="img" className="mt-3 h-auto w-full"
        aria-label={`Progress constellation: ${sum.lit} of ${sum.total} stars lit. Lessons ${sum.lessons.lit} of ${sum.lessons.total}, quizzes ${sum.quizzes.lit} of ${sum.quizzes.total}, puzzles ${sum.puzzles.lit} of ${sum.puzzles.total}.`}>
        {groups.map((g) => (
          <g key={g.id}>
            {g.nodes.slice(1).map((n, i) => {
              const a = g.nodes[i]; const both = lit.has(a.id) && lit.has(n.id);
              return <line key={n.id} x1={a.x} y1={a.y} x2={n.x} y2={n.y} stroke={both ? "var(--accent)" : "var(--muted)"} strokeOpacity={both ? 0.8 : 0.28} strokeWidth={both ? 1.4 : 0.8} />;
            })}
            {g.nodes.map((n, i) => {
              const on = lit.has(n.id);
              return (
                <g key={n.id}>
                  {on && <circle cx={n.x} cy={n.y} r={9} fill="var(--amber)" opacity={0.18} className="star-glow" style={{ animationDelay: `${(i % 7) * 0.4}s` }} />}
                  <circle cx={n.x} cy={n.y} r={n.kind === "quiz" ? 5.5 : 4} fill={on ? "#fff" : "none"} stroke={on ? "var(--amber)" : "var(--muted)"} strokeWidth={on ? 1.6 : 1.1} strokeOpacity={on ? 1 : 0.7}>
                    <title>{`${n.label}${on ? " (done)" : ""}`}</title>
                  </circle>
                </g>
              );
            })}
            <text x={g.cx} y={g.id === "puzzles" ? VIEW.h - 6 : g.cy + 52} textAnchor="middle" fontSize="12" fill="var(--muted)" letterSpacing="0.06em">{g.label.toUpperCase()}</text>
          </g>
        ))}
      </svg>

      <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
        <li>Lessons {sum.lessons.lit}/{sum.lessons.total}</li><li>Quizzes {sum.quizzes.lit}/{sum.quizzes.total}</li><li>Puzzles {sum.puzzles.lit}/{sum.puzzles.total}</li>
        <li className="ml-auto"><Link className="text-accent underline underline-offset-2" href="/learn">Learn</Link> · <Link className="text-accent underline underline-offset-2" href="/play">Play</Link></li>
      </ul>
    </section>
  );
}
