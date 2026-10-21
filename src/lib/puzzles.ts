import { applyCNOT, applySingle, GATES, probabilities, runCircuit, zeroState, type CircuitOp, type SingleGateName, type StateVector } from "./quantum";
import type { Level } from "./prefs";

export type Target =
  | { mode: "probs"; probs: number[] }                      // only the measurement distribution matters
  | { mode: "state"; amps: [number, number][] };            // the full state matters (signs / phases), up to a global phase

export type Puzzle = {
  id: string; level: Level; title: string;
  story: string;             // friendly framing (Cozy style)
  goal: string;              // terse statement of the goal (Instrument style)
  n: number; target: Target; par: number;
  hints: [string, string];
};

const S = Math.SQRT1_2;
const amp = (n: number, entries: Record<string, number>): [number, number][] => {
  const v: [number, number][] = Array.from({ length: 2 ** n }, () => [0, 0]);
  for (const [bits, a] of Object.entries(entries)) v[parseInt(bits, 2)] = [a, 0];
  return v;
};

export const PUZZLES: Puzzle[] = [
  { id: "b1", level: "beginner", title: "Flip the switch", story: "A beacon qubit is stuck dark in |0⟩. Switch it on so it reads 1 every time.", goal: "Reach |1⟩.", n: 1, par: 1, target: { mode: "probs", probs: [0, 1] }, hints: ["One gate flips 0 to 1.", "Try X."] },
  { id: "b2", level: "beginner", title: "Fair coin", story: "Turn a sure 0 into a perfectly fair coin: 50% zero, 50% one.", goal: "Reach 50% / 50%.", n: 1, par: 1, target: { mode: "probs", probs: [0.5, 0.5] }, hints: ["You need a gate that splits 0 into an even mix.", "Try H."] },
  { id: "b3", level: "beginner", title: "Half and half", story: "Keep the top qubit at 0, but make the bottom one a fair coin.", goal: "q0 stays 0, q1 is 50/50 (outcomes 00 and 01).", n: 2, par: 1, target: { mode: "probs", probs: [0.5, 0.5, 0, 0] }, hints: ["Only the second qubit needs to change.", "H on q1."] },
  { id: "b4", level: "beginner", title: "Spooky twins", story: "Make two qubits that always agree: both 0 or both 1, never different.", goal: "Reach outcomes 00 and 11 at 50% each.", n: 2, par: 2, target: { mode: "probs", probs: [0.5, 0, 0, 0.5] }, hints: ["Start by putting one qubit in an even mix.", "H on q0, then CNOT from q0 to q1."] },
  { id: "i1", level: "intermediate", title: "Find the minus", story: "The state |−⟩ looks just like |+⟩ if you measure it, but its sign differs. Match the sign.", goal: "Reach (|0⟩ − |1⟩)/√2.", n: 1, par: 2, target: { mode: "state", amps: [[S, 0], [-S, 0]] }, hints: ["Probabilities alone won't do it: you need a phase flip too.", "H then Z (or X then H)."] },
  { id: "i2", level: "intermediate", title: "Odd one out", story: "Make a pair that always disagrees, in an even blend of 01 and 10.", goal: "Reach (|01⟩ + |10⟩)/√2.", n: 2, par: 3, target: { mode: "state", amps: amp(2, { "01": S, "10": S }) }, hints: ["Start from the Bell recipe, then change which outcomes appear.", "H on q0, CNOT q0→q1, then X on q1."] },
  { id: "i3", level: "intermediate", title: "The singlet", story: "The famous antisymmetric pair: 01 and 10 with opposite signs.", goal: "Reach (|01⟩ − |10⟩)/√2.", n: 2, par: 4, target: { mode: "state", amps: amp(2, { "01": S, "10": -S }) }, hints: ["Build the previous puzzle's state, then fix a sign.", "Z on q0 flips the sign of the 10 branch."] },
  { id: "e1", level: "expert", title: "Three-way tie", story: "Entangle three qubits so all of them agree.", goal: "Reach the GHZ state (|000⟩ + |111⟩)/√2.", n: 3, par: 3, target: { mode: "state", amps: amp(3, { "000": S, "111": S }) }, hints: ["Chain the entanglement from one qubit to the next.", "H on q0, then two CNOTs spreading it."] },
  { id: "e2", level: "expert", title: "Minus Bell", story: "A Bell pair with a minus sign.", goal: "Reach (|00⟩ − |11⟩)/√2.", n: 2, par: 3, target: { mode: "state", amps: amp(2, { "00": S, "11": -S }) }, hints: ["Make a Bell pair, then fix the sign.", "Z on either qubit does it."] },
  { id: "e3", level: "expert", title: "Odd GHZ", story: "A GHZ-like state where the last qubit disagrees with the first two.", goal: "Reach (|001⟩ + |110⟩)/√2.", n: 3, par: 4, target: { mode: "state", amps: amp(3, { "001": S, "110": S }) }, hints: ["Set the last qubit's starting value first.", "X on q2, H on q0, then CNOT q0→q1 and q0→q2."] },
  { id: "e4", level: "expert", title: "Minus GHZ", story: "GHZ with a relative minus sign.", goal: "Reach (|000⟩ − |111⟩)/√2.", n: 3, par: 4, target: { mode: "state", amps: amp(3, { "000": S, "111": -S }) }, hints: ["Build GHZ, then add one gate.", "Z on any one qubit."] },
  { id: "e5", level: "expert", title: "Even parity", story: "An equal blend of every three-bit string with an even number of ones.", goal: "Reach (|000⟩ + |011⟩ + |101⟩ + |110⟩)/2.", n: 3, par: 4, target: { mode: "state", amps: amp(3, { "000": 0.5, "011": 0.5, "101": 0.5, "110": 0.5 }) }, hints: ["Put two qubits in superposition, and let the third compute their parity.", "H on q0 and q1, then CNOT q0→q2 and q1→q2."] },
];

