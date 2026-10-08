# Quantum Playground

Interactive, honest intro to quantum computing. Next.js (App Router) + Tailwind v4, fully client-side — no backend.

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

## Think Bigger
`src/data/think-bigger.ts` holds the content. Every date and figure carries a claim label (`scheduled`, `vendor-target`,
`forecast`, `reported`) so readers can tell a regulator's deadline from a vendor's roadmap or an expert forecast; a unit test
keeps vendor/forecast items from being labeled `scheduled`. Figures we only saw through press coverage are marked secondary.
Time-sensitive facts (funding, NIST/EU/CNSA dates, DARPA QBI stages, expert surveys) were checked in October 2026 and should be
re-checked periodically. "My quantum goals" is stored in `localStorage` (`qp.goals.v1`), is parsed defensively, and can be exported as Markdown.

## Link verification (Resource Library & sources)
Links were assembled in a network-restricted sandbox and are **unverified**; each resource records whether its URL
appeared in search results (`urlBasis: "search"`) or was recalled from memory (`"memory"`).
To verify: run `npm run check-links` on a machine with internet access, fix or remove failures, then set
`verified: "YYYY-MM-DD"` on each passing resource in `src/data/resources.ts`. The UI then swaps the warning for a ✓.
The script also checks the source links in `src/data/stages.ts` and `src/data/realworld.ts`.

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
