/** Pure star-field logic (no DOM) so the layout and shimmer can be unit-tested. */

export type StarTone = "white" | "blue" | "warm";
export type Star = {
  x: number; y: number;      // normalized 0..1 position
  r: number;                 // radius in CSS px
  a: number;                 // peak brightness 0..1
  speed: number;             // twinkle cycles per second
  phase: number;             // radians
  depth: number;             // 0..1, how strongly it drifts with scroll (parallax)
  tone: StarTone;
  flare: boolean;            // a few bright stars get a soft glow and tiny diffraction spikes
};

export const TONE_RGB: Record<StarTone, [number, number, number]> = {
  white: [255, 255, 255],
  blue: [172, 204, 255],
  warm: [255, 214, 170],
};

/** Small, fast, seedable PRNG so the sky looks the same on every visit and on resize. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fewer stars on small screens (battery and calm); capped on big ones. */
export function starCount(width: number, height: number): number {
  return Math.max(70, Math.min(240, Math.round((width * height) / 7500)));
}

/**
 * Every star consumes the same number of random draws, so the first N stars are identical
 * whatever N is. That keeps the sky stable when the window resizes.
 */
export function makeStars(count: number, seed = 20261008): Star[] {
  const rnd = mulberry32(seed);
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    const [x, y, size, bright, speed, phase, depth, toneRoll] = [rnd(), rnd(), rnd(), rnd(), rnd(), rnd(), rnd(), rnd()];
    const flare = i % 40 === 7; // deterministic handful of bright stars
    stars.push({
      x, y,
      r: flare ? 1.3 + size * 0.5 : 0.35 + size * size * 0.9,
      a: flare ? 0.95 : 0.22 + bright * 0.68,
      speed: 0.12 + speed * 0.7,
      phase: phase * Math.PI * 2,
      depth: 0.15 + depth * 0.85,
      tone: toneRoll < 0.7 ? "white" : toneRoll < 0.88 ? "blue" : "warm",
      flare,
    });
  }
  return stars;
}

/** Brightness at time t (seconds): mostly steady with a gentle shimmer, never fully off. */
export function twinkle(star: Star, t: number): number {
  const wave = Math.sin(t * star.speed * Math.PI * 2 + star.phase); // -1..1
  return Math.min(1, Math.max(0, star.a * (0.72 + 0.28 * wave)));
}

/** Vertical position in px with a slow parallax drift as the page scrolls, wrapped to the viewport. */
export function starY(star: Star, scrollY: number, height: number): number {
  const raw = star.y * height - scrollY * 0.06 * star.depth;
  return ((raw % height) + height) % height;
}
