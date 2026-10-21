import { describe, expect, it } from "vitest";
import { REAL_WORLD } from "@/data/realworld";
import { FACTS, HORIZON, LANES, PATHS } from "@/data/think-bigger";
import { PROJECTS } from "@/data/labs";
import { annotateBlocks, type Segment } from "@/lib/glossary";

const join = (s: Segment[]) => s.map((x) => x.text).join("");
const ids = (groups: Segment[][][]) => new Set(groups.flat(2).filter((s) => s.type === "term").map((s) => (s as { id: string }).id));

/** Each "page" is a list of groups; a group's blocks share one once-per-term set, exactly as the components do. */
const realWorld = REAL_WORLD.map((c) => [c.principle, c.impact, c.caveat]);
const thinkBigger = [
  ...FACTS.map((f) => [f.text, f.caveat]),
  ...HORIZON.map((h) => h.items.map((i) => i.what)),
  ...LANES.map((l) => [l.why, ...l.build, ...l.risks, ...l.first30]),
  ...PATHS.map((p) => [p.blurb, p.next]),
];
const buildLab = PROJECTS.map((p) => [p.goal, p.learn.join(" · "), ...p.steps.map((s) => s.text), p.honest, ...p.extend]);

describe.each([["Real World", realWorld], ["Think Bigger", thinkBigger], ["Build Lab", buildLab]])("%s glossary annotation", (_name, groups) => {
  const annotated = (groups as string[][]).map((g) => annotateBlocks(g, _name === "Build Lab" ? {} : { exclude: ["measurement"] }));
  it("never alters a single character of the text", () => {
    (groups as string[][]).forEach((g, gi) => g.forEach((text, bi) => expect(join(annotated[gi][bi])).toBe(text)));
  });
  it("marks each term at most once per group", () => {
    for (const g of annotated) { const all = g.flat().filter((s) => s.type === "term").map((s) => (s as { id: string }).id); expect(new Set(all).size).toBe(all.length); }
  });
});

describe("everyday-English guards", () => {
  const allText = (groups: string[][]) => groups.map((g) => annotateBlocks(g, { exclude: ["measurement"] }));
  it("Real World and Think Bigger never attach the quantum 'measurement' definition", () => {
    for (const groups of [realWorld, thinkBigger]) expect(ids(allText(groups)).has("measurement")).toBe(false);
  });
  it("the finance sentence 'Investment measures belief' is left as plain text", () => {
    const f = FACTS.find((x) => x.caveat.includes("Investment measures belief"))!;
    const segs = annotateBlocks([f.text, f.caveat], { exclude: ["measurement"] })[1];
    expect(segs.some((s) => s.type === "term" && s.text.toLowerCase().startsWith("measure"))).toBe(false);
  });
});

describe("coverage of the extended pages", () => {
  it("Real World explains the physics and the QKD/quantum-network jargon", () => {
    const used = ids((realWorld).map((g) => annotateBlocks(g, { exclude: ["measurement"] })));
    for (const id of ["qkd", "tunneling", "spin", "stimulated-emission", "hyperfine", "nv-center", "quantum-repeater", "trusted-relay", "topological-qubit", "majorana", "pqc"]) expect(used.has(id), id).toBe(true);
    expect(used.size).toBeGreaterThanOrEqual(25);
  });
  it("Think Bigger explains the policy, standards and strategy jargon", () => {
    const used = ids(thinkBigger.map((g) => annotateBlocks(g, { exclude: ["measurement"] })));
    for (const id of ["darpa", "qbi", "cnsa", "hqc", "fn-dsa", "crypto-inventory", "crypto-agility", "resource-estimation", "hndl"]) expect(used.has(id), id).toBe(true);
    expect(used.size).toBeGreaterThanOrEqual(25);
  });
  it("Build Lab explains the tooling terms, including transpile, QPU and shots", () => {
    const used = ids(buildLab.map((g) => annotateBlocks(g)));
    for (const id of ["qiskit", "cirq", "pennylane", "qpu", "shot", "transpile", "circuit", "ghz", "loophole", "api-key", "hamiltonian"]) expect(used.has(id), id).toBe(true);
    expect(used.size).toBeGreaterThanOrEqual(25);
  });
});
