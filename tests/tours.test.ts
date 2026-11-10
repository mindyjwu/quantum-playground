import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { TOURS, tourById } from "@/data/tours";

const words = (s: string) => s.split(/\s+/).filter(Boolean);

describe("guided tours", () => {
  it("have unique ids and can be looked up", () => {
    expect(new Set(TOURS.map((t) => t.id)).size).toBe(TOURS.length);
    for (const t of TOURS) expect(tourById(t.id)).toBe(t);
    expect(tourById("nope")).toBeUndefined();
  });

  it("only open pages that exist", () => {
    for (const t of TOURS) for (const s of t.steps) {
      const file = s.path === "/" ? "src/app/page.tsx" : join("src/app", s.path, "page.tsx");
      expect(existsSync(file), `${t.id}: ${s.path}`).toBe(true);
    }
  });

  it("are short: 4 to 6 steps, a few minutes, with something to learn", () => {
    for (const t of TOURS) {
      expect(t.steps.length).toBeGreaterThanOrEqual(4);
      expect(t.steps.length).toBeLessThanOrEqual(6);
      expect(t.minutes).toBeLessThanOrEqual(5);
      expect(t.learn.length).toBe(3);
    }
  });

  // Plain language guard: short sentences and no formula notation in the explanations.
  it("keep every step easy to read", () => {
    for (const t of TOURS) for (const s of t.steps) {
      expect(words(s.text).length, `${t.id}: "${s.title}" is too long`).toBeLessThanOrEqual(60);
      for (const sentence of s.text.split(/(?<=[.?!])\s+/)) expect(words(sentence).length, `${t.id}: "${sentence}"`).toBeLessThanOrEqual(30);
      expect(s.text, `${t.id}: "${s.title}"`).not.toMatch(/[√⟩ψθ]|\\frac|\^/);
    }
  });
});
