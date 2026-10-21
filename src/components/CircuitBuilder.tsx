"use client";
import { useEffect, useMemo, useState } from "react";
import { basisLabel, probabilities, runCircuit, sample, type CircuitOp, type SingleGateName } from "@/lib/quantum";
import { noiseFromSlider, simulateNoisy } from "@/lib/density";
import { ketString, pct } from "@/lib/format";

type Cell = null | { t: SingleGateName } | { t: "C"; target: number } | { t: "T"; control: number };
type Tool = SingleGateName | "CNOT";
const COLS = 6;
const CELL = 56;

const emptyGrid = (n: number): Cell[][] => Array.from({ length: COLS }, () => Array<Cell>(n).fill(null));
const GATE_COLOR: Record<SingleGateName, string> = { H: "border-accent text-accent", X: "border-teal text-teal", Z: "border-amber text-amber" };

function clearCell(g: Cell[][], col: number, w: number) {
  const c = g[col][w];
  if (!c) return;
  if (c.t === "C") g[col][c.target] = null;
  if (c.t === "T") g[col][c.control] = null;
  g[col][w] = null;
}

const PRESETS: { name: string; n: number; build: (g: Cell[][]) => void }[] = [
  { name: "Bell state", n: 2, build: (g) => { g[0][0] = { t: "H" }; g[1][0] = { t: "C", target: 1 }; g[1][1] = { t: "T", control: 0 }; } },
  { name: "GHZ (3 qubits)", n: 3, build: (g) => { g[0][0] = { t: "H" }; g[1][0] = { t: "C", target: 1 }; g[1][1] = { t: "T", control: 0 }; g[2][1] = { t: "C", target: 2 }; g[2][2] = { t: "T", control: 1 }; } },
  { name: "H·Z·H = X", n: 2, build: (g) => { g[0][0] = { t: "H" }; g[1][0] = { t: "Z" }; g[2][0] = { t: "H" }; } },
  { name: "H·H = identity", n: 2, build: (g) => { g[0][0] = { t: "H" }; g[1][0] = { t: "H" }; } },
];

/** Number of gates (a CNOT counts as one). */
const countOps = (g: Cell[][]) => g.reduce((total, col) => total + col.filter((c) => c && c.t !== "T").length, 0);

type Props = {
  /** Puzzle mode: fixed qubit count, a gate budget, no presets or live-state panel. */
  puzzle?: { n: number; maxGates: number };
  /** Called with the circuit's operations whenever it changes. */
  onOps?: (ops: CircuitOp[]) => void;
};

