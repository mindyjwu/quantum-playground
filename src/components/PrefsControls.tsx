"use client";
import { LEVELS, STYLES, type Level, type PlayStyle } from "@/lib/prefs";
import { usePrefs } from "./PrefsProvider";

function Group<T extends string>({ legend, value, options, onPick }: { legend: string; value: T; options: { id: T; label: string; blurb: string }[]; onPick: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-xs font-semibold tracking-wide text-muted uppercase">{legend}</legend>
      <div role="radiogroup" aria-label={legend} className="space-y-1.5">
        {options.map((o) => (
          <button key={o.id} role="radio" aria-checked={value === o.id} onClick={() => onPick(o.id)}
            className={`w-full rounded-lg border p-2.5 text-left transition-colors ${value === o.id ? "border-accent bg-accent/10" : "border-line hover:border-soft"}`}>
            <span className="block text-sm font-semibold">{o.label}</span>
            <span className="block text-xs text-soft">{o.blurb}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** The two choices a visitor can make. Used in the header popover, the mobile menu and the welcome card. */
export default function PrefsControls() {
  const { prefs, setPrefs } = usePrefs();
  return (
    <div className="space-y-4">
      <Group<Level> legend="My level" value={prefs.level} options={LEVELS} onPick={(level) => setPrefs({ level })} />
      <Group<PlayStyle> legend="Play style" value={prefs.style} options={STYLES} onPick={(style) => setPrefs({ style })} />
    </div>
  );
}
