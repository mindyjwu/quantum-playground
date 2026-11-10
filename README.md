# Quantum Playground

Interactive, honest intro to quantum computing. Next.js (App Router) + Tailwind v4, fully client-side — no backend.

**Live site: https://quantum-playground-five.vercel.app/**

## Run
```bash
npm install
npm run dev          # http://localhost:3000
npm test             # simulator unit tests (vitest)
npm run typecheck
npm run check-links  # verifies every external source link (needs internet)
```

## Deploy on Vercel
Import this repo in Vercel (framework preset: Next.js). No root-directory setting or environment variables are needed.

## Requirements
Node 20+ for the site. **Python 3.11+ for the labs** (the Python bundled with macOS is too old: `pip` will say
"No matching distribution found for qiskit"). Install a newer Python (python.org or `brew install python@3.12`) and create the venv with it.

## Build Lab scripts
`labs/` holds the starter scripts the Build Lab page displays (the page reads these files at build time, so the site
always shows exactly the tested code). They run on local simulators by default; `--hardware` (labs 1 and 2) targets a real IBM device.
```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r labs/requirements.txt
python labs/test_labs.py     # simulator-only sanity tests (never touches IBM hardware)
```
**Not tested:** IBM account setup and real-hardware submission (no network/account in the authoring environment).
`SamplerV2` is deprecated as of qiskit-ibm-runtime 0.50.0 (replacement: `qiskit_ibm_runtime.executor_sampler.Sampler`,
which worked on the local simulated chip but has not been tried on hardware); see the lab's "Honest limits".

## Levels, play style and puzzles
Visitors choose **Beginner / Intermediate / Expert** and **Cozy / Instrument** (stored in `localStorage` as `qp.prefs.v1`, shared via
`PrefsProvider`). Level changes the Learn page: beginners get plain-language summaries with the math collapsed and quiz hints; experts get
"Go deeper" panels and two bonus questions per stage (scored separately from the core four). All of that content lives in `src/data/levels.ts`.
Style changes tone and presentation (hints, celebration, exact numbers), never what is correct.

`/play` has 12 circuit puzzles (`src/lib/puzzles.ts`). Each puzzle's par is the *true minimum* gate count: `tests/puzzles.test.ts`
re-derives it by exhaustive search, so a puzzle can't ship unsolvable or with a wrong par. Beginner puzzles judge measurement odds;
intermediate and expert puzzles judge the full state including phase. Progress is `qp.puzzles.v1`.

The home page's **constellation** lights one star per completed lesson, quiz or puzzle (31 in total). **Mindy's Space** (`/mindy`) is
written from `src/data/mindy.ts`; edit that file to update it.

## Guided tours and guide page
`/guide` explains the site in plain language (aimed at a curious high-schooler) and lists 7 short guided tours (`src/data/tours.ts`).
A tour opens the right page, outlines one thing in gold, and says what to try (`src/components/Tour.tsx`). Start one from the **Tour**
button in the header (inside the menu on phones), from `/guide`, or with a link: `?tour=<id>` where id is one of
`start` `qubit` `entangle` `noise` `spy` `puzzle` `future`. Each step lists CSS selectors to highlight; the first visible one wins.
`tests/tours.test.ts` checks that every step points at a real page and stays short and formula-free.

## Glossary tooltips
`src/data/glossary.ts` holds ~110 plain-English terms (`match` lists every wording to recognize). On Learn, Real World, Think Bigger and Build Lab each term is underlined the
first time it appears in a block of text (`src/lib/glossary.ts`) and explains itself on tap, click, hover or keyboard (Enter/Space; Escape closes).
It is on by default for beginners and toggleable for everyone (`prefs.glossary`, `null` = follow the level). `/glossary` lists all terms with search.
Words that are also everyday English can be kept out per page with `annotateBlocks(blocks, {exclude})` (e.g. "measurement" on Real World / Think Bigger), or guarded in the term itself with `avoidAfter` / `notFollowedBy` ("a bit like", "noise-cancelling"). Annotating never changes the text: a test joins the segments of every lesson paragraph and compares with the original.
Note: position the popover with `left`, not `transform`; the fade-in animation owns `transform` and would undo a sideways nudge.

