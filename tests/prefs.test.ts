import { describe, expect, it } from "vitest";
import { DEFAULT_PREFS, LEVELS, START_PATHS, STYLES, normalizePrefs } from "@/lib/prefs";

describe("prefs", () => {
  it("falls back to defaults on garbage, field by field", () => {
    for (const bad of [null, undefined, 5, "x", [], {}, { level: "wizard" }, { style: 3 }]) {
      const n = normalizePrefs(bad);
      expect(n.level).toBe(DEFAULT_PREFS.level);
      expect(n.style).toBe(DEFAULT_PREFS.style);
      expect(n.welcomed).toBe(false);
    }
    expect(normalizePrefs({ level: "expert", style: "wizard", welcomed: "yes" })).toEqual({ level: "expert", style: "cozy", welcomed: false });
  });
  it("keeps valid values", () => {
    expect(normalizePrefs({ level: "beginner", style: "instrument", welcomed: true })).toEqual({ level: "beginner", style: "instrument", welcomed: true });
  });
  it("offers exactly three levels, two styles, and a path of 3 links per level", () => {
    expect(LEVELS.map((l) => l.id)).toEqual(["beginner", "intermediate", "expert"]);
    expect(STYLES.map((s) => s.id)).toEqual(["cozy", "instrument"]);
    for (const l of LEVELS) { expect(START_PATHS[l.id]).toHaveLength(3); for (const p of START_PATHS[l.id]) expect(p.href.startsWith("/")).toBe(true); }
  });
});
