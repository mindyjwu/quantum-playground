import type { Source } from "@/lib/types";

export type Step = {
  title: string;
  text: string;
  code?: string;
  lang?: "bash" | "python";
  /** Output a real local run produced (yours will differ slightly: results are random samples). */
  expected?: string;
  /** Flag a step we could not execute ourselves. */
  untested?: string;
};

export type Project = {
  id: string;
  title: string;
  tool: string;
  level: "Beginner" | "Intermediate";
  time: string;
  /** Needs an account / real quantum hardware? */
  needsAccount: boolean;
  goal: string;
  learn: string[];
  /** File in /labs read at build time and shown as the full starter script. */
  script: string;
  steps: Step[];
  honest: string;
  extend: string[];
};

export const INSTALL = `python3 --version     # must say 3.11 or newer (see the note below if not)
python3 -m venv .venv && source .venv/bin/activate
pip install -r labs/requirements.txt   # pinned to the versions these scripts were tested with`;

export const PROJECTS: Project[] = [
  {
    id: "first-circuit", title: "Run your first circuit on real hardware", tool: "Qiskit + IBM Quantum (free Open Plan)",
    level: "Beginner", time: "About 45 minutes, mostly account setup", needsAccount: true,
    goal: "Build a Bell-state circuit, check it on a perfect simulator and a noisy simulated chip, then send the same code to a real IBM quantum computer and compare.",
    learn: ["How a circuit becomes hardware instructions (transpiling)", "Why real results differ from the math", "How to budget scarce QPU time"],
    script: "01_first_circuit.py",
    steps: [
      {
        title: "Create a free IBM Quantum Platform account",
        text: "Sign up at IBM Quantum Platform and choose the free Open Plan. IBM's technical docs give the Open Plan as up to 10 minutes of QPU time per 28-day rolling window. Some IBM marketing pages still say “per month”, so trust the docs. IBM's plans page also says that, as of 16 March 2026, active Open Plan users can opt in to an extra 180 minutes over 12 months. Hardware availability on the free plan changes, so check what your dashboard shows.",
        untested: "We can't open IBM's site from our build environment, so the sign-up screens and button names are not verified. Follow IBM's current on-screen instructions.",
      },
      {
        title: "Get your API key and instance name",
        text: "From your dashboard, create an API key and note the name (or CRN) of your Open Plan instance. Treat the key like a password: never commit it to Git or paste it into a shared notebook.",
        untested: "Exact menu names may differ from this description.",
      },
      {
        title: "Install the tools",
        text: "These labs need Python 3.11 or newer (Cirq and PennyLane require it; Qiskit needs 3.10+). The Python that ships with macOS is older and will fail at pip install with “No matching distribution found for qiskit”. If python3 --version shows 3.9 or lower, install a newer Python from python.org or with Homebrew (brew install python@3.12), then create the environment with python3.12 -m venv .venv instead. Use a virtual environment so the pinned versions don't clash with anything else.",
        code: INSTALL, lang: "bash",
      },
      {
        title: "Save your credentials once",
        text: "This stores your key in a local file so scripts can connect with QiskitRuntimeService(). Run it once, then delete the key from your shell history. We checked that these parameter names exist in qiskit-ibm-runtime 0.50.0, but did not run it because it needs a real key.",
        code: `from qiskit_ibm_runtime import QiskitRuntimeService

QiskitRuntimeService.save_account(
    channel="ibm_quantum_platform",
    token="YOUR_API_KEY",
    instance="YOUR_INSTANCE_NAME_OR_CRN",
    set_as_default=True,
    overwrite=True,
)`, lang: "python",
        untested: "Not executed (needs a real API key).",
      },
      {
        title: "Run it locally first (no account, no QPU minutes)",
        text: "By default the script uses a perfect simulator and a local noise model of a real IBM chip. Always do this before spending hardware time.",
        code: "python labs/01_first_circuit.py", lang: "bash",
        expected: `Ideal simulator:
  00:   477  ( 47.7%)
  11:   523  ( 52.3%)
  -> correlated outcomes (00 or 11): 100.0%

Backend: fake_sherbrooke

Device result:
  00:   468  ( 46.8%)
  01:    20  (  2.0%)
  10:    21  (  2.1%)
  11:   491  ( 49.1%)
  -> correlated outcomes (00 or 11): 95.9%`,
      },
      {
        title: "Send the same code to real hardware",
        text: "The --hardware flag swaps the simulated chip for the least-busy real device available to you. The only code that changes is get_backend(). You'll see a job ID, and you can watch the job on the Workloads page. Queue time varies, so be patient.",
        code: "python labs/01_first_circuit.py --hardware", lang: "bash",
        untested: "We could not run this step (no account or network access from our build environment). The same transpile-and-sample pipeline does run end to end against the local simulated chip. Expect mostly 00 and 11 with some 01 and 10, but we can't promise a percentage.",
      },
      {
        title: "Read the result like an engineer",
        text: "In theory a Bell pair only ever gives 00 or 11. Any 01 or 10 you see comes from hardware imperfections: gate errors, readout errors and decoherence. That gap is the whole story of why error correction matters (see the Real World page). After your run, check how much of your QPU allowance the job actually used before launching bigger ones.",
      },
    ],
    honest: "A Bell state shows the machine works, not that it's useful. And the IBM Runtime API is moving: as of qiskit-ibm-runtime 0.50.0, SamplerV2 prints a deprecation warning pointing to a new client-side Sampler (qiskit_ibm_runtime.executor_sampler.Sampler). The warning is expected. We kept SamplerV2 because it is the long-documented path; the replacement gave the same results on our local simulated chip, but we have not tested it on hardware. If a future release removes SamplerV2, check IBM's current docs.",
    extend: ["Try a 3-qubit GHZ state and see how the correlated fraction drops", "Change optimization_level in the pass manager and compare the gate counts", "Run on two different devices and compare their error patterns"],
  },
  {
    id: "chsh", title: "Test a Bell inequality (CHSH)", tool: "Qiskit",
    level: "Intermediate", time: "About 1 hour", needsAccount: false,
    goal: "Show that an entangled pair beats the best possible classical (“sealed envelope”) strategy, using the CHSH score S: classical models cannot exceed 2, quantum mechanics reaches 2√2 ≈ 2.83.",
    learn: ["What Bell tests actually test", "How measurement angles turn into circuits", "How noise eats into quantum advantage"],
    script: "02_chsh_bell_test.py",
    steps: [
      { title: "Install (same as Lab 1)", text: "If you already set up Lab 1, skip this step.", code: INSTALL, lang: "bash" },
      {
        title: "Run it locally",
        text: "Four circuits (two measurement choices for each side) are run on an ideal simulator and a noisy simulated chip, then combined into S. Ideal S should land near 2.83 (the theoretical maximum, 2√2), but because each run is a random sample it can come out a little above or below, by roughly ±0.03 at the default 4000 shots. A value slightly over 2.83 is shot noise, not a broken law of physics.",
        code: "python labs/02_chsh_bell_test.py", lang: "bash",
        expected: `ideal simulator        S = 2.815   (VIOLATES the classical bound of 2)
noisy simulated chip   S = 2.591   (VIOLATES the classical bound of 2)

Classical limit: 2.000   Quantum maximum: 2.828`,
      },
      {
        title: "Optionally run on hardware",
        text: "Add --hardware to run the same four circuits on a real device. Noise lowers S. Whether it stays above 2 depends on the device.",
        code: "python labs/02_chsh_bell_test.py --hardware", lang: "bash",
        untested: "Hardware run not tested by us. We don't know what S a given IBM device will give you today.",
      },
    ],
    honest: "A violation here is consistent with entanglement but is not a rigorous, loophole-free Bell test. Both qubits sit on the same chip and are measured by the same classical control system, so the locality and detection loopholes are open. The 2022 Nobel Prize in Physics recognized the careful experiments that go further.",
    extend: ["Sweep Bob's angle from 0 to π and plot S", "Add depolarizing noise yourself and find where S drops below 2"],
  },
  {
    id: "grover", title: "Grover's search from scratch", tool: "Cirq (Google Quantum AI)",
    level: "Beginner", time: "About 30 minutes", needsAccount: false,
    goal: "Build Grover's algorithm for 4 items in Cirq and find a marked item with a single oracle call, then see why bigger searches are only quadratically faster.",
    learn: ["Oracle plus diffusion, the two halves of Grover", "Cirq's circuit-and-moment model", "Why the speedup is quadratic, not exponential"],
    script: "03_grover_cirq.py",
    steps: [
      { title: "Install", text: "Cirq runs entirely on your machine for this lab. No account needed.", code: INSTALL, lang: "bash" },
      {
        title: "Run it and pick any marked item",
        text: "Pass a two-bit string to change which item is marked. Each of 00, 01, 10 and 11 is found with certainty after one iteration (our test checks all four).",
        code: "python labs/03_grover_cirq.py 11", lang: "bash",
        expected: `Marked item: 11
Measured    : {'11': 1000}`,
      },
      { title: "Notice what the oracle is", text: "The oracle is just a phase flip on the marked state, built from X gates around a CZ. In a real search problem, the hard part is building that oracle without already knowing the answer." },
    ],
    honest: "With 4 items, a classical search needs about 2.5 guesses on average, so this is a teaching example, not an advantage. For N items Grover needs about (π/4)√N queries versus ~N/2 classically: a proven quadratic speedup, and fault-tolerance overhead can eat it for modest N (Babbush et al. 2021).",
    extend: ["Generalize to 3 qubits and find the right number of iterations", "Add a noise model with cirq.depolarize and watch the success rate fall"],
  },
  {
    id: "vqe", title: "A tiny variational eigensolver", tool: "PennyLane (Xanadu)",
    level: "Intermediate", time: "About 1 hour", needsAccount: false,
    goal: "Tune a 4-parameter quantum circuit with a classical optimizer to find the lowest energy of a 2-qubit Hamiltonian, then check the answer against exact linear algebra.",
    learn: ["The hybrid quantum-classical loop behind VQE and QAOA", "Differentiable circuits and gradient descent", "Why “it works on a toy” is not evidence of advantage"],
    script: "04_vqe_pennylane.py",
    steps: [
      { title: "Install", text: "PennyLane's default.qubit simulator runs locally. No account needed.", code: INSTALL, lang: "bash" },
      {
        title: "Run the optimizer",
        text: "Watch the energy fall from about +1.36 to the exact ground energy −√2 ≈ −1.4142. The script then verifies against numpy.",
        code: "python labs/04_vqe_pennylane.py", lang: "bash",
        expected: `step   0  energy =  1.355846
step  10  energy = -0.761887
step  50  energy = -1.404742
step 149  energy = -1.414213

VQE energy   : -1.414213
Exact energy : -1.414214   (a classical computer solves this 4x4 problem instantly)
Error        : 5.00e-07`,
      },
      { title: "Change the problem", text: "Edit the Hamiltonian line to try different couplings, or add a layer to the ansatz. Does a shallower circuit still reach the exact answer?" },
    ],
    honest: "This problem is trivial for a laptop: it's a 4×4 matrix. The point is the workflow. Real VQE targets molecules where classical methods struggle, but there is no proven advantage yet, noise limits circuit depth, and optimization can hit barren plateaus. On hardware, PennyLane's fast simulator gradients are replaced by slower hardware-compatible methods.",
    extend: ["Swap in a molecular Hamiltonian using PennyLane's chemistry tools", "Run the same circuit on an IBM device through a PennyLane plugin"],
  },
];

