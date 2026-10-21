/**
 * Content for "Mindy's Space" (/mindy). Edit this file to update the page: it's plain text, no code needed.
 * Everything here is written from things that actually happened while building and using the site.
 * Add a LinkedIn or portfolio link by adding an entry to LINKS (full https:// URL).
 */
export type LogEntry = { when: string; title: string; text: string };

export const INTRO = {
  kicker: "Mindy's Space",
  title: "My quantum lab notebook",
  lead: "I'm a tech consultant with a CS and data science background, exploring quantum computing as a possible study path, career or startup direction, or just for fun. This page is my notebook and portfolio piece. Everything else on the site is built for anyone who wants to learn.",
};

export const WHY: string[] = [
  "I wanted to understand how quantum technology is actually used in the real world today, what's hype and what isn't, and what someone like me could build with it.",
  "So the rules for this project were: fact-check claims, label what's a regulator's deadline versus a vendor's roadmap versus a forecast, don't overstate what quantum computers can do today, and cite sources.",
];

export const BUILT: { label: string; text: string }[] = [
  { label: "How", text: "Designed with Claude Code (Anthropic's coding agent) from my brief, with a lot of back-and-forth on accuracy." },
  { label: "Stack", text: "Next.js and Tailwind, all client-side (no backend), deployed on Vercel. A small quantum simulator written from scratch runs in your browser." },
  { label: "Checked", text: "The simulator, the circuit puzzles and the site content have automated tests. Every puzzle's “par” is proven minimal by exhaustive search. Source links are machine-checked." },
  { label: "Not yet", text: "The real-IBM-hardware step of Build Lab hasn't been run by me yet, so it's marked “not tested”. I'll update this page when I've done it." },
];

/** Newest first. Dates are month-level on purpose. */
export const LOG: LogEntry[] = [
  { when: "Oct 2026", title: "Put the site online", text: "Deployed the first version to Vercel, then added levels (beginner, intermediate, expert), circuit puzzles and a progress constellation so more people can learn something from it." },
  { when: "Oct 2026", title: "Ran all four labs on my own laptop", text: "The Bell-test (CHSH) lab gave S = 2.88 on the ideal simulator. That is slightly above the theoretical maximum of 2.83, which turned out to be ordinary shot noise (about ±0.03 at 4,000 shots), and a good reminder that finite samples wobble. The noisy simulated chip gave 2.63, still above the classical limit of 2." },
  { when: "Oct 2026", title: "Learned why “No matching distribution found for qiskit” happens", text: "macOS ships Python 3.9, and Cirq and PennyLane need 3.11 or newer (Qiskit needs 3.10+). Installing Python 3.12 fixed it. Now it's in the setup instructions." },
  { when: "Oct 2026", title: "Checked every source link", text: "53 of 54 links loaded. The last was a publisher that blocks automated checks, so the checker now reports that as a warning instead of a failure." },
];

export const NEXT: string[] = [
  "Run Lab 1 on a real IBM quantum computer and write up what's different from the simulator.",
  "Try the CHSH test on hardware and see how much of the quantum advantage noise eats.",
  "Pick one of the three opportunity lanes in Think Bigger and test it with five real conversations.",
];

export const LINKS: { label: string; url: string }[] = [
  { label: "Source code on GitHub", url: "https://github.com/mindyjwu/quantum-playground" },
];
