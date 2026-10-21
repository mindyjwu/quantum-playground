import { describe, expect, it } from "vitest";
import { probabilities, runCircuit, type CircuitOp } from "@/lib/quantum";
import { dagger, noiseFromSlider, simulateNoisy } from "@/lib/density";

const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps);
const bell: CircuitOp[] = [{ kind: "gate", gate: "H", qubit: 0 }, { kind: "cnot", control: 0, target: 1 }];
const ghz: CircuitOp[] = [{ kind: "gate", gate: "H", qubit: 0 }, { kind: "cnot", control: 0, target: 1 }, { kind: "cnot", control: 1, target: 2 }];

describe("noiseless density matrix matches the ideal simulator", () => {
  it("probabilities, fidelity 1 and purity 1 for several circuits", () => {
    for (const [n, ops] of [[2, bell], [3, ghz], [1, [{ kind: "gate", gate: "H", qubit: 0 }, { kind: "gate", gate: "Z", qubit: 0 }]], [2, []]] as [number, CircuitOp[]][]) {
      const r = simulateNoisy(n, ops, { p1: 0, p2: 0 });
      const ideal = probabilities(runCircuit(n, ops));
      r.probs.forEach((p, i) => close(p, ideal[i]));
      close(r.fidelity, 1); close(r.purity, 1);
    }
  });
});

describe("analytic checks of the depolarizing model", () => {
  it("one X gate with single-qubit error p gives P(1) = 1 - 2p/3", () => {
    for (const p of [0.03, 0.2, 0.75]) close(simulateNoisy(1, [{ kind: "gate", gate: "X", qubit: 0 }], { p1: p, p2: 0 }).probs[1], 1 - (2 * p) / 3);
  });
  it("a Bell pair with only two-qubit error p has fidelity exactly 1 - 0.8p (3 of the 15 Paulis leave it unchanged)", () => {
    for (const p of [0.01, 0.1, 0.5]) close(simulateNoisy(2, bell, { p1: 0, p2: p }).fidelity, 1 - 0.8 * p);
  });
  it("a fully depolarizing two-qubit gate (p = 15/16) leaves the maximally mixed state", () => {
    const r = simulateNoisy(2, [{ kind: "cnot", control: 0, target: 1 }], { p1: 0, p2: 15 / 16 });
    r.probs.forEach((q) => close(q, 0.25)); close(r.purity, 0.25);
  });
});

describe("physical sanity", () => {
  const model = noiseFromSlider(0.05);
  it("trace stays 1, matrix is Hermitian, and probabilities are valid", () => {
    for (const [n, ops] of [[2, bell], [3, ghz]] as [number, CircuitOp[]][]) {
      const { rho, probs } = simulateNoisy(n, ops, model);
      close(probs.reduce((a, b) => a + b, 0), 1);
      const dg = dagger(rho);
      rho.forEach((row, i) => row.forEach((v, j) => { close(v.re, dg[i][j].re); close(v.im, dg[i][j].im); }));
      expect(probs.every((p) => p >= -1e-12 && p <= 1 + 1e-12)).toBe(true);
    }
  });
  it("more noise never helps: fidelity falls and purity falls as the slider rises", () => {
    let lastF = 2, lastP = 2;
    for (const p of [0, 0.01, 0.03, 0.06, 0.1]) { const r = simulateNoisy(3, ghz, noiseFromSlider(p)); expect(r.fidelity).toBeLessThanOrEqual(lastF + 1e-12); expect(r.purity).toBeLessThanOrEqual(lastP + 1e-12); lastF = r.fidelity; lastP = r.purity; }
  });
  it("more gates means more error: GHZ (3 gates) degrades more than Bell (2) at the same slider value", () => {
    expect(simulateNoisy(3, ghz, noiseFromSlider(0.05)).fidelity).toBeLessThan(simulateNoisy(2, bell, noiseFromSlider(0.05)).fidelity);
  });
  it("noise leaks probability into outcomes the ideal circuit never gives (01 and 10 for a Bell pair)", () => {
    const r = simulateNoisy(2, bell, noiseFromSlider(0.05));
    expect(r.probs[1]).toBeGreaterThan(0); expect(r.probs[2]).toBeGreaterThan(0);
    close(r.probs[1], r.probs[2]); // symmetric
  });
  it("slider maps to single-qubit error one tenth of the two-qubit error", () => { expect(noiseFromSlider(0.04)).toEqual({ p1: 0.004, p2: 0.04 }); });
});
