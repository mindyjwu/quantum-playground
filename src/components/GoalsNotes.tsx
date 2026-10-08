"use client";
import { useEffect, useState } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { EMPTY_GOALS, GOALS_KEY, addGoal, normalize, removeGoal, setReflection, toMarkdown, toggleGoal, type GoalsState, type Reflections } from "@/lib/goals";

const PROMPTS: { key: keyof Reflections; label: string; hint: string }[] = [
  { key: "why", label: "Why quantum, for me?", hint: "Curiosity, a career move, a company, just for fun? Be honest, because all of them are valid." },
  { key: "next30", label: "What I want to try in the next 30 days", hint: "Small and concrete: run Lab 1, finish Stage 3, interview a client." },
  { key: "skeptical", label: "Bets I'm skeptical of", hint: "Claims you'd want evidence for before believing. Revisit after the hype check." },
];

export default function GoalsNotes() {
  const [raw, setRaw, ready] = useLocalStorage<GoalsState>(GOALS_KEY, EMPTY_GOALS);
  const state = normalize(raw);
  const [text, setText] = useState("");
  const [target, setTarget] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { // brief "Saved" confirmation after changes (not on first load)
    if (!ready) return;
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 1200);
    return () => clearTimeout(t);
  }, [raw, ready]);

  const update = (fn: (s: GoalsState) => GoalsState) => setRaw((prev) => fn(normalize(prev)));
  const md = toMarkdown(state);
  const hasContent = state.goals.length > 0 || Object.values(state.reflections).some((v) => v.trim());

  const copy = async () => {
    try { await navigator.clipboard.writeText(md); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard unavailable */ }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "my-quantum-goals.md" });
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };
  const clearAll = () => { if (window.confirm("Delete all your goals and notes on this device? This can't be undone.")) setRaw(EMPTY_GOALS); };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        {PROMPTS.map((p) => (
          <label key={p.key} className="card block p-4 text-sm">
            <span className="font-semibold">{p.label}</span>
            <span className="mt-0.5 block text-xs text-muted">{p.hint}</span>
            <textarea
              value={state.reflections[p.key]} disabled={!ready} rows={6}
              onChange={(e) => update((s) => setReflection(s, p.key, e.target.value))}
              className="mt-2 w-full resize-y rounded-lg border border-line bg-card2 p-2.5 text-ink"
            />
          </label>
        ))}
      </div>

      <div className="card p-4">
        <h3 className="font-semibold">Goals</h3>
        <form className="mt-3 flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; update((s) => addGoal(s, text, target || undefined)); setText(""); setTarget(""); }}>
          <label className="sr-only" htmlFor="goal-text">New goal</label>
          <input id="goal-text" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Run Lab 1 on real hardware" disabled={!ready}
            className="min-h-10 flex-1 rounded-lg border border-line bg-card2 px-3 text-ink placeholder:text-muted" />
          <label className="sr-only" htmlFor="goal-target">Target date (optional)</label>
          <input id="goal-target" type="date" value={target} onChange={(e) => setTarget(e.target.value)} disabled={!ready} className="min-h-10 rounded-lg border border-line bg-card2 px-3 text-ink" />
          <button className="btn btn-primary" type="submit" disabled={!ready || !text.trim()}>Add goal</button>
        </form>
        {state.goals.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No goals yet. One concrete goal beats ten vague ones.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {state.goals.map((g) => (
              <li key={g.id} className="flex items-start gap-3 rounded-lg border border-line p-2.5">
                <input type="checkbox" checked={g.done} onChange={() => update((s) => toggleGoal(s, g.id))} className="mt-1 h-4 w-4 accent-[var(--accent)]" aria-label={`Mark done: ${g.text}`} />
                <span className={`flex-1 text-sm ${g.done ? "text-muted line-through" : ""}`}>{g.text}{g.target && <span className="ml-2 text-xs text-muted">target {g.target}</span>}</span>
                <button className="text-xs text-muted underline underline-offset-2 hover:text-rose" onClick={() => update((s) => removeGoal(s, g.id))} aria-label={`Delete goal: ${g.text}`}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <label className="card block p-4 text-sm">
        <span className="font-semibold">Free notes</span>
        <textarea value={state.reflections.notes} disabled={!ready} rows={5} onChange={(e) => update((s) => setReflection(s, "notes", e.target.value))}
          className="mt-2 w-full resize-y rounded-lg border border-line bg-card2 p-2.5 text-ink" />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button className="btn" onClick={copy} disabled={!hasContent}>{copied ? "Copied ✓" : "Copy as Markdown"}</button>
        <button className="btn" onClick={download} disabled={!hasContent}>Download .md</button>
        <button className="text-sm text-muted underline underline-offset-2 hover:text-rose" onClick={clearAll} disabled={!hasContent}>Delete everything</button>
        <span role="status" className="ml-auto text-xs text-muted">{saved ? "Saved ✓" : "Autosaves in this browser"}</span>
      </div>
      <p className="text-xs text-muted">Stored only in this browser (localStorage). It isn't sent anywhere, and clearing site data or switching browsers will lose it, so download a copy of anything you care about.</p>
    </div>
  );
}
