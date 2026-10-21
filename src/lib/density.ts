import { applyCNOT, applySingle, GATES, runCircuit, zeroState, type CircuitOp, type Complex, type Matrix2 } from "./quantum";

/**
 * Exact density-matrix simulation with depolarizing noise, for up to 3 qubits (an 8x8 matrix).
 * Built on top of the state-vector simulator so the ideal part is identical to everything else on the site.
 */
export type Mat = Complex[][];
export type NoiseModel = { p1: number; p2: number }; // error probability after each single-qubit / two-qubit gate

const c = (re: number, im = 0): Complex => ({ re, im });
const PAULI_Y: Matrix2 = [[c(0), c(0, -1)], [c(0, 1), c(0)]];
const PAULI: Record<"X" | "Y" | "Z", Matrix2> = { X: GATES.X, Y: PAULI_Y, Z: GATES.Z };

const zeros = (d: number): Mat => Array.from({ length: d }, () => Array.from({ length: d }, () => c(0)));
const mul = (a: Complex, b: Complex): Complex => c(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);

export function matMul(a: Mat, b: Mat): Mat {
  const d = a.length, out = zeros(d);
  for (let i = 0; i < d; i++) for (let k = 0; k < d; k++) { const aik = a[i][k]; if (aik.re === 0 && aik.im === 0) continue; for (let j = 0; j < d; j++) { const t = mul(aik, b[k][j]); out[i][j].re += t.re; out[i][j].im += t.im; } }
  return out;
}
export const dagger = (a: Mat): Mat => a.map((_, i) => a.map((__, j) => c(a[j][i].re, -a[j][i].im)));
const conjugate = (u: Mat, rho: Mat): Mat => matMul(matMul(u, rho), dagger(u));

/** The full 2^n x 2^n matrix of an operation, built column by column from the state-vector simulator. */
function fullMatrix(n: number, apply: (s: Complex[]) => Complex[]): Mat {
  const d = 2 ** n, m = zeros(d);
  for (let j = 0; j < d; j++) {
    const basis = zeroState(n).map(() => c(0)); basis[j] = c(1);
    const col = apply(basis);
    for (let i = 0; i < d; i++) m[i][j] = col[i];
  }
  return m;
}
const opMatrix = (n: number, op: CircuitOp): Mat =>
  fullMatrix(n, (s) => (op.kind === "gate" ? applySingle(s, n, op.qubit, GATES[op.gate]) : applyCNOT(s, n, op.control, op.target)));
const pauliMatrix = (n: number, qubit: number, p: "X" | "Y" | "Z"): Mat => fullMatrix(n, (s) => applySingle(s, n, qubit, PAULI[p]));

/** rho -> (1-p) rho + p/m * sum over the m non-identity Paulis acting on `qubits` of P rho P. */
function depolarize(n: number, rho: Mat, qubits: number[], p: number): Mat {
  if (p <= 0) return rho;
  const single = qubits.map((q) => (["X", "Y", "Z"] as const).map((k) => pauliMatrix(n, q, k)));
  const d = rho.length;
  const paulis: Mat[] = [];
  if (qubits.length === 1) paulis.push(...single[0]);
  else for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) {
    if (a === 0 && b === 0) continue;                       // skip identity-identity
    const A = a === 0 ? null : single[0][a - 1], B = b === 0 ? null : single[1][b - 1];
    paulis.push(A && B ? matMul(A, B) : (A ?? B)!);
  }
  const out = zeros(d);
  for (let i = 0; i < d; i++) for (let j = 0; j < d; j++) { out[i][j].re = (1 - p) * rho[i][j].re; out[i][j].im = (1 - p) * rho[i][j].im; }
  for (const P of paulis) {
    const t = conjugate(P, rho);
    const w = p / paulis.length;
    for (let i = 0; i < d; i++) for (let j = 0; j < d; j++) { out[i][j].re += w * t[i][j].re; out[i][j].im += w * t[i][j].im; }
  }
  return out;
}

export type NoisyResult = { rho: Mat; probs: number[]; fidelity: number; purity: number };

export function simulateNoisy(n: number, ops: CircuitOp[], noise: NoiseModel): NoisyResult {
  const d = 2 ** n;
  let rho = zeros(d); rho[0][0] = c(1);
  for (const op of ops) {
    rho = conjugate(opMatrix(n, op), rho);
    rho = op.kind === "gate" ? depolarize(n, rho, [op.qubit], noise.p1) : depolarize(n, rho, [op.control, op.target], noise.p2);
  }
  const ideal = runCircuit(n, ops);
  // fidelity with the ideal pure state: <psi| rho |psi>
  let f = 0;
  for (let i = 0; i < d; i++) for (let j = 0; j < d; j++) {
    const a = ideal[i], b = ideal[j], r = rho[i][j];
    const rb = c(r.re * b.re - r.im * b.im, r.re * b.im + r.im * b.re);        // rho_ij * psi_j
    f += a.re * rb.re + a.im * rb.im;                                          // conj(psi_i) * (rho psi)_i, real part
  }
  let purity = 0;
  for (let i = 0; i < d; i++) for (let j = 0; j < d; j++) purity += rho[i][j].re * rho[j][i].re - rho[i][j].im * rho[j][i].im;
  return { rho, probs: rho.map((row, i) => Math.max(0, row[i].re)), fidelity: f, purity };
}

/** The slider value is the two-qubit gate error; single-qubit gates are ten times better, roughly the real-world pattern. */
export const noiseFromSlider = (p: number): NoiseModel => ({ p1: p / 10, p2: p });