/** The target as a state vector (for display and checking). Probability-only targets use real, non-negative amplitudes. */
export function targetState(p: Puzzle): StateVector {
  if (p.target.mode === "state") return p.target.amps.map(([re, im]) => ({ re, im }));
  return p.target.probs.map((q) => ({ re: Math.sqrt(q), im: 0 }));
}

/** The most gates a player may use: generous for beginners, exactly par for experts. */
export const budgetFor = (p: Puzzle) => p.par + (p.level === "beginner" ? 3 : p.level === "intermediate" ? 1 : 0);

export type Evaluation = { solved: boolean; fidelity: number; probDistance: number };

export function evaluate(p: Puzzle, ops: CircuitOp[]): Evaluation {
  const psi = runCircuit(p.n, ops);
  const probs = probabilities(psi);
  const tgt = targetState(p);
  // fidelity |<target|psi>|^2, insensitive to a global phase
  let re = 0, im = 0;
  for (let i = 0; i < psi.length; i++) { re += tgt[i].re * psi[i].re + tgt[i].im * psi[i].im; im += tgt[i].re * psi[i].im - tgt[i].im * psi[i].re; }
  const fidelity = re * re + im * im;
  const tProbs = probabilities(tgt);
  const probDistance = probs.reduce((s, q, i) => s + Math.abs(q - tProbs[i]), 0);
  const solved = p.target.mode === "state" ? fidelity > 1 - 1e-9 : probDistance < 1e-9;
  return { solved, fidelity, probDistance };
}

/** 0..1 "how close am I", on the same terms the puzzle is judged by (probabilities, or the full state including phase). */
export const closeness = (p: Puzzle, ev: Evaluation): number => (p.target.mode === "state" ? ev.fidelity : Math.max(0, 1 - ev.probDistance / 2));

