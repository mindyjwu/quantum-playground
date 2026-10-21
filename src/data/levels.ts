import type { Question } from "./stages";

/** Beginner: plain language. Expert: a "go deeper" panel. Keyed by lesson id from stages.ts. */
export type LevelExtras = { plain: string[]; deeper: { title: string; body: string[]; math?: string[] } };

export const LEVEL_EXTRAS: Record<string, LevelExtras> = {
  f1: {
    plain: ["A normal bit is a light switch: on or off. A qubit is more like a dimmer combined with a compass: it can sit between on and off in a very specific way, described by two numbers. Those numbers aren't chances. They behave more like waves, and waves can add up or cancel out."],
    deeper: {
      title: "Pure states, mixed states and the density matrix",
      body: ["A pure state is a vector in ℂ². When you only know a statistical mixture of states, or you look at one half of an entangled pair, you need a density matrix ρ: positive semidefinite with trace 1. For one qubit, ρ is fixed by a Bloch vector r, and the state is pure exactly when |r| = 1.", "That's why the Bell demo shows each qubit's vector shrinking to length 0: the half you can see is maximally mixed."],
      math: ["ρ = ½ (I + r·σ),   |r| ≤ 1", "pure ⇔ Tr ρ² = 1"],
    },
  },
  f2: {
    plain: ["When you look at a qubit (measure it) you always get a plain 0 or 1, never something in between. The numbers you prepared only set the odds. It's like a weighted coin you can only flip once: to learn the weighting you need many identical coins."],
    deeper: {
      title: "Generalized measurements (POVMs)",
      body: ["Measuring in a basis is a special case. The general measurement is a POVM: a set of positive operators {Eᵢ} summing to the identity, with outcome probabilities pᵢ = Tr(ρ Eᵢ). Naimark's theorem says any POVM can be implemented as an ordinary projective measurement on a larger system that includes an ancilla."],
      math: ["Eᵢ ≥ 0,   Σᵢ Eᵢ = I,   pᵢ = Tr(ρ Eᵢ)"],
    },
  },
  f3: {
    plain: ["Every qubit you add doubles the size of the description, which is why simulating big quantum systems on ordinary computers is hard. But at the end you still read out only a few plain bits, so it isn't magic “trying everything at once”."],
    deeper: {
      title: "Size isn't power: the Gottesman–Knill theorem",
      body: ["Circuits built only from Clifford gates (H, S, CNOT) on stabilizer states, with Pauli measurements, can be simulated efficiently on a classical computer, even though the state space is exponentially large. So the 2ⁿ amplitudes alone don't give quantum advantage. You also need non-Clifford resources such as the T gate, which is exactly what makes fault-tolerant machines expensive."],
      math: ["Clifford = ⟨H, S, CNOT⟩  (classically simulable)", "Clifford + T  →  universal"],
    },
  },
  g1: {
    plain: ["The Bloch sphere is a globe for one qubit. The north pole is 0 and the south pole is 1. How far north or south the arrow points sets the odds of 0 or 1, and its longitude is a hidden “twist” that matters later."],
    deeper: {
      title: "Single-qubit gates are rotations",
      body: ["Up to a global phase, every single-qubit unitary is an element of SU(2) and acts on the Bloch sphere as a rotation (SU(2) is a double cover of the rotation group SO(3)). Any single-qubit gate can be written as three rotations, an Euler decomposition."],
      math: ["R_n(θ) = exp(−i θ n·σ / 2)", "U = e^{iα} R_z(β) R_y(γ) R_z(δ)"],
    },
  },
  g2: {
    plain: ["Gates are the moves you can make on a qubit. X flips 0 and 1, like NOT. H splits a 0 or 1 into an even mix. Z does nothing you can see right away, but it changes the hidden twist, which shows up after another H."],
    deeper: {
      title: "Universality and the cost of the T gate",
      body: ["No finite gate set makes every unitary exactly, but Clifford + T is universal in the sense of approximation: by the Solovay–Kitaev theorem, any single-qubit gate can be approximated to error ε with a number of gates that grows only polylogarithmically in 1/ε. In error-corrected hardware the T gate is typically the expensive one, because it needs magic-state distillation."],
      math: ["{H, T, CNOT} is universal    (S = T²)", "{H, S, CNOT} is not (Clifford only)"],
    },
  },
  g3: {
    plain: ["With two qubits, a CNOT gate says “flip the second qubit only if the first is 1”. Put the first qubit in an even mix with H, then apply CNOT, and you get two qubits whose results are linked. That is entanglement."],
    deeper: {
      title: "The Schmidt decomposition and entanglement entropy",
      body: ["Any pure state of two systems can be written with a single sum of paired basis states. The number of nonzero terms, the Schmidt rank, is 1 exactly for product states. The entropy of the weights measures how entangled the pair is: a Bell state has one full “ebit”."],
      math: ["|ψ⟩ = Σᵢ √λᵢ |aᵢ⟩|bᵢ⟩,   S = −Σᵢ λᵢ log₂ λᵢ", "Bell state: λ = (½, ½)  →  S = 1 ebit"],
    },
  },
  g4: {
    plain: ["In an entangled pair, each result looks random on its own, but the two always agree. That doesn't let you send messages faster than light, and “they agree” alone isn't the proof of entanglement: special tests with different measurement choices are."],
    deeper: {
      title: "CHSH, Tsirelson's bound and what “quantum” really means",
      body: ["For ±1-valued measurements, local hidden variable models give |S| ≤ 2. Quantum mechanics reaches 2√2 (Tsirelson's bound), which Lab 2 approaches. Demanding only that no signaling is possible would allow up to 4 (the Popescu–Rohrlich box), so quantum correlations sit strictly between the classical and the merely no-signaling."],
      math: ["local: |S| ≤ 2     quantum: |S| ≤ 2√2     no-signaling: |S| ≤ 4"],
    },
  },
  a1: {
    plain: ["Quantum algorithms work a bit like noise-cancelling headphones: arrange things so that the wrong answers cancel each other out and the right answer gets louder."],
    deeper: {
      title: "Phase kickback",
      body: ["Many interference algorithms rely on phase kickback. If you apply a gate U to a target that is already an eigenstate of U, controlled by a qubit in superposition, the eigenvalue's phase is not lost on the target: it moves onto the control, where later interference can read it out. This is the mechanism behind phase estimation and Shor's algorithm."],
      math: ["U|u⟩ = e^{iφ}|u⟩", "controlled-U:  (|0⟩+|1⟩)/√2 ⊗ |u⟩  →  (|0⟩ + e^{iφ}|1⟩)/√2 ⊗ |u⟩"],
    },
  },
  a2: {
    plain: ["Grover's algorithm finds an item in an unsorted list in about the square root of the number of checks a normal search needs. That's a real speedup, but a modest one."],
    deeper: {
      title: "Grover as a rotation, and why √N is optimal",
      body: ["Each Grover iteration rotates the state by 2θ inside a two-dimensional plane spanned by the marked and unmarked states. Stop too late and you overshoot, so the success probability goes back down. Bennett, Bernstein, Brassard and Vazirani (1997) proved that any quantum algorithm needs Ω(√N) queries for unstructured search, so Grover is optimal."],
      math: ["θ = arcsin √(M/N)", "P(success after k steps) = sin²((2k+1)θ)", "k ≈ (π/4) √(N/M)"],
    },
  },
  a3: {
    plain: ["Shor's algorithm could break the public-key locks that protect much of the internet, but only if a huge, reliable quantum computer is built. Today's machines are far too small and noisy, and when (or whether) that happens is debated, which is why people are already preparing."],
    deeper: {
      title: "Where the cost actually is",
      body: ["Shor reduces factoring to order finding, solved with phase estimation on modular multiplication. In practice the cost is dominated by reversible arithmetic and by error-correction overhead, which is why published estimates move so much between papers (see the Gidney 2025 estimate, with its stated assumptions). Published estimates also suggest that breaking 256-bit elliptic-curve keys needs fewer logical qubits than breaking RSA-2048 (Roetteler et al., 2017), so both families are on the migration list."],
      math: ["find r:  aʳ ≡ 1 (mod N)", "if r is even:  gcd(a^{r/2} ± 1, N) often yields a factor"],
    },
  },
  a4: {
    plain: ["Today's quantum computers are small and noisy. “Hybrid” methods let one do a short quantum step while an ordinary computer steers. They're a great way to learn, but nobody has proved that they beat the best ordinary methods yet."],
    deeper: {
      title: "Barren plateaus and trainability",
      body: ["For sufficiently expressive, random parameterized circuits, the variance of cost-function gradients shrinks exponentially with the number of qubits (McClean et al., 2018), leaving a flat landscape that no optimizer can navigate. That motivates structured ansätze, local cost functions and good initializations. A live research question is how often trainable circuits are also classically simulable, which would undercut any advantage."],
      math: ["Var[∂θ C] decays like O(2^{−n}) for deep random circuits"],
    },
  },
  r1: {
    plain: ["Quantum computers are expected to be most useful for simulating nature itself: molecules and materials. The claims that they will speed up everything, such as AI, are much shakier."],
    deeper: {
      title: "Resource estimates for chemistry",
      body: ["Frequently studied targets include the nitrogenase cofactor FeMoco. Published resource estimates for fault-tolerant energy calculations have dropped across successive papers, yet still point to large fault-tolerant machines. The open question is whether a quantum method will beat the best classical ones (such as DMRG and coupled-cluster methods) at the accuracy that matters chemically, not merely whether it can run."],
    },
  },
  r2: {
    plain: ["Qubits make mistakes, a lot. To build a reliable one, you combine many noisy qubits into one “logical” qubit that can repair its own errors. That overhead is the main reason big machines are hard to build."],
    deeper: {
      title: "Threshold, distance and overhead",
      body: ["For the surface code, below a threshold error rate (on the order of 1% for idealized circuit-level noise), the logical error rate falls roughly exponentially as the code distance d grows, at a cost of roughly 2d² physical qubits per logical qubit. Google's 2024 result showed this suppression up to distance 7. Newer qLDPC codes, as in IBM's roadmap, aim to cut the overhead."],
      math: ["p_L ≈ A (p / p_th)^((d+1)/2)", "physical qubits per logical ≈ 2d²"],
    },
  },
  r3: {
    plain: ["Even without a quantum computer, someone can copy your encrypted data today and unlock it later. Governments and companies are already switching to new locks designed to resist quantum attacks."],
    deeper: {
      title: "Hybrid key exchange and crypto-agility",
      body: ["Early deployments often combine a classical and a post-quantum key exchange, so security holds if either one holds. ML-KEM (FIPS 203) is a lattice-based key-encapsulation mechanism built on module learning-with-errors. Signatures are the harder migration: larger keys and signatures, longer certificate chains, and standards still settling (FN-DSA was pending), so systems should be built to swap algorithms without rewrites."],
    },
  },
  r4: {
    plain: ["You can contribute in different ways: study the science, build the software, advise organizations (for example on the encryption switch), or start a company. You don't need to be a physicist for all of them."],
    deeper: {
      title: "How to evaluate a quantum startup's claims",
      body: ["Ask for two-qubit gate error rates, qubit connectivity, coherence times, and whether results are independently verified. Distinguish physical-qubit counts from logical-qubit demonstrations. Ask what the company's resource estimate is for the application it markets, and whether its roadmap is a goal or a measured result. The hype check at the end of Think Bigger turns these into six questions."],
    },
  },
};

