import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PROJECTS } from "@/data/labs";

describe("build lab data", () => {
  it("has unique project ids and a starter script file for each", () => {
    expect(new Set(PROJECTS.map((p) => p.id)).size).toBe(PROJECTS.length);
    for (const p of PROJECTS) expect(existsSync(join(process.cwd(), "labs", p.script)), p.script).toBe(true);
  });
  it("starts with the real-hardware lab", () => expect(PROJECTS[0].id).toBe("first-circuit"));
  it("covers Qiskit, Cirq and PennyLane", () => {
    const tools = PROJECTS.map((p) => p.tool).join(" ");
    for (const t of ["Qiskit", "Cirq", "PennyLane"]) expect(tools).toContain(t);
  });
  it("every step that shows a command or code has non-empty text", () => {
    for (const p of PROJECTS) for (const s of p.steps) { expect(s.title.length).toBeGreaterThan(0); expect(s.text.length).toBeGreaterThan(0); }
  });
  it("hardware steps are flagged as untested", () => {
    const hw = PROJECTS.flatMap((p) => p.steps).filter((s) => s.code?.includes("--hardware"));
    expect(hw.length).toBeGreaterThan(0);
    for (const s of hw) expect(s.untested, s.title).toBeTruthy();
  });
  it("shows lab scripts that mention --hardware only where the script supports it", () => {
    for (const p of PROJECTS) {
      const src = readFileSync(join(process.cwd(), "labs", p.script), "utf8");
      const mentions = p.steps.some((s) => s.code?.includes("--hardware"));
      if (mentions) expect(src).toContain("--hardware");
    }
  });
});
