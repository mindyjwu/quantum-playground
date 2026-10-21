import { describe, expect, it } from "vitest";
import { STAGES } from "@/data/stages";
import { PUZZLES, EMPTY_PUZZLES } from "@/lib/puzzles";
import { VIEW, buildConstellation, litStars, summarize } from "@/lib/constellation";

describe("progress constellation", () => {
  const groups = buildConstellation();
  const nodes = groups.flatMap((g) => g.nodes);
  it("has one star per lesson, quiz and puzzle, with unique ids", () => {
    const lessons = STAGES.reduce((n, s) => n + s.lessons.length, 0);
    expect(nodes).toHaveLength(lessons + STAGES.length + PUZZLES.length);
    expect(new Set(nodes.map((n) => n.id)).size).toBe(nodes.length);
  });
  it("is deterministic and keeps every star inside the view", () => {
    expect(buildConstellation()).toEqual(groups);
    for (const n of nodes) { expect(n.x).toBeGreaterThan(10); expect(n.x).toBeLessThan(VIEW.w - 10); expect(n.y).toBeGreaterThan(10); expect(n.y).toBeLessThan(VIEW.h - 10); }
  });
  it("no two stars sit on top of each other", () => {
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) expect(Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y), `${nodes[i].id} vs ${nodes[j].id}`).toBeGreaterThan(12);
  });
  it("lights stars from lessons, quizzes and puzzles", () => {
    const lit = litStars({ lessons: { f1: true, g2: true, nope: true }, quiz: { foundations: 0, gates: undefined as unknown as number } }, { solved: { b1: { gates: 1, stars: 3 } } });
    expect([...lit].sort()).toEqual(["f1", "g2", "puzzle:b1", "quiz:foundations"].sort()); // a quiz scored 0 still counts as attempted; unknown ids ignored
    const s = summarize(groups, lit);
    expect(s).toMatchObject({ lit: 4, lessons: { lit: 2, total: 15 }, quizzes: { lit: 1, total: 4 }, puzzles: { lit: 1, total: PUZZLES.length } });
  });
  it("starts dark and tolerates missing fields", () => {
    expect(litStars({ lessons: {}, quiz: {} }, EMPTY_PUZZLES).size).toBe(0);
    expect(litStars({} as never, EMPTY_PUZZLES).size).toBe(0);
  });
});
