import { describe, expect, it } from "vitest";
import { EMPTY_GOALS, addGoal, normalize, removeGoal, setReflection, toMarkdown, toggleGoal } from "@/lib/goals";

describe("goals state", () => {
  it("adds trimmed goals and ignores blanks", () => {
    let s = addGoal(EMPTY_GOALS, "  Run Lab 1 on hardware  ", "2026-11-30", "a");
    expect(s.goals).toEqual([{ id: "a", text: "Run Lab 1 on hardware", done: false, target: "2026-11-30" }]);
    expect(addGoal(s, "   ")).toBe(s);
  });
  it("toggles and removes by id without mutating the original", () => {
    const s = addGoal(EMPTY_GOALS, "x", undefined, "a");
    const t = toggleGoal(s, "a");
    expect(t.goals[0].done).toBe(true);
    expect(s.goals[0].done).toBe(false);
    expect(removeGoal(t, "a").goals).toEqual([]);
  });
  it("normalize survives garbage and partial data", () => {
    for (const bad of [null, undefined, 5, "x", [], { goals: "no" }, { reflections: 3 }]) {
      const n = normalize(bad);
      expect(n.goals).toEqual([]);
      expect(n.reflections.why).toBe("");
    }
    const n = normalize({ goals: [{ id: "1", text: "ok", done: 1 }, { nope: true }, null], reflections: { why: "w", next30: 4 } });
    expect(n.goals).toEqual([{ id: "1", text: "ok", done: true }]);
    expect(n.reflections).toEqual({ why: "w", next30: "", skeptical: "", notes: "" });
  });
});

describe("toMarkdown", () => {
  it("is just a title when empty", () => expect(toMarkdown(EMPTY_GOALS)).toBe("# My quantum goals\n"));
  it("renders sections, checkboxes and targets; skips empty sections", () => {
    let s = setReflection(EMPTY_GOALS, "why", "Build things that matter.");
    s = addGoal(s, "Ship a PQC inventory tool", "Q1", "a");
    s = toggleGoal(addGoal(s, "Read Watrous unit 1", undefined, "b"), "b");
    const md = toMarkdown(s);
    expect(md).toContain("## Why quantum, for me?\n\nBuild things that matter.");
    expect(md).toContain("- [ ] Ship a PQC inventory tool (target: Q1)");
    expect(md).toContain("- [x] Read Watrous unit 1");
    expect(md).not.toContain("skeptical");
  });
});
