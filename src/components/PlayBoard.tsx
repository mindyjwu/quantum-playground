"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import CircuitBuilder from "./CircuitBuilder";
import { usePrefs } from "./PrefsProvider";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { ketString, pct } from "@/lib/format";
import { LEVELS, type Level, type PlayStyle } from "@/lib/prefs";
import { basisLabel, probabilities, runCircuit, type CircuitOp } from "@/lib/quantum";
import { EMPTY_PUZZLES, PUZZLES, PUZZLES_KEY, budgetFor, closeness, describeTarget, evaluate, normalizePuzzleProgress, recordSolve, starsFor, targetState, type Puzzle } from "@/lib/puzzles";

export function Stars({ n, of = 3 }: { n: number; of?: number }) {
  return (
    <span aria-label={`${n} of ${of} stars`} className="whitespace-nowrap">
      {Array.from({ length: of }, (_, i) => <span key={i} aria-hidden="true" className={i < n ? "text-amber" : "text-muted/50"}>{i < n ? "✦" : "✧"}</span>)}
    </span>
  );
}

function PuzzleBoard({ puzzle, style, best, onSolved, onNext }: { puzzle: Puzzle; style: PlayStyle; best?: { gates: number; stars: number }; onSolved: (gates: number) => void; onNext?: () => void }) {
  const [ops, setOps] = useState<CircuitOp[]>([]);
  const [resetKey, setResetKey] = useState(0);
  const [hints, setHints] = useState(0);
  const cozy = style === "cozy";

  const ev = useMemo(() => evaluate(puzzle, ops), [puzzle, ops]);
  const psi = useMemo(() => runCircuit(puzzle.n, ops), [puzzle, ops]);
  const probs = probabilities(psi);
  const tProbs = probabilities(targetState(puzzle));
  const gates = ops.length;
  const solved = ev.solved && gates > 0;
  const budget = budgetFor(puzzle);

  const cb = useRef(onSolved); cb.current = onSolved;
  useEffect(() => { if (solved) cb.current(gates); }, [solved, gates]);

  const stars = solved ? starsFor(puzzle, gates) : 0;
  const reset = () => { setOps([]); setResetKey((k) => k + 1); };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div>
        <CircuitBuilder key={resetKey} puzzle={{ n: puzzle.n, maxGates: budget }} onOps={setOps} />
        <button className="mt-3 text-sm text-muted underline underline-offset-2 hover:text-ink" onClick={reset}>Start over</button>
      </div>

      <aside className="space-y-4" aria-label="Puzzle target and status">
        <div className="card p-4">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold">{puzzle.title}</h2>
            {best && <span className="text-xs text-muted">Best: {best.gates} gate{best.gates === 1 ? "" : "s"} <Stars n={best.stars} /></span>}
          </div>
          {cozy && <p className="mt-1 text-sm text-soft">{puzzle.story}</p>}
          <p className={`${cozy ? "mt-2" : "mt-1"} text-sm`}><span className="font-semibold">Goal: </span><span className="text-soft">{puzzle.goal}</span></p>
          <p className="mono mt-2 text-xs break-words text-soft">{puzzle.target.mode === "state" ? `target = ${ketString(targetState(puzzle), puzzle.n)}` : `target odds: ${describeTarget(puzzle)}`}</p>
          <p className="mt-2 text-xs text-muted">Par {puzzle.par} · budget {budget} gates{puzzle.target.mode === "state" ? " · signs and phases matter" : " · only the measurement odds matter"}</p>
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-semibold">Your circuit vs the target</h3>
          <div className="mt-2 space-y-1.5" role="group" aria-label="Probabilities: bars are yours, ticks are the target">
            {probs.map((q, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="mono w-12 text-soft">|{basisLabel(i, puzzle.n)}⟩</span>
                <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-card2">
                  <div className="bar h-full rounded-full bg-accent" style={{ width: `${q * 100}%` }} />
                  <div className="absolute inset-y-0 w-0.5 bg-amber" style={{ left: `calc(${Math.min(tProbs[i], 0.995) * 100}% )` }} title={`target ${pct(tProbs[i])}`} />
                </div>
                <span className="mono w-12 text-right">{pct(q)}</span>
              </div>
            ))}
          </div>
          {cozy
            ? <p className="mt-3 text-sm text-soft" role="status">How close: <span className="font-semibold text-ink">{Math.round(closeness(puzzle, ev) * 100)}%</span>{!ev.solved && closeness(puzzle, ev) > 0.5 && gates > 0 ? " · getting warmer" : ""}</p>
            : <p className="mono mt-3 text-xs break-words text-soft" role="status">{puzzle.target.mode === "state" ? "F" : "closeness"} = {closeness(puzzle, ev).toFixed(4)} · |ψ⟩ = {ketString(psi, puzzle.n)}</p>}
        </div>

        {solved ? (
          cozy ? (
            <div className="card fade-in relative overflow-hidden border-teal/60 p-4 text-center" role="status">
              <div className="burst" aria-hidden="true">{Array.from({ length: 10 }, (_, i) => <span key={i} style={{ ["--a" as string]: `${i * 36}deg` }} />)}</div>
              <p className="text-2xl"><Stars n={stars} /></p>
              <p className="mt-1 font-semibold text-teal">Solved in {gates} gate{gates > 1 ? "s" : ""}!</p>
              <p className="text-sm text-soft">{stars === 3 ? "That's par or better. Beautiful." : `Par is ${puzzle.par}. Can you do it in ${puzzle.par}?`}</p>
              {onNext && <button className="btn btn-primary mt-3" onClick={onNext}>Next puzzle →</button>}
            </div>
          ) : (
            <div className="card border-teal/60 p-4" role="status">
              <p className="mono text-sm"><span className="text-teal">✓</span> Solved: {gates} gates (par {puzzle.par}) · <Stars n={stars} /></p>
              {onNext && <button className="btn mt-3" onClick={onNext}>Next →</button>}
            </div>
          )
        ) : null}

        <div>
          {hints > 0 && puzzle.hints.slice(0, hints).map((h, i) => (
            <p key={i} className="fade-in mb-2 rounded-lg border border-amber/40 bg-amber/10 p-2 text-sm text-soft"><span className="font-semibold text-amber">Hint {i + 1}: </span>{h}</p>
          ))}
          {hints < 2 && (cozy
            ? <button className="btn" onClick={() => setHints((h) => h + 1)}>{hints === 0 ? "Give me a hint" : "Another hint"}</button>
            : <button className="text-xs text-muted underline underline-offset-2 hover:text-ink" onClick={() => setHints((h) => h + 1)}>{hints === 0 ? "Show hint" : "Show second hint"}</button>)}
          <p className="mt-1 text-xs text-muted">Hints never cost stars.</p>
        </div>
      </aside>
    </div>
  );
}