/** Gentle nudges for the base quiz questions: key = `${stageId}:${questionIndex}`. Never give the answer away. */
export const HINTS: Record<string, string> = {
  "foundations:0": "If |α| = |β| and |α|² + |β|² = 1, what must |α|² be?",
  "foundations:1": "Think about what lets two contributions cancel each other.",
  "foundations:2": "Each extra qubit doubles the number of amplitudes: 2ⁿ.",
  "foundations:3": "How many classical bits do you get when you measure n qubits?",
  "gates:0": "What single gate is the same as H followed by Z followed by H?",
  "gates:1": "P(0) = cos²(θ/2). Which angle makes that exactly one half?",
  "gates:2": "The control is in superposition. What does each branch do to the target?",
  "gates:3": "Can either side choose their own outcome?",
  "algorithms:0": "(π/4)·√N, and √1,000,000 = 1,000.",
  "algorithms:1": "Which kind of lock does Shor's math (factoring, discrete logs) apply to?",
  "algorithms:2": "Heuristic means there is no proof of advantage.",
  "algorithms:3": "Has anyone proven that factoring is hard for classical computers, or is it just believed?",
  "applications:0": "What was Feynman's 1981 motivation for quantum computers?",
  "applications:1": "Who benefits from recording encrypted data now?",
  "applications:2": "What fraction of operations fail, and what do you need to repair them?",
  "applications:3": "NIST's competition began in 2016. It took roughly eight years.",
};

