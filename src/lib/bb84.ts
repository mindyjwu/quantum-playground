/**
 * BB84 quantum key distribution (Bennett and Brassard, 1984), in an ideal noise-free model with an optional
 * intercept-and-resend eavesdropper. The physics rule used everywhere: a qubit prepared in one basis and measured in the SAME
 * basis gives a certain answer; measured in the OTHER basis it gives a fair coin flip. (Tested against the state-vector simulator.)
 */
export type Basis = "Z" | "X";
export type Bit = 0 | 1;

export type Round = {
  aliceBit: Bit; aliceBasis: Basis;
  eveBasis?: Basis; eveBit?: Bit;
  bobBasis: Basis; bobBit: Bit;
  /** Alice and Bob used the same basis, so they keep this bit. */
  sifted: boolean;
  /** One of a random half of the kept bits that they compare in public (and then throw away). */
  checked: boolean;
  /** Kept bit where Bob's result differs from Alice's. */
  error: boolean;
};

/** Roughly the error rate above which BB84 can no longer be made secure (about 11%, Shor and Preskill 2000). */
export const ABORT_THRESHOLD = 0.11;

const bit = (rng: () => number): Bit => (rng() < 0.5 ? 0 : 1);
const basis = (rng: () => number): Basis => (rng() < 0.5 ? "Z" : "X");

export function measureOutcome(prepBit: Bit, prepBasis: Basis, measureBasis: Basis, rng: () => number): Bit {
  return prepBasis === measureBasis ? prepBit : bit(rng);
}

export function runBB84(n: number, eve: boolean, rng: () => number): Round[] {
  // Draw everything Alice and Bob choose up front, so switching Eve on or off leaves THEIR choices untouched:
  // the same run, with and without a spy, differs only because of what she does to the qubits.
  const aliceBits = Array.from({ length: n }, () => bit(rng));
  const aliceBases = Array.from({ length: n }, () => basis(rng));
  const bobBases = Array.from({ length: n }, () => basis(rng));
  const compareCoins = Array.from({ length: n }, () => rng() < 0.5);

  const rounds: Round[] = [];
  for (let i = 0; i < n; i++) {
    const aliceBit = aliceBits[i], aliceBasis = aliceBases[i], bobBasis = bobBases[i];
    let sentBit = aliceBit, sentBasis = aliceBasis;
    let eveBasis: Basis | undefined, eveBit: Bit | undefined;
    if (eve) {                                   // measures in a random basis, then resends what she saw
      eveBasis = basis(rng);
      eveBit = measureOutcome(aliceBit, aliceBasis, eveBasis, rng);
      sentBit = eveBit; sentBasis = eveBasis;
    }
    const bobBit = measureOutcome(sentBit, sentBasis, bobBasis, rng);
    const sifted = aliceBasis === bobBasis;
    rounds.push({ aliceBit, aliceBasis, eveBasis, eveBit, bobBasis, bobBit, sifted, checked: sifted && compareCoins[i], error: sifted && bobBit !== aliceBit });
  }
  return rounds;
}

export type Stats = {
  sent: number; sifted: number; checked: number; errorsInChecked: number;
  /** Estimated error rate from the publicly compared bits (0 if none were compared). */
  qber: number;
  /** Kept bits that were not compared: the raw key. */
  keyBits: number;
  verdict: "no-data" | "ok" | "abort";
};

export function stats(rounds: Round[]): Stats {
  const sifted = rounds.filter((r) => r.sifted), checked = sifted.filter((r) => r.checked);
  const errorsInChecked = checked.filter((r) => r.error).length;
  const qber = checked.length ? errorsInChecked / checked.length : 0;
  return {
    sent: rounds.length, sifted: sifted.length, checked: checked.length, errorsInChecked, qber, keyBits: sifted.length - checked.length,
    verdict: checked.length === 0 ? "no-data" : qber > ABORT_THRESHOLD ? "abort" : "ok",
  };
}

/** Against an eavesdropper who intercepts every qubit, each compared bit shows an error with probability 1/4, so she escapes with (3/4)^k. */
export const chanceUndetected = (comparedBits: number): number => 0.75 ** comparedBits;