export default function PlayBoard() {
  const { prefs, ready } = usePrefs();
  const [raw, setRaw, storeReady] = useLocalStorage(PUZZLES_KEY, EMPTY_PUZZLES);
  const progress = useMemo(() => normalizePuzzleProgress(raw), [raw]);
  const [filter, setFilter] = useState<Level | "all" | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const effective: Level | "all" = filter ?? (ready ? prefs.level : "all");
  const visible = PUZZLES.filter((p) => effective === "all" || p.level === effective);

  // Pick a starting puzzle (the first unsolved) ONCE per list, then keep it. Otherwise solving a puzzle
  // would instantly switch the board to the next unsolved one and the "Solved!" message would vanish.
  useEffect(() => {
    if (activeId === null && ready && storeReady) setActiveId((visible.find((p) => !progress.solved[p.id]) ?? visible[0]).id);
  }, [activeId, ready, storeReady, visible, progress]);

  const active = visible.find((p) => p.id === activeId) ?? visible.find((p) => !progress.solved[p.id]) ?? visible[0];
  const next = visible[visible.findIndex((p) => p.id === active.id) + 1];
  const total = Object.values(progress.solved).reduce((n, e) => n + e.stars, 0);
  const solvedCount = Object.keys(progress.solved).length;

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Puzzle level">
        {([["all", "All"], ...LEVELS.map((l) => [l.id, l.label])] as [Level | "all", string][]).map(([id, label]) => {
          const list = PUZZLES.filter((p) => id === "all" || p.level === id);
          const done = list.filter((p) => progress.solved[p.id]).length;
          return <button key={id} className="btn" aria-pressed={effective === id} onClick={() => { setFilter(id); setActiveId(null); }}>{label} <span className="text-xs text-muted">{done}/{list.length}</span></button>;
        })}
        <span className="ml-auto text-sm text-soft" role="status">{solvedCount}/{PUZZLES.length} solved · <span aria-hidden="true" className="text-amber">✦</span> <span>{total}/{PUZZLES.length * 3} stars</span></span>
      </div>

      <ol className="mt-4 flex flex-wrap gap-2" aria-label="Puzzles">
        {visible.map((p) => (
          <li key={p.id}>
            <button className="card px-3 py-2 text-left text-sm transition-colors hover:border-soft" style={p.id === active.id ? { borderColor: "var(--accent)" } : undefined} aria-current={p.id === active.id ? "true" : undefined} onClick={() => setActiveId(p.id)}>
              <span className="block font-semibold">{p.title}</span>
              <span className="text-xs text-muted">{progress.solved[p.id] ? <Stars n={progress.solved[p.id].stars} /> : `${p.n} qubit${p.n > 1 ? "s" : ""} · par ${p.par}`}</span>
            </button>
          </li>
        ))}
      </ol>

      <PuzzleBoard
        key={active.id} puzzle={active} style={ready ? prefs.style : "cozy"} best={progress.solved[active.id]}
        onSolved={(gates) => setRaw((prev) => recordSolve(normalizePuzzleProgress(prev), active, gates))}
        onNext={next ? () => setActiveId(next.id) : undefined}
      />

      <p className="mt-8 text-xs text-muted">Progress is saved in this browser. Switch Cozy and Instrument style, or your level, from the ⚙ button at the top.</p>
    </div>
  );
}