export const IDEAS: { title: string; text: string }[] = [
  { title: "Noise versus depth", text: "Build GHZ states of 2, 3, 4… qubits in Qiskit and plot the fraction of correct outcomes. You'll see noise compound, which makes the error-correction problem concrete." },
  { title: "Cryptographic inventory scanner", text: "Not a quantum circuit, but arguably the most employable project here: write a tool that finds RSA and elliptic-curve usage across a codebase or set of TLS endpoints and outputs a post-quantum migration worklist. See the Real World page for the standards context." },
  { title: "Framework showdown", text: "Implement the same Bell and Grover circuits in Qiskit, Cirq and PennyLane. Compare lines of code, simulation speed and how each handles noise. Write up which you'd pick for what." },
];

export const TOOLS: { name: string; by: string; pick: string }[] = [
  { name: "Qiskit", by: "IBM", pick: "Largest ecosystem, and the direct route to IBM's real hardware. Best default for hardware experiments." },
  { name: "Cirq", by: "Google Quantum AI", pick: "Fine-grained, circuit-level control and a clean model of moments and qubits. Good for algorithm and noise research." },
  { name: "PennyLane", by: "Xanadu", pick: "Differentiable circuits that plug into machine-learning workflows. Best for variational and hybrid algorithms." },
];

export const LAB_SOURCES: Source[] = [
  { label: "IBM Quantum: Plans overview (Open Plan limits)", url: "https://quantum.cloud.ibm.com/docs/en/guides/plans-overview" },
  { label: "IBM Quantum: Create and manage instances", url: "https://quantum.cloud.ibm.com/docs/en/guides/instances" },
  { label: "Qiskit Runtime service reference", url: "https://quantum.cloud.ibm.com/docs/en/api/qiskit-ibm-runtime/runtime-service" },
  { label: "Qiskit Runtime: Sampler options", url: "https://quantum.cloud.ibm.com/docs/guides/sampler-options" },
  { label: "Babbush et al. (2021), Focus beyond quadratic speedups", url: "https://arxiv.org/abs/2011.04149" },
  { label: "PennyLane documentation", url: "https://docs.pennylane.ai" },
];
