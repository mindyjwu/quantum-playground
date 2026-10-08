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

## Link verification (Resource Library & sources)
Links were assembled in a network-restricted sandbox and are **unverified**; each resource records whether its URL
appeared in search results (`urlBasis: "search"`) or was recalled from memory (`"memory"`).
To verify: run `npm run check-links` on a machine with internet access, fix or remove failures, then set
`verified: "YYYY-MM-DD"` on each passing resource in `src/data/resources.ts`. The UI then swaps the warning for a ✓.
The script also checks the source links in `src/data/stages.ts` and `src/data/realworld.ts`.

## Structure
- `src/lib/quantum.ts` — state-vector simulator (H, X, Z, CNOT, Bloch vectors, sampling). Qubit 0 is the leftmost bit. Tested in `tests/`.
- `src/data/stages.ts` — Learning Path lessons + quizzes. `src/data/realworld.ts` — Real-World cards.
- `src/components/` — demos (Bloch sphere, measurement, Bell, circuit builder), Learn/Quiz, cards.
- Progress is stored in `localStorage` under `qp.progress.v1`; theme under `qp.theme`.

## Accuracy policy
Claims cite primary sources where possible; vendor roadmaps and contested results are labeled as such, and
timelines where experts disagree are marked uncertain. Items that were time-sensitive when written (NIST IR 8547 draft status,
IBM roadmap dates) should be re-checked periodically. Simulations model ideal, noise-free qubits.
