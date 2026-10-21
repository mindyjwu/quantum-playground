import type { Question, Stage } from "@/data/stages";
import { EXPERT_QUESTIONS, HINTS } from "@/data/levels";
import type { Level, PlayStyle } from "./prefs";

export type QuizQuestion = Question & { hint?: string; expert?: boolean };

/** The 4 base questions for everyone; experts also get 2 bonus questions. */
export function questionsFor(stage: Stage, level: Level): QuizQuestion[] {
  const base: QuizQuestion[] = stage.quiz.map((q, i) => ({ ...q, hint: HINTS[`${stage.id}:${i}`] }));
  if (level !== "expert") return base;
  return [...base, ...(EXPERT_QUESTIONS[stage.id] ?? []).map((q) => ({ ...q, expert: true }))];
}

/** Beginners always get hints; so does anyone on the Cozy style. Instrument-style intermediates and experts do not. */
export const showHints = (level: Level, style: PlayStyle) => level === "beginner" || style === "cozy";