## Space theme
Dark mode is the default: a true-black page (`--bg: #000`) with a canvas starfield (`src/components/StarField.tsx`, logic and tests in
`src/lib/stars.ts`) and an "event horizon" glow on the home hero. The sky is deterministic (seeded), capped at 2x pixel density and ~30fps,
pauses when the tab is hidden, and is a still image under `prefers-reduced-motion`. Day mode (the ☀ toggle) turns the stars and glow off
entirely and stops the animation loop. Text colors were checked against WCAG AA on the new black, and hero text was measured against the real
rendered background at widths from 360px to 1440px.

## Think Bigger
`src/data/think-bigger.ts` holds the content. Every date and figure carries a claim label (`scheduled`, `vendor-target`,
`forecast`, `reported`) so readers can tell a regulator's deadline from a vendor's roadmap or an expert forecast; a unit test
keeps vendor/forecast items from being labeled `scheduled`. Figures we only saw through press coverage are marked secondary.
Time-sensitive facts (funding, NIST/EU/CNSA dates, DARPA QBI stages, expert surveys) were checked in October 2026 and should be
re-checked periodically. "My quantum goals" is stored in `localStorage` (`qp.goals.v1`), is parsed defensively, and can be exported as Markdown.

## Link verification (Resource Library & sources)
`npm run check-links` checks every external URL in `src/data/*.ts`. Statuses: `OK`, `WARN` (the site returned 401/403/429, which
usually means it blocks scripts, so open it in a browser) and `FAIL` (404/410/network error). If more than a quarter are blocked, it
exits with code 2 because the run isn't meaningful (offline, proxy, rate limit).
Each resource records where its URL came from (`urlBasis`) and, once checked, `verified: "YYYY-MM-DD"` in `src/data/resources.ts`;
the UI shows a ✓ for verified links. All 12 resources were verified on 2026-10-08 (53 of 54 links OK; the other, a Science DOI,
returned 403 to the script). A passing check means the page loads, not that its content still matches our description.

## Simulators beyond ideal qubits
- **Noise slider** (Circuit builder on `/demos`): `src/lib/density.ts` is an exact density-matrix simulator with depolarizing noise after every gate
  (single-qubit rate = slider/10, two-qubit rate = slider). It shows ideal vs noisy probabilities, fidelity, and "Run 1000 shots". It is a
  teaching model, not a calibrated model of any real device.
- **BB84 key exchange** (`/demos#bb84`): `src/lib/bb84.ts` plays the protocol round by round (seeded: add `?seed=7` to reproduce a run). Simplified on
  purpose: perfect sources/detectors, an intercept-resend spy, no privacy amplification. Compared bits are a random half of the sifted key, so with 64
  qubits a spy still slips by about 9% of the time (measured: 36% at 16 qubits, 17% at 32, 9% at 64, 3% at 128). The UI explains this when it happens.
- Tests: `tests/density.test.ts`, `tests/bb84.test.ts`, `tests/glossary-pages.test.ts`.

## Structure
- `src/lib/quantum.ts` — state-vector simulator (H, X, Z, CNOT, Bloch vectors, sampling). Qubit 0 is the leftmost bit. Tested in `tests/`.
- `src/data/think-bigger.ts` — Think Bigger content. `src/lib/goals.ts` — goals/notes state and Markdown export.
- `src/data/labs.ts` — Build Lab projects/steps. `src/data/resources.ts` — Resource Library.
- `src/data/stages.ts` — Learning Path lessons + quizzes. `src/data/realworld.ts` — Real-World cards.
- `src/components/` — demos (Bloch sphere, measurement, Bell, circuit builder), Learn/Quiz, cards.
- Progress is stored in `localStorage` under `qp.progress.v1`; theme under `qp.theme`.

## Accuracy policy
Claims cite primary sources where possible; vendor roadmaps and contested results are labeled as such, and
timelines where experts disagree are marked uncertain. Items that were time-sensitive when written (NIST IR 8547 draft status,
IBM roadmap dates) should be re-checked periodically. Simulations model ideal, noise-free qubits.
