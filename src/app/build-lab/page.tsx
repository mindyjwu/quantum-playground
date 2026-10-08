import { readFileSync } from "node:fs";
import { join } from "node:path";
import BuildLab from "@/components/BuildLab";
import { PROJECTS } from "@/data/labs";

export const metadata = { title: "Build Lab · Quantum Playground" };

export default function Page() {
  // Read the tested scripts at build time so the site shows exactly the code we ran.
  const scripts: Record<string, string> = {};
  for (const p of PROJECTS) scripts[p.script] = readFileSync(join(process.cwd(), "labs", p.script), "utf8");
  return (
    <div className="fade-in">
      <h1 className="text-3xl font-semibold sm:text-4xl">Build Lab</h1>
      <p className="mt-3 max-w-2xl text-soft">
        Hands-on projects with starter code. Start by running a circuit on a real IBM quantum computer, then try Cirq and PennyLane. Every script runs locally on a simulator first, so you don't burn scarce hardware time debugging.
      </p>
      <BuildLab scripts={scripts} />
    </div>
  );
}