export default function CircuitBuilder({ puzzle, onOps }: Props = {}) {
  const compact = !!puzzle;
  const [n, setN] = useState(puzzle?.n ?? 2);
  const [grid, setGrid] = useState<Cell[][]>(() => { const g = emptyGrid(puzzle?.n ?? 2); if (!puzzle) PRESETS[0].build(g); return g; });
  const [tool, setTool] = useState<Tool | null>(null);
  const [msg, setMsg] = useState("");

  const ops = useMemo<CircuitOp[]>(() => {
    const out: CircuitOp[] = [];
    grid.forEach((col) => col.forEach((c, w) => {
      if (!c) return;
      if (c.t === "C") out.push({ kind: "cnot", control: w, target: c.target });
      else if (c.t !== "T") out.push({ kind: "gate", gate: c.t, qubit: w });
    }));
    return out;
  }, [grid]);
  useEffect(() => { onOps?.(ops); }, [ops, onOps]);
  const state = useMemo(() => runCircuit(n, ops), [n, ops]);
  const probs = probabilities(state);

  // Noise slider: the value is the two-qubit gate error; single-qubit gates get a tenth of it.
  const [noise, setNoise] = useState(0);
  const [counts, setCounts] = useState<number[] | null>(null);
  const noisy = useMemo(() => (noise > 0 ? simulateNoisy(n, ops, noiseFromSlider(noise)) : null), [n, ops, noise]);
  const shown = noisy ? noisy.probs : probs;
  useEffect(() => setCounts(null), [n, ops, noise]);
  const runShots = (k: number) => { const c = Array<number>(2 ** n).fill(0); for (let i = 0; i < k; i++) c[sample(shown)]++; setCounts(c); };

  const place = (tl: Tool, w: number, col: number) => {
    const g = grid.map((c) => [...c]);
    clearCell(g, col, w);
    if (tl === "CNOT") {
      let t = -1;
      for (let o = 1; o < n; o++) { const cand = (w + o) % n; if (g[col][cand] === null) { t = cand; break; } }
      if (t < 0) { setMsg("A CNOT needs a free wire in the same column for its target. Try another column."); return; }
      g[col][w] = { t: "C", target: t };
      g[col][t] = { t: "T", control: w };
    } else g[col][w] = { t: tl };
    if (puzzle && countOps(g) > puzzle.maxGates && countOps(g) > countOps(grid)) {
      setMsg(`Gate budget reached (${puzzle.maxGates}). Remove a gate to place another.`);
      return;
    }
    setMsg("");
    setGrid(g);
  };

  const clickCell = (w: number, col: number) => {
    const c = grid[col][w];
    if (tool) return place(tool, w, col);
    if (!c) return;
    const g = grid.map((x) => [...x]);
    if (c.t === "C") {
      // cycle target through free wires, otherwise remove
      const free = Array.from({ length: n }, (_, i) => i).filter((i) => i !== w && (g[col][i] === null || i === c.target));
      const next = free[(free.indexOf(c.target) + 1) % free.length];
      if (next !== c.target) { g[col][c.target] = null; g[col][w] = { t: "C", target: next }; g[col][next] = { t: "T", control: w }; setGrid(g); return; }
    }
    clearCell(g, col, w);
    setGrid(g);
  };

  const changeN = (m: number) => { setN(m); setGrid(emptyGrid(m)); setMsg(""); };
  const loadPreset = (i: number) => { const g = emptyGrid(PRESETS[i].n); PRESETS[i].build(g); setN(PRESETS[i].n); setGrid(g); setMsg(""); };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm text-soft">Gates:</span>
        {(["H", "X", "Z", "CNOT"] as Tool[]).map((g) => (
          <button
            key={g} draggable aria-pressed={tool === g}
            onDragStart={(e) => { e.dataTransfer.setData("text/plain", g); e.dataTransfer.effectAllowed = "copy"; }}
            onClick={() => setTool((t) => (t === g ? null : g))}
            className="btn mono cursor-grab" title="Drag onto a slot, or tap then tap a slot"
          >{g}</button>
        ))}
        {!compact && (
          <>
            <span className="mx-2 hidden h-6 w-px bg-line sm:block" />
            <span className="text-sm text-soft">Qubits:</span>
            {[2, 3].map((m) => <button key={m} className="btn" aria-pressed={n === m} onClick={() => changeN(m)}>{m}</button>)}
          </>
        )}
        <button className="btn" onClick={() => { setGrid(emptyGrid(n)); setMsg(""); }}>Clear</button>
        {puzzle && <span className="mono ml-auto text-sm" data-testid="gate-count" aria-live="polite">Gates: {countOps(grid)} / {puzzle.maxGates}</span>}
      </div>
      <p className="text-xs text-muted">
        Drag a gate onto a slot (or tap a gate, then tap slots). Tap a placed gate to remove it; tap a CNOT's ● to move its ⊕ target. {tool && <span className="text-teal">Selected: {tool}. Tap a slot to place it.</span>}
      </p>
      {msg && <p role="alert" className="text-sm text-rose">{msg}</p>}

      <div className="card overflow-x-auto p-4">
        <div className="relative" style={{ width: 56 + COLS * CELL, height: n * CELL }}>
          {Array.from({ length: n }, (_, w) => (
            <div key={w} className="absolute flex items-center" style={{ top: w * CELL, height: CELL, left: 0, width: "100%" }}>
              <span className="mono w-14 shrink-0 text-sm text-soft">q{w} |0⟩</span>
              <div className="h-px flex-1 bg-soft/60" />
            </div>
          ))}
          {grid.flatMap((col, ci) => col.map((c, w) => c && c.t === "C" ? (
            <div key={`v${ci}-${w}`} className="absolute w-0.5 bg-violet" style={{ left: 56 + ci * CELL + CELL / 2 - 1, top: Math.min(w, c.target) * CELL + CELL / 2, height: Math.abs(c.target - w) * CELL }} />
          ) : null))}
          {grid.map((col, ci) => col.map((c, w) => (
            <button
              key={`${ci}-${w}`}
              aria-label={`Wire q${w}, column ${ci + 1}: ${c ? (c.t === "C" ? "CNOT control" : c.t === "T" ? "CNOT target" : c.t + " gate") : "empty"}`}
              onClick={() => clickCell(w, ci)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const t = e.dataTransfer.getData("text/plain") as Tool; if (["H", "X", "Z", "CNOT"].includes(t)) place(t, w, ci); }}
              className={`absolute flex items-center justify-center rounded-lg transition-colors ${c ? "" : "border border-dashed border-line hover:border-accent"}`}
              style={{ left: 56 + ci * CELL + 6, top: w * CELL + 6, width: CELL - 12, height: CELL - 12, background: c && c.t !== "C" && c.t !== "T" ? "var(--card-2)" : undefined }}
            >
              {c && c.t !== "C" && c.t !== "T" && <span className={`mono flex h-full w-full items-center justify-center rounded-lg border-2 text-lg font-semibold ${GATE_COLOR[c.t]}`}>{c.t}</span>}
              {c && c.t === "C" && <span className="h-4 w-4 rounded-full bg-violet" />}
              {c && c.t === "T" && <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-violet bg-card text-xl leading-none text-violet">⊕</span>}
            </button>
          )))}
        </div>
      </div>

      {!compact && <div className="flex flex-wrap gap-2">
        <span className="text-sm text-soft">Examples:</span>
        {PRESETS.map((p, i) => <button key={p.name} className="btn !min-h-8 !py-1 text-xs" onClick={() => loadPreset(i)}>{p.name}</button>)}
      </div>}

      {!compact && <div className="card p-4">
        <h3 className="font-semibold">Live state</h3>
        <p className="mono mt-2 text-sm break-words">ideal |ψ⟩ = {ketString(state, n)}</p>

        <div className="mt-4 rounded-xl border border-line bg-card2 p-3">
          <label className="block text-sm" htmlFor="noise-slider">
            <span className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-semibold text-ink">Gate noise</span>
              <span className="mono text-soft">two-qubit gate error {(noise * 100).toFixed(1)}%</span>
            </span>
          </label>
          <input id="noise-slider" type="range" min={0} max={0.1} step={0.001} value={noise} onChange={(e) => setNoise(Number(e.target.value))} className="mt-1 w-full accent-[var(--accent)]" aria-describedby="noise-note" />
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted">Try:</span>
            {[[0, "Perfect"], [0.001, "0.1%"], [0.01, "1%"], [0.05, "5%"]].map(([v, label]) => (
              <button key={label} className="btn !min-h-8 !px-2.5 !py-1 text-xs" aria-pressed={noise === v} onClick={() => setNoise(v as number)}>{label}</button>
            ))}
          </div>
          <p id="noise-note" className="mt-2 text-xs text-muted">
            Depolarizing noise after every gate: each two-qubit gate (CNOT) fails with the slider's probability, single-qubit gates with one tenth of it.
            Good hardware today is roughly in the 0.1% to 1% range for two-qubit gates (it varies by device). Real devices also have readout errors and drift, which this simple model leaves out.
          </p>
        </div>

        <div className="mt-3 space-y-1.5" aria-label={noisy ? "Noisy basis state probabilities; ticks mark the ideal values" : "Basis state probabilities"}>
          {shown.map((p, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className="mono w-14 text-soft">|{basisLabel(i, n)}⟩</span>
              <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-card2">
                <div className="bar h-full rounded-full bg-accent" style={{ width: `${p * 100}%` }} />
                {noisy && <div className="absolute inset-y-0 w-0.5 bg-amber" style={{ left: `${Math.min(probs[i], 0.995) * 100}%` }} title={`ideal ${pct(probs[i])}`} />}
              </div>
              <span className="mono w-14 text-right">{pct(p)}</span>
            </div>
          ))}
        </div>
        {noisy ? (
          <p className="mt-3 text-sm text-soft" role="status" data-testid="fidelity">
            Fidelity with the ideal state: <span className="mono font-semibold text-ink">{(noisy.fidelity * 100).toFixed(1)}%</span>
            <span className="text-muted"> · the amber ticks mark the ideal probabilities</span>
          </p>
        ) : (
          <p className="mt-3 text-sm text-muted" role="status">Perfect, noise-free qubits. Slide the noise up to see errors leak into outcomes that should never happen.</p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button className="btn" onClick={() => runShots(1000)}>Run 1000 shots</button>
          {counts && <button className="text-sm text-muted underline underline-offset-2 hover:text-ink" onClick={() => setCounts(null)}>Clear</button>}
        </div>
        {counts && (
          <ul className="mono mt-2 grid gap-x-6 text-sm sm:grid-cols-2" aria-label="Counts from 1000 shots">
            {counts.map((k, i) => <li key={i} className={k === 0 ? "text-muted" : ""}>|{basisLabel(i, n)}⟩: {k} ({(k / 10).toFixed(1)}%)</li>)}
          </ul>
        )}
        <p className="mt-3 text-xs text-muted">Gates run left to right starting from |0…0⟩. Basis labels read q0 first. Real hardware returns sampled counts like the shots above, not exact probabilities.</p>
      </div>}
    </div>
  );
}
