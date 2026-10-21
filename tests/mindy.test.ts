import { describe, expect, it } from "vitest";
import { BUILT, INTRO, LINKS, LOG, NEXT, WHY } from "@/data/mindy";

describe("Mindy's Space content", () => {
  it("has substantive text in every section and no leftover placeholders", () => {
    const all = [INTRO.lead, ...WHY, ...BUILT.map((b) => b.text), ...LOG.map((l) => l.text), ...NEXT].join(" ");
    expect(all.length).toBeGreaterThan(800);
    expect(all).not.toMatch(/TODO|lorem|placeholder|your name here|XXX/i);
    expect(LOG.length).toBeGreaterThanOrEqual(3);
  });
  it("links are https and the repo link points at the project", () => {
    for (const l of LINKS) expect(l.url.startsWith("https://")).toBe(true);
    expect(LINKS.some((l) => l.url === "https://github.com/mindyjwu/quantum-playground")).toBe(true);
  });
  it("never claims the real-hardware lab has been run (it has not)", () => {
    const text = [...BUILT.map((b) => b.text), ...LOG.map((l) => `${l.title} ${l.text}`)].join(" ");
    expect(text).not.toMatch(/ran (lab 1 )?on (a )?real (ibm )?(quantum )?(hardware|computer)/i);
    expect(BUILT.some((b) => /hasn't been run|not yet/i.test(b.label + b.text))).toBe(true);
  });
});
