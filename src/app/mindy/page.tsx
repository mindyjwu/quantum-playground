import Link from "next/link";
import { BUILT, INTRO, LINKS, LOG, NEXT, WHY } from "@/data/mindy";

export const metadata = { title: "Mindy's Space", description: "Mindy's quantum lab notebook and portfolio piece: why this site exists, how it was built, and what I'm learning." };

export default function Page() {
  return (
    <div className="fade-in space-y-12">
      <header>
        <p className="mb-3 text-sm font-medium tracking-wide text-teal uppercase">{INTRO.kicker}</p>
        <h1 className="max-w-3xl text-3xl leading-tight font-semibold sm:text-5xl">{INTRO.title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-soft">{INTRO.lead}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-primary">Explore the site</Link>
          {LINKS.map((l) => <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="btn">{l.label} ↗</a>)}
        </div>
      </header>

      <section aria-labelledby="why">
        <h2 id="why" className="text-2xl font-semibold">Why I built this</h2>
        <div className="mt-3 max-w-2xl space-y-3 text-soft">{WHY.map((t) => <p key={t}>{t}</p>)}</div>
      </section>

      <section aria-labelledby="built">
        <h2 id="built" className="text-2xl font-semibold">How it's built</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          {BUILT.map((b) => (
            <div key={b.label} className="card p-4"><dt className="text-sm font-semibold text-accent">{b.label}</dt><dd className="mt-1 text-sm text-soft">{b.text}</dd></div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="log">
        <h2 id="log" className="text-2xl font-semibold">What I'm learning</h2>
        <ol className="mt-4 space-y-4 border-l border-line pl-5">
          {LOG.map((e) => (
            <li key={e.title} className="relative">
              <span aria-hidden="true" className="absolute -left-[1.62rem] top-1.5 h-2.5 w-2.5 rounded-full bg-amber shadow-[0_0_10px_var(--amber)]" />
              <p className="mono text-xs text-muted">{e.when}</p>
              <h3 className="text-lg font-semibold">{e.title}</h3>
              <p className="mt-1 max-w-2xl text-sm text-soft">{e.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="next">
        <h2 id="next" className="text-2xl font-semibold">Next on my list</h2>
        <ul className="mt-3 max-w-2xl list-disc space-y-2 pl-5 text-soft">{NEXT.map((t) => <li key={t}>{t}</li>)}</ul>
      </section>

      <section className="card p-5">
        <h2 className="text-lg font-semibold">Want a notebook of your own?</h2>
        <p className="mt-1 max-w-2xl text-sm text-soft">Think Bigger has a private goals-and-notes space that lives in your browser. Nothing is sent anywhere. And the Learn and Play pages let you pick your own level.</p>
        <Link href="/think-bigger#goals" className="btn mt-3">Open my goals space →</Link>
      </section>
    </div>
  );
}
