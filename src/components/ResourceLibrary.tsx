"use client";
import { useMemo, useState } from "react";
import {
  COST_LABEL, FORMAT_LABEL, LEVEL_LABEL, RESOURCES,
  type Cost, type Format, type Level, type Resource,
} from "@/data/resources";
import { NO_FILTERS, filterResources, type Filters } from "@/lib/resources";

const FORMATS = Object.keys(FORMAT_LABEL) as Format[];
const LEVELS = Object.keys(LEVEL_LABEL) as Level[];
const COSTS: (Cost | "all")[] = ["all", "free", "paid"];

function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

function LinkStatus({ r }: { r: Resource }) {
  if (r.verified) return <span className="text-xs text-teal">✓ Link checked {r.verified}</span>;
  return (
    <span className="text-xs text-amber" title={r.urlBasis === "search" ? "This URL appeared in web search results but has not been opened to confirm it loads." : "This URL was recalled from memory and could not be confirmed by search."}>
      ⚠ Link unverified · {r.urlBasis === "search" ? "seen in search" : "from memory"}
    </span>
  );
}

export default function ResourceLibrary() {
  const [f, setF] = useState<Filters>(NO_FILTERS);
  const items = useMemo(() => filterResources(RESOURCES, f), [f]);
  const active = f.formats.length + f.levels.length + (f.cost !== "all" ? 1 : 0) + (f.query ? 1 : 0);

  return (
    <div className="mt-6">
      <div role="note" className="rounded-xl border border-amber/40 bg-amber/10 p-3 text-sm text-soft">
        <span className="font-semibold text-amber">Heads up:</span> these links haven't been verified yet. Each card says whether its URL appeared in search results or was recalled from memory.
        If one is broken, it's a bug in our list, not a sign the resource is gone.
      </div>

      <div className="card mt-5 space-y-4 p-4">
        <label className="block text-sm">
          <span className="text-soft">Search</span>
          <input
            type="search" value={f.query} onChange={(e) => setF({ ...f, query: e.target.value })} placeholder="e.g. Grover, error correction, podcast…"
            className="mt-1 w-full rounded-lg border border-line bg-card2 px-3 py-2 text-ink placeholder:text-muted"
          />
        </label>
        <fieldset>
          <legend className="mb-1.5 text-sm text-soft">Format</legend>
          <div className="flex flex-wrap gap-2">
            {FORMATS.map((x) => <button key={x} className="btn" aria-pressed={f.formats.includes(x)} onClick={() => setF({ ...f, formats: toggle(f.formats, x) })}>{FORMAT_LABEL[x]}</button>)}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <fieldset>
            <legend className="mb-1.5 text-sm text-soft">Level</legend>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((x) => <button key={x} className="btn" aria-pressed={f.levels.includes(x)} onClick={() => setF({ ...f, levels: toggle(f.levels, x) })}>{LEVEL_LABEL[x]}</button>)}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-1.5 text-sm text-soft">Cost</legend>
            <div className="flex flex-wrap gap-2">
              {COSTS.map((x) => <button key={x} className="btn" aria-pressed={f.cost === x} onClick={() => setF({ ...f, cost: x })}>{x === "all" ? "Any" : COST_LABEL[x]}</button>)}
            </div>
          </fieldset>
        </div>
        <div className="flex items-center justify-between text-sm text-muted">
          <span role="status">Showing {items.length} of {RESOURCES.length}</span>
          {active > 0 && <button className="underline underline-offset-2 hover:text-ink" onClick={() => setF(NO_FILTERS)}>Clear filters</button>}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="card mt-6 p-6 text-center text-soft">Nothing matches those filters. Try clearing one.</p>
      ) : (
        <ul className="mt-6 grid items-start gap-4 sm:grid-cols-2">
          {items.map((r) => (
            <li key={r.id} className="card fade-in flex flex-col p-5">
              <div className="flex flex-wrap gap-1.5 text-xs">
                <span className="rounded-full border border-accent/50 px-2 py-0.5 text-accent">{FORMAT_LABEL[r.format]}</span>
                <span className="rounded-full border border-line px-2 py-0.5 text-soft">{LEVEL_LABEL[r.level]}</span>
                <span className={`rounded-full border px-2 py-0.5 ${r.cost === "free" ? "border-teal/50 text-teal" : "border-violet/50 text-violet"}`}>{COST_LABEL[r.cost]}</span>
              </div>
              <h2 className="mt-3 text-lg leading-snug font-semibold">{r.title}</h2>
              <p className="text-sm text-muted">{r.creator}</p>
              <p className="mt-3 text-sm text-soft">{r.blurb}</p>
              <p className="mt-2 text-sm"><span className="font-semibold">Best for: </span><span className="text-soft">{r.bestFor}</span></p>
              {r.caveat && <p className="mt-2 text-sm"><span className="font-semibold text-amber">Note: </span><span className="text-soft">{r.caveat}</span></p>}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a className="btn btn-primary" href={r.url} target="_blank" rel="noopener noreferrer">Open resource ↗<span className="sr-only"> ({r.title}, opens in a new tab)</span></a>
                <LinkStatus r={r} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
