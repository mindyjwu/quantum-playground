export type Goal = { id: string; text: string; done: boolean; target?: string };
export type Reflections = { why: string; next30: string; skeptical: string; notes: string };
export type GoalsState = { reflections: Reflections; goals: Goal[] };

export const GOALS_KEY = "qp.goals.v1";
export const EMPTY_GOALS: GoalsState = {
  reflections: { why: "", next30: "", skeptical: "", notes: "" },
  goals: [],
};

export const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export function addGoal(s: GoalsState, text: string, target?: string, id: string = newId()): GoalsState {
  const t = text.trim();
  if (!t) return s;
  return { ...s, goals: [...s.goals, { id, text: t, done: false, ...(target ? { target } : {}) }] };
}
export const toggleGoal = (s: GoalsState, id: string): GoalsState => ({
  ...s, goals: s.goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g)),
});
export const removeGoal = (s: GoalsState, id: string): GoalsState => ({ ...s, goals: s.goals.filter((g) => g.id !== id) });
export const setReflection = (s: GoalsState, key: keyof Reflections, value: string): GoalsState => ({
  ...s, reflections: { ...s.reflections, [key]: value },
});

/** Tolerant parse of whatever is in storage: never throws, fills missing fields. */
export function normalize(raw: unknown): GoalsState {
  const r = (raw ?? {}) as Partial<GoalsState>;
  const ref = (r.reflections ?? {}) as Partial<Reflections>;
  return {
    reflections: {
      why: typeof ref.why === "string" ? ref.why : "",
      next30: typeof ref.next30 === "string" ? ref.next30 : "",
      skeptical: typeof ref.skeptical === "string" ? ref.skeptical : "",
      notes: typeof ref.notes === "string" ? ref.notes : "",
    },
    goals: Array.isArray(r.goals)
      ? r.goals.filter((g): g is Goal => !!g && typeof g.id === "string" && typeof g.text === "string").map((g) => ({
          id: g.id, text: g.text, done: !!g.done, ...(typeof g.target === "string" && g.target ? { target: g.target } : {}),
        }))
      : [],
  };
}

export function toMarkdown(s: GoalsState): string {
  const out = ["# My quantum goals", ""];
  const sec = (title: string, body: string) => { if (body.trim()) out.push(`## ${title}`, "", body.trim(), ""); };
  sec("Why quantum, for me?", s.reflections.why);
  sec("What I want to try in the next 30 days", s.reflections.next30);
  sec("Bets I'm skeptical of", s.reflections.skeptical);
  if (s.goals.length) {
    out.push("## Goals", "");
    for (const g of s.goals) out.push(`- [${g.done ? "x" : " "}] ${g.text}${g.target ? ` (target: ${g.target})` : ""}`);
    out.push("");
  }
  sec("Notes", s.reflections.notes);
  return out.join("\n").trimEnd() + "\n";
}
