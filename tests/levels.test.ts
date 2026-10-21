import { describe, expect, it } from "vitest";
import { STAGES } from "@/data/stages";
import { EXPERT_QUESTIONS, HINTS, LEVEL_EXTRAS } from "@/data/levels";
import { questionsFor, showHints } from "@/lib/levels";

describe("level content integrity", () => {
  it("every lesson has a plain-language version and a go-deeper panel", () => {
    const ids = STAGES.flatMap((s) => s.lessons.map((l) => l.id));
    expect(ids).toHaveLength(15);
    for (const id of ids) {
      const x = LEVEL_EXTRAS[id];
      expect(x, id).toBeTruthy();
      expect(x.plain.join(" ").length, id).toBeGreaterThan(80);
      expect(x.deeper.title.length).toBeGreaterThan(5);
      expect(x.deeper.body.join(" ").length, id).toBeGreaterThan(150);
    }
    expect(Object.keys(LEVEL_EXTRAS).sort()).toEqual([...ids].sort()); // no orphan entries
  });
  it("every base question has a hint, with no orphan hints", () => {
    for (const s of STAGES) s.quiz.forEach((q, i) => {
      const h = HINTS[`${s.id}:${i}`];
      expect(h, `${s.id}:${i}`).toBeTruthy();
    });
    expect(Object.keys(HINTS)).toHaveLength(STAGES.reduce((n, s) => n + s.quiz.length, 0));
  });
  it("expert questions are well-formed: 2 per stage, 4 options, a valid unique answer index and an explanation", () => {
    for (const s of STAGES) {
      const qs = EXPERT_QUESTIONS[s.id];
      expect(qs, s.id).toHaveLength(2);
      for (const q of qs) {
        expect(q.options).toHaveLength(4);
        expect(new Set(q.options).size).toBe(4);
        expect(q.answer).toBeGreaterThanOrEqual(0); expect(q.answer).toBeLessThan(4);
        expect(q.why.length).toBeGreaterThan(30);
      }
    }
  });
  it("questionsFor: base for beginner/intermediate, base + 2 bonus for expert; hints attached", () => {
    for (const s of STAGES) {
      expect(questionsFor(s, "beginner")).toHaveLength(4);
      expect(questionsFor(s, "intermediate")).toHaveLength(4);
      const ex = questionsFor(s, "expert");
      expect(ex).toHaveLength(6);
      expect(ex.slice(0, 4).every((q) => !q.expert && q.hint)).toBe(true);
      expect(ex.slice(4).every((q) => q.expert)).toBe(true);
    }
  });
  it("hint visibility rule", () => {
    expect(showHints("beginner", "instrument")).toBe(true);
    expect(showHints("expert", "cozy")).toBe(true);
    expect(showHints("expert", "instrument")).toBe(false);
    expect(showHints("intermediate", "instrument")).toBe(false);
  });
});
