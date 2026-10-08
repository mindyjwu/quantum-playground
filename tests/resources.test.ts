import { describe, expect, it } from "vitest";
import { RESOURCES } from "@/data/resources";
import { NO_FILTERS, filterResources } from "@/lib/resources";

describe("resource data", () => {
  it("has unique ids and https URLs", () => {
    expect(new Set(RESOURCES.map((r) => r.id)).size).toBe(RESOURCES.length);
    for (const r of RESOURCES) expect(r.url.startsWith("https://")).toBe(true);
  });
  it("covers every requested seed and all five formats", () => {
    const text = RESOURCES.map((r) => `${r.title} ${r.creator}`).join(" ");
    for (const s of ["3Blue1Brown", "Space Time", "Watrous", "Susskind", "8.04", "Mindscape", "Quanta", "Physics World", "Quantum Country", "Ben Eater", "Nielsen"]) expect(text).toContain(s);
    expect(new Set(RESOURCES.map((r) => r.format))).toEqual(new Set(["video", "podcast", "article", "book", "course"]));
  });
  it("verified, when set, is an ISO date (YYYY-MM-DD)", () => {
    for (const r of RESOURCES) if (r.verified) expect(r.verified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("filterResources", () => {
  it("returns everything with no filters", () => expect(filterResources(RESOURCES, NO_FILTERS)).toHaveLength(RESOURCES.length));
  it("filters by format (multi-select is OR)", () => {
    const out = filterResources(RESOURCES, { ...NO_FILTERS, formats: ["podcast", "book"] });
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((r) => r.format === "podcast" || r.format === "book")).toBe(true);
  });
  it("combines dimensions with AND", () => {
    const out = filterResources(RESOURCES, { ...NO_FILTERS, levels: ["beginner"], cost: "free", formats: ["video"] });
    expect(out.every((r) => r.level === "beginner" && r.cost === "free" && r.format === "video")).toBe(true);
  });
  it("paid filter finds the textbook only", () => {
    expect(filterResources(RESOURCES, { ...NO_FILTERS, cost: "paid" }).map((r) => r.id)).toEqual(["nielsen-chuang"]);
  });
  it("text search is case-insensitive", () => expect(filterResources(RESOURCES, { ...NO_FILTERS, query: "GROVER" }).length).toBeGreaterThan(0));
  it("no match gives an empty list", () => expect(filterResources(RESOURCES, { ...NO_FILTERS, query: "zzzz-none" })).toEqual([]));
});
