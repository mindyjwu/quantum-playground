import { describe, expect, it } from "vitest";
import { GLOSSARY } from "@/data/glossary";
import { STAGES } from "@/data/stages";
import { LEVEL_EXTRAS } from "@/data/levels";
import { annotateBlocks, type Segment } from "@/lib/glossary";

const join = (segs: Segment[]) => segs.map((s) => s.text).join("");
const terms = (segs: Segment[][]) => segs.flat().filter((s) => s.type === "term").map((s) => (s as { id: string }).id);

describe("glossary data", () => {
  it("has unique ids, non-empty short definitions, and no wording that maps to two terms", () => {
    expect(new Set(GLOSSARY.map((t) => t.id)).size).toBe(GLOSSARY.length);
    const seen = new Map<string, string>();
    for (const t of GLOSSARY) {
      expect(t.short.length, t.id).toBeGreaterThan(30);
      expect(t.short.length, `${t.id} should stay short`).toBeLessThan(330);
      expect(t.match.length).toBeGreaterThan(0);
      for (const m of t.match) { const k = m.toLowerCase(); expect(seen.has(k) ? seen.get(k) : t.id, `"${m}" is claimed by two terms`).toBe(t.id); seen.set(k, t.id); }
    }
  });
});

describe("annotateBlocks", () => {
  it("finds terms, ignores case, and keeps the original casing", () => {
    const s = annotateBlocks(["A Qubit is not a bit."])[0];
    expect(s.filter((x) => x.type === "term")).toEqual([{ type: "term", text: "Qubit", id: "qubit" }]);
    expect(join(s)).toBe("A Qubit is not a bit.");
  });
  it("only matches whole words", () => {
    expect(terms(annotateBlocks(["Unqubited cubits and phased gated metagate"]))).toEqual([]);
    expect(terms(annotateBlocks(["the qubit, the qubits."]))).toEqual(["qubit"]); // once
  });
  it("prefers the longest wording at a position", () => {
    expect(terms(annotateBlocks(["Grover's algorithm is fast."]))).toEqual(["grover"]);
    expect(annotateBlocks(["Grover's algorithm is fast."])[0][0]).toMatchObject({ type: "term", text: "Grover's algorithm" });
    expect(terms(annotateBlocks(["the global phase"]))).toEqual(["global-phase"]);      // not 'phase'
    expect(terms(annotateBlocks(["the H gate"]))).toEqual(["h-gate"]);                  // not 'gate'
  });
  it("marks each term only once across a lesson's blocks", () => {
    const segs = annotateBlocks(["A qubit and a qubit.", "Another qubit, plus entanglement."]);
    expect(terms(segs)).toEqual(["qubit", "entanglement"]);
  });
  it("handles curly apostrophes, hyphens and punctuation", () => {
    expect(terms(annotateBlocks(["Shor’s algorithm, then (post-quantum)!"]))).toEqual(["shor", "pqc"]);
    expect(terms(annotateBlocks(["fault-tolerant machines"]))).toEqual(["fault-tolerant"]);
  });
  it("reads 'bit' as the unit but not in the idiom 'a bit like'", () => {
    expect(terms(annotateBlocks(["Algorithms work a bit like headphones."]))).toEqual([]);
    expect(terms(annotateBlocks(["A bit like this, and also A Bit more."]))).toEqual([]);
    expect(terms(annotateBlocks(["A normal bit is on or off."]))).toEqual(["bit"]);
    expect(terms(annotateBlocks(["You get one bit, then more bits."]))).toEqual(["bit"]);   // once per lesson
    expect(terms(annotateBlocks(["a classical bit"]))).toEqual(["classical", "bit"]);
  });
  it("leaves text without terms untouched", () => {
    expect(annotateBlocks(["Nothing to see here."])).toEqual([[{ type: "text", text: "Nothing to see here." }]]);
    expect(annotateBlocks([""])).toEqual([[{ type: "text", text: "" }]]);
  });
  it("never alters the text: joining segments reproduces every lesson paragraph exactly", () => {
    for (const s of STAGES) for (const l of s.lessons) {
      const blocks = [...(LEVEL_EXTRAS[l.id]?.plain ?? []), ...l.body];
      const out = annotateBlocks(blocks);
      out.forEach((segs, i) => expect(join(segs), `${l.id} block ${i}`).toBe(blocks[i]));
    }
  });
  it("actually covers the lessons: at least 30 distinct glossary terms appear in them", () => {
    const used = new Set<string>();
    for (const s of STAGES) for (const l of s.lessons) for (const id of terms(annotateBlocks([...(LEVEL_EXTRAS[l.id]?.plain ?? []), ...l.body]))) used.add(id);
    expect(used.size).toBeGreaterThanOrEqual(30);
    for (const id of ["qubit", "amplitude", "superposition", "entanglement", "cnot", "shor", "grover", "pqc"]) expect(used.has(id), id).toBe(true);
  });
});
