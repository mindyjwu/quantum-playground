import BlochSphere from "@/components/BlochSphere";
import MeasurementSim from "@/components/MeasurementSim";
import BellDemo from "@/components/BellDemo";
import CircuitBuilder from "@/components/CircuitBuilder";
import BB84Demo from "@/components/BB84Demo";
import type { ReactNode } from "react";

export const metadata = { title: "Interactive Demos" };

function Demo({ id, title, intro, children }: { id: string; title: string; intro: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-1 mb-5 max-w-2xl text-soft">{intro}</p>
      {children}
    </section>
  );
}

export default function Page() {
  return (
    <div className="fade-in space-y-14">
      <div>
        <h1 className="text-3xl font-semibold sm:text-4xl">Interactive Demos</h1>
        <p className="mt-3 max-w-2xl text-soft">
          Five small simulators that run entirely in your browser. Most model ideal, noise-free qubits, which is what makes them good for building intuition. The circuit builder also lets you turn noise up, and the last demo catches an eavesdropper.
        </p>
        <nav aria-label="Demos" className="mt-4 flex flex-wrap gap-2 text-sm">
          {[["bloch", "Bloch sphere"], ["measure", "Measurement"], ["bell", "Entanglement"], ["circuit", "Circuit builder + noise"], ["bb84", "Key exchange (BB84)"]].map(([id, l]) => (
            <a key={id} href={`#${id}`} className="btn !min-h-8 !py-1">{l}</a>
          ))}
        </nav>
      </div>
      <Demo id="bloch" title="1 · Bloch sphere" intro="A single qubit as a point on a sphere. Latitude sets the probabilities; longitude is the phase.">
        <BlochSphere />
      </Demo>
      <Demo id="measure" title="2 · Superposition & measurement" intro="A qubit gives one random bit per measurement. Probabilities only appear over many repeated runs.">
        <MeasurementSim />
      </Demo>
      <Demo id="bell" title="3 · Entanglement: the Bell state" intro="Build (|00⟩ + |11⟩)/√2 step by step, then watch what measuring it does, and what it doesn't.">
        <BellDemo />
      </Demo>
      <Demo id="circuit" title="4 · Circuit builder, with noise" intro="Compose H, X, Z and CNOT gates and see the exact state update live. Then turn on gate noise and watch errors leak into outcomes that should never happen.">
        <CircuitBuilder />
      </Demo>
      <Demo id="bb84" title="5 · Quantum key exchange (BB84)" intro="Two people agree on a secret key using qubits. Switch on an eavesdropper and see why she can't listen without leaving fingerprints.">
        <BB84Demo />
      </Demo>
    </div>
  );
}
