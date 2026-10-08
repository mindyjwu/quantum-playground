"use client";
import { useState } from "react";
import { HYPE_CHECK } from "@/data/think-bigger";

type Answer = "yes" | "no" | "unsure";
const LABEL: Record<Answer, string> = { yes: "Yes", no: "No", unsure: "Don't know" };

export default function HypeCheck() {
  const [a, setA] = useState<Record<string, Answer>>({});
  const answered = Object.keys(a).length;
  const todo = HYPE_CHECK.filter((q) => a[q.id] !== "yes");

  return (
    <div className="card p-5">
      <ol className="space-y-5">
        {HYPE_CHECK.map((q, i) => (
          <li key={q.id}>
            <fieldset>
              <legend className="font-medium">{i + 1}. {q.q}</legend>
              <div className="mt-2 flex flex-wrap gap-2" role="radiogroup">
                {(Object.keys(LABEL) as Answer[]).map((k) => (
                  <button key={k} role="radio" aria-checked={a[q.id] === k} className="btn !min-h-9"
                    onClick={() => setA((prev) => ({ ...prev, [q.id]: k }))}>{LABEL[k]}</button>
                ))}
              </div>
              {a[q.id] && a[q.id] !== "yes" && <p className="fade-in mt-2 text-sm text-soft"><span className="font-semibold text-amber">Why it matters: </span>{q.why}</p>}
            </fieldset>
          </li>
        ))}
      </ol>
      <div className="mt-5 border-t border-line pt-4 text-sm" role="status">
        {answered < HYPE_CHECK.length ? (
          <p className="text-muted">{answered} of {HYPE_CHECK.length} answered. This is a thinking tool, not a score.</p>
        ) : todo.length === 0 ? (
          <p className="text-soft"><span className="font-semibold text-teal">Every question answered “yes”.</span> That's a strong sign, but make sure each “yes” is backed by a source, not a feeling.</p>
        ) : (
          <div className="text-soft">
            <p><span className="font-semibold text-amber">{todo.length} open question{todo.length > 1 ? "s" : ""}.</span> Not a verdict on the idea, just your homework before you bet time or money on it:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">{todo.map((q) => <li key={q.id}>{q.q}</li>)}</ul>
          </div>
        )}
        {answered > 0 && <button className="mt-3 underline underline-offset-2 text-muted hover:text-ink" onClick={() => setA({})}>Start over</button>}
      </div>
    </div>
  );
}
