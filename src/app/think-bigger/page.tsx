import Link from "next/link";
import GoalsNotes from "@/components/GoalsNotes";
import HypeCheck from "@/components/HypeCheck";
import { FACTS, HORIZON, KIND_META, LANES, PATHS, THINK_SOURCES, type ClaimKind } from "@/data/think-bigger";

export const metadata = { title: "Think Bigger · Quantum Playground" };

const KIND_STYLE: Record<ClaimKind, string> = {
  scheduled: "border-teal/50 text-teal",
  "vendor-target": "border-amber/50 text-amber",
  forecast: "border-violet/50 text-violet",
  reported: "border-line text-soft",
};

function Tag({ kind }: { kind: ClaimKind }) {
  return <span title={KIND_META[kind].hint} className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${KIND_STYLE[kind]}`}>{KIND_META[kind].label}</span>;
}

const Links = ({ items }: { items: { label: string; url: string }[] }) => (
  <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs text-soft">
    {items.map((s) => <li key={s.url}><a className="text-accent underline underline-offset-2" href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></li>)}
  </ul>
);

export default function Page() {
  return (
    <div className="fade-in space-y-14">
      <header>
        <p className="mb-3 text-sm font-medium tracking-wide text-teal uppercase">Be early · be useful · be honest</p>
        <h1 className="max-w-3xl text-3xl leading-tight font-semibold sm:text-5xl">Think bigger, with your eyes open.</h1>
        <p className="mt-4 max-w-2xl text-lg text-soft">
          This field will reward people who combine ambition with rigor. The money is real, the deadlines are real, and the physics is real,
          but so are the hype, the missed timelines and the open questions. The opportunity belongs to the people who can tell them apart.
        </p>
        <div className="mt-5 max-w-2xl rounded-xl border border-teal/40 bg-teal/10 p-4 text-sm text-soft">
          <p><span className="font-semibold text-teal">Doubting whether you belong here?</span> You don't need a physics PhD to be useful. Post-quantum migration is mostly inventory,
            architecture and change management, and honest application studies need people who know a domain and can read a benchmark. A tech-consulting and data background is an asset in
            both. That's our view, so test it by shipping something small.</p>
        </div>
      </header>

      <section aria-labelledby="state">
        <h2 id="state" className="text-2xl font-semibold">The state of play</h2>
        <p className="mt-1 max-w-2xl text-soft">Four facts that frame everything else, each labeled by what kind of claim it is. Hover a label for its meaning.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {FACTS.map((f) => (
            <article key={f.id} className="card flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="mono text-2xl text-accent">{f.big}</p><Tag kind={f.kind} />
              </div>
              <h3 className="mt-2 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-soft">{f.text}</p>
              <p className="mt-2 text-sm"><span className="font-semibold text-amber">Caveat: </span><span className="text-soft">{f.caveat}</span></p>
              <Links items={f.sources} />
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="heading">
        <h2 id="heading" className="text-2xl font-semibold">Where it's heading</h2>
        <p className="mt-1 max-w-2xl text-soft">Dates from regulators are firmer than dates from vendors, and both are firmer than forecasts. We've labeled every entry so you can see which is which.</p>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {HORIZON.map((h) => (
            <div key={h.span} className="card p-5">
              <h3 className="text-lg font-semibold">{h.span}</h3>
              <ul className="mt-3 space-y-3">
                {h.items.map((i) => (
                  <li key={i.when + i.what} className="text-sm">
                    <div className="flex items-center gap-2"><span className="mono font-semibold">{i.when}</span><Tag kind={i.kind} /></div>
                    <p className="mt-1 text-soft">{i.what}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">Note how the firmest dates are about cryptography migration. That's why it's listed first below.</p>
      </section>

      <section aria-labelledby="lanes">
        <h2 id="lanes" className="text-2xl font-semibold">Where the opportunities are</h2>
        <p className="mt-1 max-w-2xl text-soft">Three lanes, ordered from nearest to revenue to highest hype risk. Each has the case for it, what you could build, what could go wrong, and a 30-day first move.</p>
        <div className="mt-5 space-y-5">
          {LANES.map((l, idx) => (
            <article key={l.id} className="card p-5 sm:p-6">
              <p className="text-xs text-muted">Lane {idx + 1} · {l.stage}</p>
              <h3 className="mt-0.5 text-xl font-semibold">{l.title}</h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-soft">{l.why}</p>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div><h4 className="text-sm font-semibold text-teal">What you could build</h4><ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-soft">{l.build.map((b) => <li key={b}>{b}</li>)}</ul></div>
                <div><h4 className="text-sm font-semibold text-amber">What could go wrong</h4><ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-soft">{l.risks.map((b) => <li key={b}>{b}</li>)}</ul></div>
                <div><h4 className="text-sm font-semibold text-accent">Your first 30 days</h4><ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-soft">{l.first30.map((b) => <li key={b}>{b}</li>)}</ul></div>
              </div>
              <details className="mt-4 text-sm"><summary className="cursor-pointer text-muted">Sources for this lane</summary><Links items={l.sources} /></details>
            </article>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted">Also worth watching: quantum sensing has commercial niches today (see <Link className="text-accent underline underline-offset-2" href="/real-world">Real World</Link>), and the talent gap is real but the figures we found are from 2022, so treat them as dated.</p>
      </section>

      <section aria-labelledby="paths">
        <h2 id="paths" className="text-2xl font-semibold">Four ways in</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {PATHS.map((p) => (
            <article key={p.title} className="card p-5">
              <h3 className="text-lg font-semibold">{p.title}</h3>
              <p className="mt-1 text-sm text-soft">{p.blurb}</p>
              <p className="mt-2 text-sm"><span className="font-semibold text-accent">Next step: </span><span className="text-soft">{p.next}</span></p>
            </article>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">These paths are our suggestions, not findings. Your mix will probably look different.</p>
      </section>

      <section aria-labelledby="hype">
        <h2 id="hype" className="text-2xl font-semibold">Stress-test any quantum claim or idea</h2>
        <p className="mt-1 mb-5 max-w-2xl text-soft">Six questions to ask before you believe a headline, join a startup or bet your own time. Answer for a specific claim.</p>
        <HypeCheck />
      </section>

      <section aria-labelledby="goals">
        <h2 id="goals" className="text-2xl font-semibold">My quantum goals</h2>
        <p className="mt-1 mb-5 max-w-2xl text-soft">Ambition needs a paper trail. Write down why you're here and what you'll try next. This stays on your device.</p>
        <GoalsNotes />
      </section>

      <section className="card p-4" aria-label="Sources">
        <h2 className="text-sm font-semibold">More sources</h2>
        <Links items={THINK_SOURCES} />
        <p className="mt-2 text-xs text-muted">Figures marked “secondary” come from press or vendor explainers, not the primary documents. Links haven't all been machine-verified (see the README).</p>
      </section>
    </div>
  );
}
