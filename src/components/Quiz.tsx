"use client";
import { useState } from "react";
import type { Stage } from "@/data/stages";
import { questionsFor, showHints } from "@/lib/levels";
import type { Level, PlayStyle } from "@/lib/prefs";

type Props = {
  stage: Stage; level: Level; style: PlayStyle;
  best?: number; bonusBest?: number;
  /** baseScore is out of the 4 core questions; bonusScore (experts only) out of the 2 bonus questions. */
  onFinish: (baseScore: number, bonusScore: number | undefined) => void;
};

export default function Quiz({ stage, level, style, best, bonusBest, onFinish }: Props) {
  const questions = questionsFor(stage, level);
  const base = questions.filter((q) => !q.expert);
  const bonus = questions.filter((q) => q.expert);
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [hints, setHints] = useState<Record<number, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const hintsOn = showHints(level, style);

  const baseScore = answers.slice(0, base.length).filter((a, i) => a === base[i].answer).length;
  const bonusScore = answers.slice(base.length).filter((a, i) => a === bonus[i].answer).length;
  const allAnswered = answers.every((a) => a !== null);

  const submit = () => { setSubmitted(true); onFinish(baseScore, bonus.length ? bonusScore : undefined); };
  const retry = () => { setAnswers(questions.map(() => null)); setHints({}); setSubmitted(false); };

  return (
    <section className="card mt-6 p-5" aria-labelledby={`quiz-${stage.id}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 id={`quiz-${stage.id}`} className="text-lg font-semibold">Stage {stage.n} quiz</h3>
        <span className="text-xs text-muted">
          {best !== undefined && <>Best: {best}/{base.length}</>}
          {bonusBest !== undefined && <> · expert bonus {bonusBest}/{bonus.length || 2}</>}
        </span>
      </div>
      <ol className="mt-4 space-y-5">
        {questions.map((q, qi) => (
          <li key={qi}>
            <fieldset>
              <legend className="font-medium">
                {q.expert && <span className="mr-2 rounded-full border border-violet/50 px-2 py-0.5 text-xs font-medium text-violet">Expert bonus</span>}
                {qi + 1}. {q.q}
              </legend>
              <div className="mt-2 space-y-2">
                {q.options.map((o, oi) => {
                  const chosen = answers[qi] === oi;
                  const correct = submitted && oi === q.answer;
                  const wrong = submitted && chosen && oi !== q.answer;
                  return (
                    <label key={oi} className={`flex cursor-pointer items-start gap-2 rounded-lg border p-2.5 text-sm transition-colors ${correct ? "border-teal bg-teal/10" : wrong ? "border-rose bg-rose/10" : chosen ? "border-accent" : "border-line hover:border-soft"}`}>
                      <input
                        type="radio" name={`${stage.id}-${qi}`} disabled={submitted} checked={chosen}
                        onChange={() => setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)))}
                        className="mt-0.5 accent-[var(--accent)]"
                      />
                      <span>{o}{correct && <span className="sr-only"> (correct answer)</span>}{wrong && <span className="sr-only"> (your answer, incorrect)</span>}</span>
                    </label>
                  );
                })}
              </div>
              {hintsOn && q.hint && !submitted && (
                hints[qi]
                  ? <p className="fade-in mt-2 rounded-lg border border-amber/40 bg-amber/10 p-2 text-sm text-soft"><span className="font-semibold text-amber">Hint: </span>{q.hint}</p>
                  : <button type="button" className="mt-2 text-sm text-amber underline underline-offset-2" onClick={() => setHints((h) => ({ ...h, [qi]: true }))}>Need a hint?</button>
              )}
              {submitted && <p className="fade-in mt-2 text-sm text-soft"><span className="font-semibold text-ink">Why: </span>{q.why}</p>}
            </fieldset>
          </li>
        ))}
      </ol>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {!submitted ? (
          <button className="btn btn-primary" disabled={!allAnswered} onClick={submit} style={{ opacity: allAnswered ? 1 : 0.5 }}>Check answers</button>
        ) : (
          <>
            <span className="font-semibold" role="status">Score: {baseScore}/{base.length}{bonus.length > 0 && <span className="ml-2 text-violet">Expert bonus: {bonusScore}/{bonus.length}</span>}</span>
            <button className="btn" onClick={retry}>Try again</button>
          </>
        )}
      </div>
    </section>
  );
}
