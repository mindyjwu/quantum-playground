import { describe, expect, it } from "vitest";
import { ABORT_THRESHOLD, chanceUndetected, measureOutcome, runBB84, stats, type Basis, type Bit } from "@/lib/bb84";
import { applySingle, GATES, probabilities, zeroState } from "@/lib/quantum";
import { mulberry32 } from "@/lib/stars";

describe("physics rule agrees with the state-vector simulator", () => {
  // prepare |bit> in a basis (X basis = apply H), measure in a basis (X basis = apply H first), read probabilities
  const prob = (b: Bit, prep: Basis, meas: Basis) => {
    let s = zeroState(1);
    if (b === 1) s = applySingle(s, 1, 0, GATES.X);
    if (prep === "X") s = applySingle(s, 1, 0, GATES.H);
    if (meas === "X") s = applySingle(s, 1, 0, GATES.H);
    return probabilities(s);
  };
  it("same basis: certain; different basis: fair coin", () => {
    for (const b of [0, 1] as Bit[]) for (const prep of ["Z", "X"] as Basis[]) for (const meas of ["Z", "X"] as Basis[]) {
      const p = prob(b, prep, meas);
      if (prep === meas) { expect(p[b]).toBeCloseTo(1, 9); } else { expect(p[0]).toBeCloseTo(0.5, 9); expect(p[1]).toBeCloseTo(0.5, 9); }
    }
  });
  it("measureOutcome follows that rule", () => {
    const rng = mulberry32(3);
    for (const b of [0, 1] as Bit[]) expect(measureOutcome(b, "X", "X", rng)).toBe(b);
    const ones = Array.from({ length: 4000 }, () => measureOutcome(1, "Z", "X", rng)).filter((x) => x === 1).length;
    expect(ones / 4000).toBeGreaterThan(0.46); expect(ones / 4000).toBeLessThan(0.54);
  });
});

describe("protocol", () => {
  it("is deterministic for a given seed, and different for different seeds", () => {
    expect(runBB84(32, true, mulberry32(9))).toEqual(runBB84(32, true, mulberry32(9)));
    expect(runBB84(32, true, mulberry32(9))).not.toEqual(runBB84(32, true, mulberry32(10)));
  });
  it("without an eavesdropper there are never any errors (ideal channel), and about half the bits are kept", () => {
    const r = runBB84(40000, false, mulberry32(1)), s = stats(r);
    expect(s.errorsInChecked).toBe(0); expect(r.filter((x) => x.error).length).toBe(0);
    expect(s.sifted / s.sent).toBeGreaterThan(0.48); expect(s.sifted / s.sent).toBeLessThan(0.52);
    expect(s.checked / s.sifted).toBeGreaterThan(0.48); expect(s.checked / s.sifted).toBeLessThan(0.52);
    expect(s.keyBits + s.checked).toBe(s.sifted); expect(s.verdict).toBe("ok");
  });
  it("kept bits always agree when no one is listening (Alice's key equals Bob's)", () => {
    for (const r of runBB84(500, false, mulberry32(2))) if (r.sifted) expect(r.bobBit).toBe(r.aliceBit);
  });
  it("an intercept-and-resend eavesdropper causes about 25% errors in the kept bits, and is caught", () => {
    const r = runBB84(40000, true, mulberry32(4)), s = stats(r);
    const keptErr = r.filter((x) => x.sifted && x.error).length / r.filter((x) => x.sifted).length;
    expect(keptErr).toBeGreaterThan(0.23); expect(keptErr).toBeLessThan(0.27);
    expect(s.qber).toBeGreaterThan(0.22); expect(s.qber).toBeLessThan(0.28);
    expect(s.verdict).toBe("abort"); expect(s.qber).toBeGreaterThan(ABORT_THRESHOLD);
  });
  it("Eve guesses the right basis half the time; when she does, no error is introduced", () => {
    const r = runBB84(20000, true, mulberry32(6));
    const right = r.filter((x) => x.eveBasis === x.aliceBasis);
    expect(right.length / r.length).toBeGreaterThan(0.48); expect(right.length / r.length).toBeLessThan(0.52);
    // when Eve picked Alice's basis, Bob's result (if he also used it) is perfect
    for (const x of right) if (x.sifted) expect(x.error).toBe(false);
  });
  it("the chance Eve escapes with k compared bits is (3/4)^k, matched by simulation", () => {
    expect(chanceUndetected(0)).toBe(1); expect(chanceUndetected(8)).toBeCloseTo(0.1001129, 6); expect(chanceUndetected(30)).toBeLessThan(2e-4);
    const rng = mulberry32(11); let runs = 0, clean = 0;
    for (let t = 0; t < 150000; t++) { const s = stats(runBB84(40, true, rng)); if (s.checked === 5) { runs++; if (s.errorsInChecked === 0) clean++; } }
    expect(runs).toBeGreaterThan(3000);
    expect(clean / runs).toBeGreaterThan(chanceUndetected(5) - 0.03); expect(clean / runs).toBeLessThan(chanceUndetected(5) + 0.03);
  });
  it("switching Eve on leaves Alice's and Bob's choices and the compared rows exactly the same", () => {
    const quiet = runBB84(64, false, mulberry32(21)), spied = runBB84(64, true, mulberry32(21));
    quiet.forEach((q, i) => { const e = spied[i]; expect([e.aliceBit, e.aliceBasis, e.bobBasis, e.sifted, e.checked]).toEqual([q.aliceBit, q.aliceBasis, q.bobBasis, q.sifted, q.checked]); });
    expect(spied.some((r) => r.error)).toBe(true);        // ...yet the spy's presence shows up as errors
    expect(quiet.every((r) => !r.error)).toBe(true);
  });
  it("stats handle the empty and no-comparison cases", () => {
    expect(stats([]).verdict).toBe("no-data"); expect(stats([]).qber).toBe(0);
  });
});