/** Extra questions that only appear at the Expert level. They count as a bonus, separate from the 4-question score. */
export const EXPERT_QUESTIONS: Record<string, Question[]> = {
  foundations: [
    { q: "Which statement about generalized measurements (POVMs) is correct?", options: ["Every POVM is a projective measurement on the same system", "Any POVM can be implemented as a projective measurement on a larger system that includes an ancilla", "POVM elements must be mutually orthogonal projectors", "POVM outcome probabilities can be negative"], answer: 1, why: "That is Naimark's theorem. POVM elements only need to be positive operators summing to the identity." },
    { q: "A qubit's reduced density matrix has a Bloch vector of length 0. Which is true?", options: ["It is in a pure state on the equator", "It is maximally mixed, as when it is half of a Bell pair", "It has already been measured", "Both of its amplitudes are zero"], answer: 1, why: "Length 1 means pure. Length 0 is the maximally mixed state ρ = I/2, which is what you get from half of a maximally entangled pair." },
  ],
  gates: [
    { q: "Which gate set is universal (it can approximate any unitary)?", options: ["{H, CNOT}", "{H, S, CNOT}", "{H, T, CNOT}", "{X, Z, CNOT}"], answer: 2, why: "{H, S, CNOT} and {H, CNOT} generate only Clifford circuits, which are classically simulable. Adding T makes the set universal." },
    { q: "If you only require that no signaling is possible, what is the largest possible CHSH value?", options: ["2", "2√2", "3", "4"], answer: 3, why: "No-signaling boxes (Popescu–Rohrlich) reach 4. Classical models stop at 2 and quantum mechanics at 2√2 (Tsirelson)." },
  ],
  algorithms: [
    { q: "Grover search with M marked items among N: roughly how many iterations?", options: ["(π/4)√N regardless of M", "(π/4)√(N/M)", "N/M", "log N"], answer: 1, why: "More marked items means fewer iterations, about (π/4)√(N/M). Overshooting reduces the success probability." },
    { q: "In phase kickback, a controlled-U acts on a control in (|0⟩+|1⟩)/√2 and a target eigenstate |u⟩ with U|u⟩ = e^{iφ}|u⟩. What is the control afterwards?", options: ["(|0⟩ + e^{iφ}|1⟩)/√2", "(|0⟩ + |1⟩)/√2, unchanged", "|0⟩", "|1⟩"], answer: 0, why: "The eigenvalue's phase is imprinted on the |1⟩ branch of the control while the target is left unchanged." },
  ],
  applications: [
    { q: "Below threshold, how does a surface code's logical error rate behave as the code distance d grows?", options: ["It increases", "It is independent of d", "It decreases roughly exponentially in d", "It decreases only linearly"], answer: 2, why: "Below threshold each increase of d suppresses logical errors by a constant factor. That is what Google's 2024 experiment demonstrated up to d = 7." },
    { q: "Why are hybrid (classical plus post-quantum) key exchanges commonly proposed during the transition?", options: ["Security holds as long as either component remains secure", "They are always faster than either alone", "They produce smaller keys", "NIST requires them"], answer: 0, why: "Hybrids hedge against a flaw in either the new post-quantum scheme or the old classical one." },
  ],
};
