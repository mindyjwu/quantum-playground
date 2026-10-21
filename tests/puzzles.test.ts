import { describe, expect, it } from "vitest";
import type { CircuitOp } from "@/lib/quantum";
import { EMPTY_PUZZLES, PUZZLES, budgetFor, closeness, describeTarget, evaluate, normalizePuzzleProgress, recordSolve, solve, starsFor } from "@/lib/puzzles";

describe("puzzle set", () => {
  it("has unique ids and a sensible spread across the three levels", () => {
    expect(new Set(PUZZLES.map((p) => p.id)).size).toBe(PUZZLES.length);
    const by = (l: string) => PUZZLES.filter((p) => p.level === l).length;
    expect(by("beginner")).toBeGreaterThanOrEqual(3); expect(by("intermediate")).toBeGreaterThanOrEqual(3); expect(by("expert")).toBeGreaterThanOrEqual(3);
  });
  it("every puzzle is solvable and its par is exactly the true minimum (exhaustive search)", () => {
    for (const p of PUZZLES) {
      const sol = solve(p, p.par); // search only up to the claimed par
      expect(sol, `${p.id} should be solvable within par`).not.toBeNull();
      expect(sol!.length, `${p.id} par must be minimal`).toBe(p.par);
      expect(solve(p, p.par - 1) === null || p.par === 1, `${p.id} must not be solvable in fewer gates`).toBe(true);
      expect(evaluate(p, sol!).solved).toBe(true);
    }
  }, 120000);
  it("the empty circuit never solves a puzzle (all start from |0...0> and need at least one gate)", () => {
    for (const p of PUZZLES) expect(evaluate(p, []).solved, p.id).toBe(false);
  });
  it("probability-mode puzzles accept any phase; state-mode puzzles insist on the right phase", () => {
    const find = (id: string) => PUZZLES.find((p) => p.id === id)!;
    const plus: CircuitOp[] = [{ kind: "gate", gate: "H", qubit: 0 }];
    expect(evaluate(find("b2"), plus).solved).toBe(true);                    // 50/50: |+> is fine
    const minusProbOnly = [{ kind: "gate", gate: "H", qubit: 0 }, { kind: "gate", gate: "Z", qubit: 0 }] as CircuitOp[];
    expect(evaluate(find("b2"), minusProbOnly).solved).toBe(true);           // |-> also 50/50
    expect(evaluate(find("i1"), plus).solved).toBe(false);                    // |+> is NOT |->
    expect(evaluate(find("i1"), minusProbOnly).solved).toBe(true);
    // a global phase must not matter: Z X Z X = -I applied to a solution still solves
    const bell = [{ kind: "gate", gate: "H", qubit: 0 }, { kind: "cnot", control: 0, target: 1 }] as CircuitOp[];
    expect(evaluate(find("b4"), bell).solved).toBe(true);
  });
  it("budgets: generous for beginners, exactly par for experts; stars by gate count", () => {
    for (const p of PUZZLES) {
      expect(budgetFor(p)).toBe(p.par + (p.level === "beginner" ? 3 : p.level === "intermediate" ? 1 : 0));
      expect(budgetFor(p)).toBeLessThanOrEqual(6); // the circuit grid has 6 columns
    }
    const p = PUZZLES.find((x) => x.id === "b4")!; // par 2
    expect([starsFor(p, 2), starsFor(p, 3), starsFor(p, 5), starsFor(p, 1)]).toEqual([3, 2, 1, 3]);
  });
  it("every puzzle has two non-empty hints and story/goal text", () => {
    for (const p of PUZZLES) { expect(p.hints.every((h) => h.length > 5)).toBe(true); expect(p.story.length).toBeGreaterThan(20); expect(p.goal.length).toBeGreaterThan(5); }
  });
});

describe("closeness and target description", () => {
  const find = (id: string) => PUZZLES.find((p) => p.id === id)!;
  it("a solved probability-only puzzle reads 100% close even when the phase differs from the display state", () => {
    const hz = [{ kind: "gate", gate: "H", qubit: 0 }, { kind: "gate", gate: "Z", qubit: 0 }] as CircuitOp[];
    const ev = evaluate(find("b2"), hz);
    expect(ev.solved).toBe(true);
    expect(ev.fidelity).toBeLessThan(0.01);                    // |-> vs |+>: the full-state fidelity would mislead
    expect(closeness(find("b2"), ev)).toBeCloseTo(1, 9);
  });
  it("closeness is 0..1, rises as you approach, and equals fidelity for state puzzles", () => {
    const p = find("i1");
    const none = closeness(p, evaluate(p, [])), plus = closeness(p, evaluate(p, [{ kind: "gate", gate: "H", qubit: 0 }]));
    expect(none).toBeCloseTo(0.5, 9); expect(plus).toBeLessThan(1e-9);                      // |+> is orthogonal to |->
    expect(closeness(p, evaluate(p, [{ kind: "gate", gate: "H", qubit: 0 }, { kind: "gate", gate: "Z", qubit: 0 }]))).toBeCloseTo(1, 9);
  });
  it("describeTarget lists only the nonzero odds, and is empty for state puzzles", () => {
    expect(describeTarget(find("b4"))).toBe("50% |00⟩  ·  50% |11⟩");
    expect(describeTarget(find("b1"))).toBe("100% |1⟩");
    expect(describeTarget(find("i1"))).toBe("");
  });
});

describe("puzzle progress", () => {
  const p = PUZZLES.find((x) => x.id === "b4")!;
  it("keeps the best result and never regresses", () => {
    let s = recordSolve(EMPTY_PUZZLES, p, 4);
    expect(s.solved.b4).toEqual({ gates: 4, stars: 1 });
    s = recordSolve(s, p, 2); expect(s.solved.b4).toEqual({ gates: 2, stars: 3 });
    const same = recordSolve(s, p, 3); expect(same).toBe(s); // worse result: unchanged object
  });
  it("normalize ignores garbage, unknown ids and bad stars", () => {
    for (const bad of [null, undefined, 3, "x", [], { solved: "no" }]) expect(normalizePuzzleProgress(bad)).toEqual(EMPTY_PUZZLES);
    const n = normalizePuzzleProgress({ solved: { b1: { gates: 1, stars: 3 }, b2: { gates: 0, stars: 3 }, b3: { gates: 2, stars: 9 }, nope: { gates: 1, stars: 1 } } });
    expect(n.solved).toEqual({ b1: { gates: 1, stars: 3 } });
  });
});
