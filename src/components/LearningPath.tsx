"use client";
import { useState } from "react";
import Link from "next/link";
import { STAGES, type Stage } from "@/data/stages";
import { LEVEL_EXTRAS } from "@/data/levels";
import { glossaryOn, levelLabel } from "@/lib/prefs";
import { annotateBlocks } from "@/lib/glossary";
import { Segments } from "./GlossaryTerm";
import { usePrefs } from "./PrefsProvider";
import { ProgressBar, overallPercent, stageStats, useProgress } from "./Progress";
import Quiz from "./Quiz";

export default function LearningPath() {
  const [p, setP, ready] = useProgress();
  const { prefs, ready: prefsReady, setPrefs } = usePrefs();
  const level = prefsReady ? prefs.level : "intermediate"; // until preferences load, show the standard lessons
  const style = prefs.style;
  const explain = prefsReady && glossaryOn(prefs); // jargon tooltips
  const [active, setActive] = useState(STAGES[0].id);
  const stage = STAGES.find((s) => s.id === active) as Stage;
  const pct = ready ? overallPercent(p) : 0;

  const toggleLesson = (id: string) => setP((prev) => ({ ...prev, lessons: { ...prev.lessons, [id]: !prev.lessons[id] } }));
  const saveScore = (score: number, bonus: number | undefined) => setP((prev) => ({
    ...prev,
    quiz: { ...prev.quiz, [stage.id]: Math.max(score, prev.quiz[stage.id] ?? 0) },
    ...(bonus !== undefined ? { bonus: { ...(prev.bonus ?? {}), [stage.id]: Math.max(bonus, prev.bonus?.[stage.id] ?? 0) } } : {}),
  }));
  const reset = () => { if (window.confirm("Reset all learning progress on this device?")) setP({ lessons: {}, quiz: {}, bonus: {} }); };

  return (
    <div className="mt-6">
      <div className="card p-4">
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <span className="text-soft">Overall progress</span><span className="font-semibold">{pct}%</span>
        </div>
        <ProgressBar percent={pct} label="Overall progress" />
      </div>

      <div role="tablist" aria-label="Stages" className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STAGES.map((s) => {
          const st = stageStats(p, s.id);
          const selected = s.id === active;
          return (
            <button
              key={s.id} role="tab" aria-selected={selected} onClick={() => setActive(s.id)}
              className={`card p-3 text-left transition-colors ${selected ? "!border-accent" : "hover:border-soft"}`}
            >
              <span className="text-xs text-muted">Stage {s.n}</span>
              <span className="block text-sm font-semibold">{s.title}</span>
              <span className="mt-1 block text-xs text-soft">
                {ready ? `${st.done}/${st.total} lessons${st.score !== undefined ? ` · quiz ${st.score}/${st.quizTotal}` : ""}${st.bonus !== undefined ? ` · bonus ${st.bonus}/2` : ""}` : " "}
                {ready && st.complete ? " ✓" : ""}
              </span>
            </button>
          );
        })}
      </div>

      <section key={stage.id} className="fade-in mt-6" role="tabpanel" aria-label={stage.title}>
        <h2 className="text-2xl font-semibold">Stage {stage.n}: {stage.title}</h2>
        <p className="mt-1 text-soft">{stage.blurb}</p>
        <p className="mt-2 text-xs text-muted" data-testid="viewing-as">Viewing as <span className="font-semibold text-soft">{levelLabel(level)}</span>. Change this any time with the ⚙ button at the top.</p>
        {prefsReady && (
          <label className="mt-2 inline-flex cursor-pointer items-start gap-2 text-sm text-soft">
            <input type="checkbox" checked={explain} onChange={(e) => setPrefs({ glossary: e.target.checked })} className="mt-0.5 h-4 w-4 accent-[var(--accent)]" />
            <span>Explain jargon <span className="block text-xs text-muted sm:ml-1 sm:inline">(tap a dotted word for a plain-English definition)</span></span>
          </label>
        )}

        <div className="mt-5 space-y-4">
          {stage.lessons.map((l) => {
            const done = !!p.lessons[l.id];
            return (
              <article key={l.id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold">{l.title}</h3>
                  <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm text-soft">
                    <input type="checkbox" checked={done} onChange={() => toggleLesson(l.id)} className="h-4 w-4 accent-[var(--accent)]" />
                    Done
                  </label>
                </div>
                {(() => {
                  const x = LEVEL_EXTRAS[l.id];
                  const plain = level === "beginner" && x ? x.plain : [];
                  const segs = explain ? annotateBlocks([...plain, ...l.body]) : null; // each term is marked once per lesson
                  const segPlain = segs ? segs.slice(0, plain.length) : null;
                  const segBody = segs ? segs.slice(plain.length) : null;
                  const full = (
                    <>
                      <div className="mt-2 space-y-3 text-[0.95rem] leading-relaxed text-soft">{l.body.map((b, i) => <p key={i}>{segBody ? <Segments segments={segBody[i]} /> : b}</p>)}</div>
                      {l.math && <pre className="mono mt-3 overflow-x-auto rounded-xl border border-line bg-card2 p-3 text-sm text-ink">{l.math.join("\n")}</pre>}
                    </>
                  );
                  return (
                    <>
                      {level === "beginner" && x ? (
                        <>
                          <div className="mt-3 rounded-xl border border-teal/40 bg-teal/10 p-3">
                            <p className="text-xs font-semibold tracking-wide text-teal uppercase">In plain language</p>
                            {x.plain.map((t, i) => <p key={i} className="mt-1 text-[0.95rem] leading-relaxed text-ink">{segPlain ? <Segments segments={segPlain[i]} /> : t}</p>)}
                          </div>
                          <details className="mt-3 text-sm"><summary className="cursor-pointer text-soft">Read the fuller explanation and the math</summary>{full}</details>
                        </>
                      ) : full}
                      {level === "expert" && x && (
                        <details open className="mt-4 rounded-xl border border-violet/40 bg-violet/5 p-3">
                          <summary className="cursor-pointer font-semibold text-violet">Go deeper: {x.deeper.title}</summary>
                          <div className="mt-2 space-y-2 text-[0.95rem] leading-relaxed text-soft">{x.deeper.body.map((t, i) => <p key={i}>{t}</p>)}</div>
                          {x.deeper.math && <pre className="mono mt-2 overflow-x-auto rounded-lg border border-line bg-card2 p-3 text-sm text-ink">{x.deeper.math.join("\n")}</pre>}
                        </details>
                      )}
                    </>
                  );
                })()}
                {l.tryIt && <Link href={l.tryIt.href} className="btn mt-3">{l.tryIt.label} →</Link>}
              </article>
            );
          })}
        </div>

        <Quiz key={`${stage.id}-${level}-${style}`} stage={stage} level={level} style={style} best={p.quiz[stage.id]} bonusBest={p.bonus?.[stage.id]} onFinish={saveScore} />

        <div className="mt-6 card p-4">
          <h3 className="text-sm font-semibold">Sources for this stage</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-soft">
            {stage.sources.map((s) => (
              <li key={s.url}><a className="text-accent underline underline-offset-2" href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></li>
            ))}
          </ul>
        </div>
      </section>

      <button onClick={reset} className="mt-8 text-sm text-muted underline underline-offset-2 hover:text-ink">Reset progress</button>
    </div>
  );
}
