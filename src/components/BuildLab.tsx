"use client";
import { useState } from "react";
import { IDEAS, LAB_SOURCES, PROJECTS, TOOLS } from "@/data/labs";
import CodeBlock from "./CodeBlock";

export default function BuildLab({ scripts }: { scripts: Record<string, string> }) {
  const [active, setActive] = useState(PROJECTS[0].id);
  const p = PROJECTS.find((x) => x.id === active) ?? PROJECTS[0];

  return (
    <div className="mt-6 space-y-8">
      <div role="note" className="rounded-xl border border-amber/40 bg-amber/10 p-4 text-sm text-soft">
        <p><span className="font-semibold text-amber">What we tested, and what we couldn't.</span> Every script was run on local simulators (Qiskit 2.5.2, qiskit-ibm-runtime 0.50.0, Cirq 1.7.0, PennyLane 0.45.1), and the output shown is from those runs.
          We could <em>not</em> sign in to IBM or submit to real hardware, so account setup and hardware steps are flagged “not tested by us”. Quantum SDKs change fast, so check IBM's current docs if something doesn't match.</p>
      </div>

      <section aria-label="Choosing a framework" className="grid gap-3 sm:grid-cols-3">
        {TOOLS.map((t) => (
          <div key={t.name} className="card p-4">
            <h2 className="text-base font-semibold">{t.name} <span className="text-xs font-normal text-muted">· {t.by}</span></h2>
            <p className="mt-1 text-sm text-soft">{t.pick}</p>
          </div>
        ))}
      </section>

      <div role="tablist" aria-label="Projects" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {PROJECTS.map((x, i) => (
          <button key={x.id} role="tab" aria-selected={x.id === active} onClick={() => setActive(x.id)}
            className={`card p-3 text-left transition-colors ${x.id === active ? "!border-accent" : "hover:border-soft"}`}>
            <span className="text-xs text-muted">Lab {i + 1} · {x.level}</span>
            <span className="block text-sm font-semibold">{x.title}</span>
            <span className="mt-1 block text-xs text-soft">{x.tool}</span>
          </button>
        ))}
      </div>

      <section key={p.id} role="tabpanel" aria-label={p.title} className="fade-in space-y-5">
        <div>
          <h2 className="text-2xl font-semibold">{p.title}</h2>
          <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
            <span className="rounded-full border border-accent/50 px-2 py-0.5 text-accent">{p.tool}</span>
            <span className="rounded-full border border-line px-2 py-0.5 text-soft">{p.level}</span>
            <span className="rounded-full border border-line px-2 py-0.5 text-soft">{p.time}</span>
            <span className={`rounded-full border px-2 py-0.5 ${p.needsAccount ? "border-amber/50 text-amber" : "border-teal/50 text-teal"}`}>{p.needsAccount ? "Needs a free IBM account" : "No account needed"}</span>
          </div>
          <p className="mt-3 text-soft">{p.goal}</p>
          <p className="mt-2 text-sm text-soft"><span className="font-semibold text-ink">You'll learn: </span>{p.learn.join(" · ")}</p>
        </div>

        <ol className="space-y-4">
          {p.steps.map((s, i) => (
            <li key={i} className="card p-5">
              <h3 className="flex items-start gap-3 text-lg font-semibold">
                <span className="mono mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-card2 text-sm text-accent">{i + 1}</span>
                <span>{s.title}</span>
              </h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-soft">{s.text}</p>
              {s.code && <div className="mt-3"><CodeBlock code={s.code} label={s.title} /></div>}
              {s.expected && (
                <div className="mt-3">
                  <p className="mb-1 text-xs text-muted">Example output from our local run (yours will differ slightly: results are random samples):</p>
                  <pre className="mono overflow-x-auto rounded-xl border border-teal/30 bg-teal/5 p-3 text-[0.8rem] leading-relaxed" tabIndex={0}>{s.expected}</pre>
                </div>
              )}
              {s.untested && <p className="mt-3 text-sm text-amber"><span className="font-semibold">Not tested by us: </span>{s.untested}</p>}
            </li>
          ))}
        </ol>

        <details className="card p-4">
          <summary className="cursor-pointer font-semibold">Full starter script: <span className="mono text-sm font-normal text-soft">labs/{p.script}</span></summary>
          <div className="mt-3"><CodeBlock code={scripts[p.script] ?? ""} label={p.script} /></div>
        </details>

        <div className="card border-amber/30 p-4">
          <h3 className="font-semibold text-amber">Honest limits</h3>
          <p className="mt-1 text-sm text-soft">{p.honest}</p>
        </div>
        <div>
          <h3 className="font-semibold">Extend it</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-soft">{p.extend.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">More project ideas</h2>
        <p className="mt-1 text-sm text-soft">No starter code yet, but each is a real portfolio piece.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {IDEAS.map((i) => <div key={i.title} className="card p-4"><h3 className="text-base font-semibold">{i.title}</h3><p className="mt-1 text-sm text-soft">{i.text}</p></div>)}
        </div>
      </section>

      <section className="card p-4">
        <h2 className="text-sm font-semibold">Sources</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-soft">
          {LAB_SOURCES.map((s) => <li key={s.url}><a className="text-accent underline underline-offset-2" href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></li>)}
        </ul>
        <p className="mt-2 text-xs text-muted">These links were machine-checked on 2026-10-08; see the README.</p>
      </section>
    </div>
  );
}
