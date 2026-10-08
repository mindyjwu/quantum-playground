import { describe, expect, it } from "vitest";
import { makeStars, mulberry32, starCount, starY, twinkle } from "@/lib/stars";

describe("star field", () => {
  it("is deterministic for a given seed", () => {
    expect(makeStars(50)).toEqual(makeStars(50));
    expect(makeStars(50, 1)).not.toEqual(makeStars(50, 2));
    const r = mulberry32(5); const first = [r(), r(), r()];
    const r2 = mulberry32(5); expect([r2(), r2(), r2()]).toEqual(first);
  });
  it("keeps the sky stable on resize: the first N stars never change", () => {
    expect(makeStars(200).slice(0, 80)).toEqual(makeStars(80));
  });
  it("scales star count with screen size, within bounds", () => {
    const phone = starCount(390, 800), laptop = starCount(1440, 900), huge = starCount(3840, 2160);
    expect(phone).toBeGreaterThanOrEqual(70);
    expect(phone).toBeLessThan(laptop);
    expect(huge).toBe(240);
  });
  it("produces valid stars: ranges, a few bright flares, a mix of tones", () => {
    const s = makeStars(240);
    for (const st of s) {
      expect(st.x).toBeGreaterThanOrEqual(0); expect(st.x).toBeLessThan(1);
      expect(st.y).toBeGreaterThanOrEqual(0); expect(st.y).toBeLessThan(1);
      expect(st.r).toBeGreaterThan(0); expect(st.r).toBeLessThan(2);
      expect(st.a).toBeGreaterThan(0); expect(st.a).toBeLessThanOrEqual(1);
    }
    const flares = s.filter((x) => x.flare).length;
    expect(flares).toBeGreaterThanOrEqual(3); expect(flares).toBeLessThanOrEqual(10);
    expect(new Set(s.map((x) => x.tone))).toEqual(new Set(["white", "blue", "warm"]));
  });
  it("twinkle stays within [0,1], never goes fully dark, and actually varies", () => {
    for (const st of makeStars(120)) {
      const vals = Array.from({ length: 200 }, (_, i) => twinkle(st, i * 0.1));
      expect(Math.min(...vals)).toBeGreaterThan(0);
      expect(Math.max(...vals)).toBeLessThanOrEqual(1);
      expect(Math.max(...vals) - Math.min(...vals)).toBeGreaterThan(0.05);
    }
  });
  it("parallax wraps into the viewport for any scroll position", () => {
    const st = makeStars(1)[0];
    for (const sy of [0, 50, 1234, 99999, -500]) {
      const y = starY(st, sy, 800);
      expect(y).toBeGreaterThanOrEqual(0); expect(y).toBeLessThan(800);
    }
    expect(starY(st, 0, 800)).toBeCloseTo(st.y * 800, 6);
  });
});
