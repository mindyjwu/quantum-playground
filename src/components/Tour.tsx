"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { TOURS, tourById } from "@/data/tours";

type TourApi = { start: (id: string) => void; openPicker: () => void };
const TourContext = createContext<TourApi>({ start: () => {}, openPicker: () => {} });
export const useTour = () => useContext(TourContext);

const visible = (el: Element) => (el as HTMLElement).getClientRects().length > 0;
const findTarget = (sels?: string[]): Element | null => {
  for (const s of sels ?? []) for (const el of document.querySelectorAll(s)) if (visible(el)) return el;
  return null;
};

/** Guided tours: a picker, then a step card that opens the right page and outlines the thing to look at. */
export function TourProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [run, setRun] = useState<{ id: string; i: number } | null>(null);
  const [picking, setPicking] = useState(false);

  const start = useCallback((id: string) => { if (tourById(id)) { setRun({ id, i: 0 }); setPicking(false); } }, []);
  const openPicker = useCallback(() => { setRun(null); setPicking(true); }, []);
  const close = useCallback(() => { setRun(null); setPicking(false); }, []);
  const api = useMemo(() => ({ start, openPicker }), [start, openPicker]);

  const tour = run ? tourById(run.id) : undefined;
  const step = tour && run ? tour.steps[run.i] : undefined;

  // ?tour=<id> starts a tour straight from a link (e.g. from the guide page).
  useEffect(() => { const id = new URLSearchParams(window.location.search).get("tour"); if (id) start(id); }, [start]);

  // Leave room at the bottom of the page so the card never hides the last thing on it.
  useEffect(() => {
    document.documentElement.classList.toggle("tour-on", !!run);
    return () => document.documentElement.classList.remove("tour-on");
  }, [run]);

  useEffect(() => {
    if (!run && !picking) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [run, picking, close]);

  // Open the step's page, then wait for its target to exist (pages render after navigation) and outline it.
  // Navigate once per step only, so a link you click yourself mid-tour is never undone.
  const pathRef = useRef(path);
  pathRef.current = path;
  useEffect(() => { if (step && pathRef.current !== step.path) router.push(step.path); }, [step, router]);

  useEffect(() => {
    if (!step || path !== step.path) return;
    let el: Element | null = null, tries = 0;
    const look = () => {
      el = findTarget(step.sel);
      if (el) {
        el.classList.add("tour-hl");
        const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        el.scrollIntoView({ block: "start", behavior: calm ? "auto" : "smooth" });
        return;
      }
      if (!step.sel) { window.scrollTo({ top: 0 }); return; }
      if (++tries < 40) timer = window.setTimeout(look, 100);
    };
    let timer = window.setTimeout(look, 50);
    return () => { window.clearTimeout(timer); el?.classList.remove("tour-hl"); };
  }, [step, path]);

  const go = (d: number) => {
    if (!run || !tour) return;
    const n = run.i + d;
    if (n >= tour.steps.length) openPicker(); else setRun({ id: run.id, i: Math.max(0, n) });
  };

  return (
    <TourContext.Provider value={api}>
      {children}
      {picking && (
        <div role="dialog" aria-label="Choose a guided tour" className="tour-card fade-in">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">Choose a guided tour</h2>
            <button className="btn ml-auto !min-h-8 !px-2.5 !py-1 text-xs" onClick={close}>Close</button>
          </div>
          <p className="mt-1 text-xs text-muted">Each tour opens the right page and points at what to click.</p>
          <ul className="mt-3 max-h-[46vh] space-y-1.5 overflow-y-auto pr-1">
            {TOURS.map((t) => (
              <li key={t.id}>
                <button className="card w-full p-2.5 text-left transition-colors hover:border-accent" onClick={() => start(t.id)}>
                  <span className="block text-sm font-semibold">{t.title}</span>
                  <span className="block text-xs text-muted">{t.blurb} · {t.steps.length} steps · about {t.minutes} min</span>
                </button>
              </li>
            ))}
          </ul>
          <Link href="/guide" className="mt-3 inline-block text-xs text-accent underline underline-offset-2" onClick={close}>Read the full guide</Link>
        </div>
      )}
      {tour && step && run && (
        <div role="dialog" aria-label={`Guided tour: ${tour.title}`} className="tour-card fade-in" data-testid="tour-card">
          <div className="flex items-center gap-2 text-xs text-muted">
            <span>{tour.title}</span>
            <span className="ml-auto" data-testid="tour-progress">Step {run.i + 1} of {tour.steps.length}</span>
          </div>
          <div aria-live="polite">
            <h2 className="mt-1 text-base font-semibold">{step.title}</h2>
            <p className="mt-1 text-sm text-soft">{step.text}</p>
            {step.tryIt && <p className="mt-2 text-sm"><span className="font-semibold text-teal">Try it: </span>{step.tryIt}</p>}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn !min-h-9" onClick={() => go(-1)} disabled={run.i === 0}>Back</button>
            <button className="btn btn-primary !min-h-9" onClick={() => go(1)}>{run.i === tour.steps.length - 1 ? "Finish" : "Next"}</button>
            <button className="btn ml-auto !min-h-9" onClick={close}>Exit</button>
          </div>
        </div>
      )}
    </TourContext.Provider>
  );
}

/** A button that opens the tour picker, or starts one tour when given an id. */
export function TourButton({ id, className = "btn", children }: { id?: string; className?: string; children: ReactNode }) {
  const { start, openPicker } = useTour();
  return <button className={className} onClick={() => (id ? start(id) : openPicker())}>{children}</button>;
}