/** How to describe the target: a ket for state puzzles; just the odds for probability puzzles (any phase is accepted). */
export function describeTarget(p: Puzzle): string {
  if (p.target.mode === "state") return "";
  const bits = (i: number) => i.toString(2).padStart(p.n, "0");
  return p.target.probs.map((q, i) => (q > 1e-9 ? `${Math.round(q * 1000) / 10}% |${bits(i)}⟩` : "")).filter(Boolean).join("  ·  ");
}

/** 3 stars at par or better, 2 stars at par + 1, otherwise 1. */
export const starsFor = (p: Puzzle, gates: number): 1 | 2 | 3 => (gates <= p.par ? 3 : gates <= p.par + 1 ? 2 : 1);

/** Every elementary operation available on n qubits. */
export function allOps(n: number): CircuitOp[] {
  const ops: CircuitOp[] = [];
  for (let q = 0; q < n; q++) for (const gate of ["H", "X", "Z"] as SingleGateName[]) ops.push({ kind: "gate", gate, qubit: q });
  for (let c = 0; c < n; c++) for (let t = 0; t < n; t++) if (c !== t) ops.push({ kind: "cnot", control: c, target: t });
  return ops;
}

/** Brute-force shortest solution (iterative deepening). Used to prove each puzzle is solvable and its par is minimal. */
export function solve(p: Puzzle, maxDepth: number): CircuitOp[] | null {
  const ops = allOps(p.n);
  const step = (s: StateVector, op: CircuitOp) => (op.kind === "gate" ? applySingle(s, p.n, op.qubit, GATES[op.gate]) : applyCNOT(s, p.n, op.control, op.target));
  const fidelityOk = (s: StateVector): boolean => {
    const tgt = targetState(p);
    if (p.target.mode === "state") {
      let re = 0, im = 0;
      for (let i = 0; i < s.length; i++) { re += tgt[i].re * s[i].re + tgt[i].im * s[i].im; im += tgt[i].re * s[i].im - tgt[i].im * s[i].re; }
      return re * re + im * im > 1 - 1e-9;
    }
    const a = probabilities(s), b = probabilities(tgt);
    return a.reduce((d, q, i) => d + Math.abs(q - b[i]), 0) < 1e-9;
  };
  for (let depth = 1; depth <= maxDepth; depth++) {
    const path: CircuitOp[] = [];
    const dfs = (s: StateVector, left: number): boolean => {
      if (left === 0) return fidelityOk(s);
      for (const op of ops) { path.push(op); if (dfs(step(s, op), left - 1)) return true; path.pop(); }
      return false;
    };
    if (dfs(zeroState(p.n), depth)) return path.slice();
  }
  return null;
}

export type PuzzleProgress = { solved: Record<string, { gates: number; stars: 1 | 2 | 3 }> };
export const EMPTY_PUZZLES: PuzzleProgress = { solved: {} };
export const PUZZLES_KEY = "qp.puzzles.v1";

export function normalizePuzzleProgress(raw: unknown): PuzzleProgress {
  const out: PuzzleProgress = { solved: {} };
  const src = ((raw ?? {}) as Partial<PuzzleProgress>).solved;
  if (src && typeof src === "object") {
    for (const p of PUZZLES) {
      const e = (src as Record<string, { gates?: unknown; stars?: unknown }>)[p.id];
      if (e && typeof e.gates === "number" && e.gates > 0 && [1, 2, 3].includes(e.stars as number)) out.solved[p.id] = { gates: e.gates, stars: e.stars as 1 | 2 | 3 };
    }
  }
  return out;
}

/** Keep the best (fewest gates) result. */
export function recordSolve(prog: PuzzleProgress, p: Puzzle, gates: number): PuzzleProgress {
  const prev = prog.solved[p.id];
  if (prev && prev.gates <= gates) return prog;
  return { solved: { ...prog.solved, [p.id]: { gates, stars: starsFor(p, gates) } } };
}
