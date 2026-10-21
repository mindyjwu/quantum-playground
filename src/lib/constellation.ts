import { STAGES } from "@/data/stages";
import { PUZZLES, type PuzzleProgress } from "./puzzles";
import { mulberry32 } from "./stars";
import type { ProgressState } from "@/components/Progress";

export type StarNode = { id: string; kind: "lesson" | "quiz" | "puzzle"; label: string; group: string; x: number; y: number };
export type Group = { id: string; label: string; cx: number; cy: number; nodes: StarNode[] };

export const VIEW = { w: 800, h: 330 };

/** A small, deterministic constellation per stage (lessons + quiz), plus a wavy line of puzzle stars along the bottom. */
export function buildConstellation(): Group[] {
  const groups: Group[] = [];
  const centers = [[120, 80], [310, 60], [500, 90], [690, 65]];
  STAGES.forEach((s, gi) => {
    const rnd = mulberry32(1000 + gi * 77);
    const [cx, cy] = centers[gi];
    const items = [...s.lessons.map((l) => ({ id: l.id, kind: "lesson" as const, label: l.title })), { id: `quiz:${s.id}`, kind: "quiz" as const, label: `Stage ${s.n} quiz` }];
    const w = 150;
    const nodes = items.map((it, i) => ({
      ...it, group: s.title,
      x: Math.round(cx - w / 2 + (items.length === 1 ? w / 2 : (i * w) / (items.length - 1))),
      y: Math.round(cy + Math.sin(i * 1.9 + gi) * 22 + (rnd() - 0.5) * 14),
    }));
    groups.push({ id: s.id, label: s.title, cx, cy, nodes });
  });
  const rnd = mulberry32(4242);
  const puzzleNodes = PUZZLES.map((p, i) => ({
    id: `puzzle:${p.id}`, kind: "puzzle" as const, label: p.title, group: "Puzzles",
    x: Math.round(50 + (i * 700) / (PUZZLES.length - 1)),
    y: Math.round(250 + Math.sin(i * 0.85) * 24 + (rnd() - 0.5) * 10),
  }));
  groups.push({ id: "puzzles", label: "Puzzles", cx: 400, cy: 250, nodes: puzzleNodes });
  return groups;
}

/** Which stars are lit, given the visitor's saved progress. A quiz star lights once the quiz has been attempted. */
export function litStars(progress: ProgressState, puzzles: PuzzleProgress): Set<string> {
  const lit = new Set<string>();
  for (const s of STAGES) {
    for (const l of s.lessons) if (progress.lessons?.[l.id]) lit.add(l.id);
    if (progress.quiz?.[s.id] !== undefined) lit.add(`quiz:${s.id}`);
  }
  for (const p of PUZZLES) if (puzzles.solved[p.id]) lit.add(`puzzle:${p.id}`);
  return lit;
}

export function summarize(groups: Group[], lit: Set<string>) {
  const all = groups.flatMap((g) => g.nodes);
  const count = (kind: StarNode["kind"]) => ({ lit: all.filter((n) => n.kind === kind && lit.has(n.id)).length, total: all.filter((n) => n.kind === kind).length });
  return { lit: all.filter((n) => lit.has(n.id)).length, total: all.length, lessons: count("lesson"), quizzes: count("quiz"), puzzles: count("puzzle") };
}
