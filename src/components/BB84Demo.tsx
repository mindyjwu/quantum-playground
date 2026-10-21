"use client";
import { useEffect, useMemo, useState } from "react";
import { ABORT_THRESHOLD, chanceUndetected, runBB84, stats, type Round } from "@/lib/bb84";
import { mulberry32 } from "@/lib/stars";
import { pct } from "@/lib/format";

const STEPS = ["Alice sends", "Bob measures", "Compare bases", "Check for a spy"];
const SIZES = [16, 32, 64];

const bitCell = (b: number | undefined) => <span className="mono">{b === undefined ? "·" : b}</span>;
/** Z = measure as 0 or 1; X = measure as + or −. */
const basisCell = (b: string | undefined) => <span className="mono text-soft">{b ?? "·"}</span>;

export default function BB84Demo() {
  const [n, setN] = useState(32);
  const [eve, setEve] = useState(false);
  const [step, setStep] = useState(1);
  const [seed, setSeed] = useState<number | null>(null);

  // A random run each visit; `?seed=123` reproduces a specific one.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("seed");
    setSeed(q && /^\d{1,9}$/.test(q) ? Number(q) : Math.floor(Math.random() * 2 ** 30));
  }, []);

  const rounds = useMemo<Round[]>(() => (seed === null ? [] : runBB84(n, eve, mulberry32(seed))), [n, eve, seed]);
  const s = useMemo(() => stats(rounds), [rounds]);
  const mismatchedKey = rounds.filter((r) => r.sifted && !r.checked && r.error).length;

  const newRun = () => { setSeed(Math.floor(Math.random() * 2 ** 30)); setStep(1); };

  return (
    <div className="space-y-5">
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <div className="flex items-center gap-2" role="group" aria-label="Number of qubits">
            <span className="text-sm text-soft">Qubits sent:</span>
            {SIZES.map((k) => <button key={k} className="btn" aria-pressed={n === k} onClick={() => { setN(k); setStep(1); }}>{k}</button>)}
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={eve} onChange={(e) => { setEve(e.target.checked); setStep(1); }} className="h-4 w-4 accent-[var(--rose)]" />
            <span><span className="font-semibold text-rose">Eve</span> intercepts every qubit</span>
          </label>
          <button className="btn ml-auto" onClick={newRun}>New random run</button>
        </div>
        <ol className="mt-4 flex flex-wrap gap-2" aria-label="Protocol steps">
          {STEPS.map((label, i) => (
            <li key={label}>
              <button className="btn !min-h-9" aria-current={step === i + 1 ? "step" : undefined} aria-pressed={step === i + 1} onClick={() => setStep(i + 1)}>{i + 1}. {label}</button>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm text-soft" role="status">
          {step === 1 && "Alice picks a random bit and a random basis for each qubit and sends it. Basis Z means “0 or 1”; basis X means “+ or −”. Only she knows her choices."}
          {step === 2 && (eve ? "Eve measures each qubit in a basis she guesses, then sends a fresh qubit on to Bob. Bob measures in a basis he picks at random. (Alice and Bob can't see Eve's columns, so they're shown here only for teaching.)" : "Bob measures each qubit in a basis he picks at random. When his basis differs from Alice's, his result is a coin flip.")}
          {step === 3 && "Over an open channel, Alice and Bob announce their bases (not their bits) and keep only the rounds where the bases matched. About half survive."}
          {step === 4 && "They publicly compare a random half of the kept bits. With no one listening those always agree. A spy leaves errors behind."}
        </p>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="max-h-[22rem] overflow-auto" tabIndex={0} aria-label="BB84 round-by-round table (scrollable)">
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <caption className="sr-only">Each row is one qubit: Alice's bit and basis, optionally Eve's, Bob's basis and result, and what happens to it.</caption>
            <thead className="sticky top-0 bg-card2 text-xs text-muted">
              <tr>
                <th className="px-2 py-2 text-left font-medium">#</th>
                <th className="px-2 py-2 text-left font-medium">Alice bit</th><th className="px-2 py-2 text-left font-medium">Alice basis</th>
                {eve && step >= 2 && <><th className="px-2 py-2 text-left font-medium text-rose">Eve basis</th><th className="px-2 py-2 text-left font-medium text-rose">Eve saw</th></>}
                {step >= 2 && <><th className="px-2 py-2 text-left font-medium">Bob basis</th><th className="px-2 py-2 text-left font-medium">Bob got</th></>}
                {step >= 3 && <th className="px-2 py-2 text-left font-medium">Same basis?</th>}
                {step >= 4 && <th className="px-2 py-2 text-left font-medium">Compared</th>}
              </tr>
            </thead>
            <tbody>
              {rounds.map((r, i) => {
                const dim = step >= 3 && !r.sifted;
                return (
                  <tr key={i} className={`border-t border-line ${dim ? "opacity-40" : ""} ${step >= 4 && r.checked && r.error ? "bg-rose/10" : ""}`}>
                    <td className="mono px-2 py-1 text-muted">{i + 1}</td>
                    <td className="px-2 py-1">{bitCell(r.aliceBit)}</td><td className="px-2 py-1">{basisCell(r.aliceBasis)}</td>
                    {eve && step >= 2 && <><td className="px-2 py-1 text-rose">{basisCell(r.eveBasis)}</td><td className="px-2 py-1 text-rose">{bitCell(r.eveBit)}</td></>}
                    {step >= 2 && <><td className="px-2 py-1">{basisCell(r.bobBasis)}</td><td className="px-2 py-1">{bitCell(r.bobBit)}</td></>}
                    {step >= 3 && <td className="px-2 py-1">{r.sifted ? <span className="text-teal">✓ keep</span> : <span className="text-muted">✗ discard</span>}</td>}
                    {step >= 4 && <td className="px-2 py-1">{!r.sifted ? "" : r.checked ? (r.error ? <span className="font-semibold text-rose">✗ mismatch</span> : <span className="text-teal">✓ agree</span>) : <span className="text-muted">key bit</span>}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {step >= 3 && (
        <div className="grid gap-3 sm:grid-cols-3" data-testid="bb84-summary">
          <div className="card p-3"><p className="text-xs text-muted">Kept after comparing bases</p><p className="mono text-xl">{s.sifted} <span className="text-sm text-muted">of {s.sent}</span></p></div>
          {step >= 4 && <div className="card p-3"><p className="text-xs text-muted">Compared in public</p><p className="mono text-xl">{s.checked} <span className="text-sm text-muted">bits</span></p></div>}
          {step >= 4 && <div className="card p-3"><p className="text-xs text-muted">Error rate in those bits</p><p className="mono text-xl" data-testid="bb84-qber">{s.checked ? pct(s.qber) : "n/a"}</p></div>}
        </div>
      )}

      {step >= 4 && (
        <div role="status" className={`card p-4 text-sm ${s.verdict === "abort" ? "!border-rose/60" : s.verdict === "ok" && eve ? "!border-amber/60" : "!border-teal/50"}`} data-testid="bb84-verdict">
          {s.verdict === "abort" && <>
            <p className="font-semibold text-rose">✗ Spy detected. The error rate {pct(s.qber)} is above about {Math.round(ABORT_THRESHOLD * 100)}%, so Alice and Bob throw this key away.</p>
            <p className="mt-1 text-soft">Eve guesses the wrong basis half the time, and each wrong guess scrambles the qubit, so about one kept bit in four disagrees. If they had used the {s.keyBits} remaining key bits anyway, {mismatchedKey} of them would not match.</p>
          </>}
          {s.verdict === "ok" && eve && <>
            <p className="font-semibold text-amber">⚠ Eve slipped by this time (error rate {pct(s.qber)}).</p>
            <p className="mt-1 text-soft">With only {s.checked} compared bits, a spy escapes with probability (3/4)<sup>{s.checked}</sup> = {pct(chanceUndetected(s.checked))}. Compare more bits (send more qubits) and that falls fast: with 30 bits it's under 0.02%.</p>
          </>}
          {s.verdict === "ok" && !eve && <>
            <p className="font-semibold text-teal">✓ No errors: no sign of a spy. They keep {s.keyBits} raw key bits.</p>
            <p className="mt-1 text-soft">This model has a perfect channel. Real hardware has noise, so even without Eve a few percent of bits would disagree, and the threshold is what separates noise from a spy.</p>
          </>}
          {s.verdict === "no-data" && <p className="text-soft">Not enough kept bits were compared to judge. Send more qubits or try a new run.</p>}
          {eve && s.checked > 0 && s.verdict === "abort" && <p className="mt-2 text-xs text-muted">Chance a spy would have escaped with {s.checked} compared bits: (3/4)<sup>{s.checked}</sup> = {pct(chanceUndetected(s.checked))}.</p>}
        </div>
      )}

      <p className="text-xs text-muted">
        What this simplifies: a perfect, noise-free channel and a single attack (intercept and resend). A real system also needs an authenticated classical channel,
        error correction and privacy amplification on the leftover bits, and real devices are hard to build and attack in practice. That is part of why some national security
        agencies prefer post-quantum cryptography to QKD (see Real World).
      </p>
    </div>
  );
}
