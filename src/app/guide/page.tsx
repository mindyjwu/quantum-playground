import type { Metadata } from "next";
import Link from "next/link";
import { TourButton } from "@/components/Tour";
import { TOURS } from "@/data/tours";

export const metadata: Metadata = { title: "Guide", description: "How to use Quantum Playground, in plain language, with guided tours." };

const PAGES = [
  { href: "/learn", name: "Learn", what: "Short lessons in four stages, each with a quiz.", get: "The main ideas, in order, in plain language first." },
  { href: "/demos", name: "Demos", what: "Five small simulators you control with buttons and sliders.", get: "A feel for how qubits behave, by trying things." },
  { href: "/play", name: "Play", what: "Puzzles where you build a small circuit to hit a target.", get: "Practice using gates, with stars for neat solutions." },
  { href: "/real-world", name: "Real World", what: "Cards about quantum technology, tagged by how real it is.", get: "A clear view of what works today and what doesn't yet." },
  { href: "/build-lab", name: "Build Lab", what: "Step-by-step coding projects in Python.", get: "A way to run a real circuit yourself. Best once you know some Python." },
  { href: "/resources", name: "Resources", what: "Hand-picked videos, courses, podcasts and books.", get: "Where to go deeper, filtered by level and cost." },
  { href: "/think-bigger", name: "Think Bigger", what: "Where the field is heading, plus a notes space.", get: "Ideas for study, careers and projects, and a place for your goals." },
  { href: "/glossary", name: "Glossary", what: "Every special word on the site, explained.", get: "A quick answer whenever a word stops you." },
];

const WORDS = [
  { w: "Bit", d: "The smallest piece of information in a normal computer: a 0 or a 1." },
  { w: "Qubit", d: "A quantum bit. It can be 0, 1, or a blend of both until you measure it." },
  { w: "Superposition", d: "The blend. A qubit in superposition has a chance of being read as 0 and a chance of being read as 1." },
  { w: "Gate", d: "One simple instruction that changes a qubit, like \"flip it\"." },
  { w: "Circuit", d: "A list of gates, run in order. It is a quantum program." },
  { w: "Measure", d: "To look at a qubit. You get a plain 0 or 1, and the blend is gone." },
  { w: "Entanglement", d: "A link between qubits, so their results match up even though each one is random." },
  { w: "Noise", d: "Small errors from the real world that push qubits off course." },
];

export default function GuidePage() {
  return (
    <div className="fade-in space-y-10">
      <header>
        <p className="mb-2 text-sm font-medium tracking-wide text-teal uppercase">Guide</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">How to use Quantum Playground</h1>
        <p className="mt-3 max-w-2xl text-soft">
          You don't need physics or hard math to start. Pick a tour below and the site will walk you through it:
          it opens the right page, puts a gold outline around what to look at, and tells you what to click.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <TourButton id="start" className="btn btn-primary">Start the 2-minute tour</TourButton>
          <TourButton>See all tours</TourButton>
        </div>
      </header>

      <section aria-labelledby="how">
        <h2 id="how" className="text-2xl font-semibold">How a tour works</h2>
        <ol className="mt-3 grid gap-3 sm:grid-cols-3">
          {[
            ["1", "Press Start", "A small card appears at the bottom of the screen."],
            ["2", "Follow the gold outline", "The card explains one idea and gives you one thing to try."],
            ["3", "Press Next", "Go at your own speed. Back, Exit and the Esc key always work."],
          ].map(([n, t, d]) => (
            <li key={n} className="card p-4">
              <p className="mono text-xs text-muted">Step {n}</p>
              <p className="mt-1 font-semibold">{t}</p>
              <p className="mt-1 text-sm text-soft">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="tours">
        <h2 id="tours" className="text-2xl font-semibold">The tours, in a good order</h2>
        <p className="mt-1 text-sm text-soft">All together they take about {TOURS.reduce((a, t) => a + t.minutes, 0)} minutes. You can stop and come back any time.</p>
        <ol className="mt-4 grid gap-4 sm:grid-cols-2">
          {TOURS.map((t, i) => (
            <li key={t.id} className="card flex flex-col p-5" data-testid={`guide-tour-${t.id}`}>
              <p className="text-xs text-muted">Tour {i + 1} · {t.steps.length} steps · about {t.minutes} min</p>
              <h3 className="mt-1 text-xl font-semibold">{t.title}</h3>
              <p className="mt-1 text-sm text-soft">{t.blurb}</p>
              <p className="mt-3 text-xs font-semibold tracking-wide text-teal uppercase">You will learn</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-soft">{t.learn.map((l) => <li key={l}>{l}</li>)}</ul>
              <div className="mt-4 pt-1"><TourButton id={t.id} className="btn btn-primary">Start this tour</TourButton></div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="pages">
        <h2 id="pages" className="text-2xl font-semibold">What each page is for</h2>
        <div className="mt-4 overflow-x-auto" tabIndex={0} role="region" aria-labelledby="pages">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead className="text-xs text-muted"><tr><th className="py-2 pr-4 font-medium">Page</th><th className="py-2 pr-4 font-medium">What's there</th><th className="py-2 font-medium">What you get</th></tr></thead>
            <tbody>
              {PAGES.map((p) => (
                <tr key={p.href} className="border-t border-line align-top">
                  <th scope="row" className="py-2.5 pr-4 font-semibold whitespace-nowrap"><Link className="text-accent underline underline-offset-2" href={p.href}>{p.name}</Link></th>
                  <td className="py-2.5 pr-4 text-soft">{p.what}</td>
                  <td className="py-2.5 text-soft">{p.get}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="words">
        <h2 id="words" className="text-2xl font-semibold">Eight words to know first</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {WORDS.map((x) => (
            <div key={x.w} className="card p-4">
              <dt className="font-semibold">{x.w}</dt>
              <dd className="mt-1 text-sm text-soft">{x.d}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-sm text-soft">More words are in the <Link className="text-accent underline underline-offset-2" href="/glossary">glossary</Link>.</p>
      </section>

      <section aria-labelledby="faq">
        <h2 id="faq" className="text-2xl font-semibold">Good to know</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-soft">
          <li>Nothing here can break. Every demo has a Reset or Clear button.</li>
          <li>There is no login. Your progress, level and notes stay in this browser only.</li>
          <li>The demos are simulations. They follow the real rules of quantum physics, but real machines are noisier.</li>
          <li>If a page feels too hard or too easy, change your level with the gear button at the top.</li>
        </ul>
      </section>
    </div>
  );
}
