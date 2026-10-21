export type Level = "beginner" | "intermediate" | "expert";
export type PlayStyle = "cozy" | "instrument";
export type Prefs = { level: Level; style: PlayStyle; welcomed: boolean };

export const PREFS_KEY = "qp.prefs.v1";
export const DEFAULT_PREFS: Prefs = { level: "intermediate", style: "cozy", welcomed: false };

export const LEVELS: { id: Level; label: string; blurb: string }[] = [
  { id: "beginner", label: "Beginner", blurb: "New to quantum. Plain language first, the math tucked away, and hints when you want them." },
  { id: "intermediate", label: "Intermediate", blurb: "Comfortable with vectors and matrices. The full lessons with the math, as written." },
  { id: "expert", label: "Expert", blurb: "Know the basics. Extra “go deeper” panels, tougher quiz questions and expert puzzles." },
];

export const STYLES: { id: PlayStyle; label: string; blurb: string }[] = [
  { id: "cozy", label: "Cozy", blurb: "Friendly prompts, hints close at hand, and a little celebration when you solve something." },
  { id: "instrument", label: "Instrument", blurb: "Terse and technical: exact numbers, no fanfare, hints out of the way." },
];

export const levelLabel = (l: Level) => LEVELS.find((x) => x.id === l)!.label;

export const START_PATHS: Record<Level, { href: string; label: string; why: string }[]> = {
  beginner: [
    { href: "/learn", label: "Learn, Stage 1", why: "Bits, qubits and measurement in plain language" },
    { href: "/demos#bloch", label: "Rotate a qubit", why: "See a qubit as a point on a sphere" },
    { href: "/play", label: "Try the warm-up puzzles", why: "Gentle circuits with hints" },
  ],
  intermediate: [
    { href: "/learn", label: "Learn, Stages 2 and 3", why: "Gates, entanglement and the main algorithms, with the math" },
    { href: "/build-lab", label: "Run Lab 1", why: "Your first circuit on a simulated (or real) IBM chip" },
    { href: "/play", label: "Intermediate puzzles", why: "Phases and entangled states" },
  ],
  expert: [
    { href: "/play", label: "Expert puzzles", why: "Multi-qubit states under tight gate budgets" },
    { href: "/build-lab", label: "Lab 2: test a Bell inequality", why: "CHSH on a simulator or real hardware" },
    { href: "/think-bigger#hype", label: "Stress-test a claim", why: "A six-question check for quantum hype" },
  ],
};

/** Tolerant parse of whatever is in storage: never throws, falls back field by field. */
export function normalizePrefs(raw: unknown): Prefs {
  const r = (raw ?? {}) as Partial<Prefs>;
  return {
    level: LEVELS.some((l) => l.id === r.level) ? (r.level as Level) : DEFAULT_PREFS.level,
    style: STYLES.some((s) => s.id === r.style) ? (r.style as PlayStyle) : DEFAULT_PREFS.style,
    welcomed: r.welcomed === true,
  };
}
