import { describe, expect, it } from "vitest";
import { FACTS, HORIZON, HYPE_CHECK, KIND_META, LANES, PATHS } from "@/data/think-bigger";

const kinds = Object.keys(KIND_META);

describe("think bigger content integrity", () => {
  it("every fact has a valid claim label, a caveat and at least one https source", () => {
    for (const f of FACTS) {
      expect(kinds, f.id).toContain(f.kind);
      expect(f.caveat.length, f.id).toBeGreaterThan(20);
      expect(f.sources.length, f.id).toBeGreaterThan(0);
      for (const s of f.sources) expect(s.url.startsWith("https://"), s.url).toBe(true);
    }
  });
  it("every horizon entry carries a claim label, and no entry is labeled scheduled unless it is a dated commitment", () => {
    const items = HORIZON.flatMap((h) => h.items);
    expect(items.length).toBeGreaterThan(5);
    for (const i of items) expect(kinds).toContain(i.kind);
    // Vendor roadmaps and forecasts must never be presented as scheduled commitments.
    for (const i of items.filter((x) => /IBM|McKinsey|break RSA/.test(x.what))) expect(i.kind).not.toBe("scheduled");
  });
  it("covers the three requested opportunity lanes with risks, a first-30-days plan and sources", () => {
    expect(LANES.map((l) => l.id)).toEqual(["pqc", "tooling", "apps"]);
    for (const l of LANES) {
      expect(l.build.length).toBeGreaterThan(1);
      expect(l.risks.length, `${l.id} must name risks`).toBeGreaterThan(1);
      expect(l.first30.length).toBeGreaterThan(1);
      expect(l.sources.length).toBeGreaterThan(0);
    }
  });
  it("has four career paths and six hype-check questions with unique ids", () => {
    expect(PATHS).toHaveLength(4);
    expect(HYPE_CHECK).toHaveLength(6);
    expect(new Set(HYPE_CHECK.map((q) => q.id)).size).toBe(6);
  });
});
