/**
 * Plain-English glossary. `match` lists every wording that should be recognized in the lessons (the headword first).
 * Keep each definition to one or two short sentences, and make sure it is correct, not just simple.
 */
export type Term = {
  id: string; term: string; match: string[]; short: string;
  /** Words that, directly before a match, mean it's something else (e.g. the idiom "a bit like"). */
  avoidAfter?: string[];
};

export const GLOSSARY: Term[] = [
  { id: "bit", term: "Bit", match: ["bit", "bits"], avoidAfter: ["a", "an"], short: "The basic unit of ordinary computing: a single value that is either 0 or 1." },
  { id: "qubit", term: "Qubit", match: ["qubit", "qubits"], short: "A quantum bit, the basic unit of quantum information. A bit is either 0 or 1; a qubit's state is described by two numbers, so it can be a specific blend of 0 and 1 until you measure it." },
  { id: "classical", term: "Classical", match: ["classical", "classical computer", "classical computers", "classically"], short: "Ordinary, not quantum. A classical computer is your laptop, phone or server." },
  { id: "superposition", term: "Superposition", match: ["superposition", "superpositions"], short: "A state that is a specific blend of 0 and 1 at once. It doesn't mean the qubit is secretly 0 or 1; measuring it gives one of them, with odds set by the blend." },
  { id: "amplitude", term: "Amplitude", match: ["amplitude", "amplitudes"], short: "A number (it can be negative or complex) attached to each possible outcome. The chance of an outcome is the amplitude's size squared. Amplitudes can cancel each other, which is why they aren't just probabilities." },
  { id: "complex-number", term: "Complex number", match: ["complex number", "complex numbers"], short: "A number with a real part and an “imaginary” part, like 3 + 2i. Quantum amplitudes are complex numbers." },
  { id: "measurement", term: "Measurement", match: ["measurement", "measurements", "measure", "measures", "measuring", "measured"], short: "Looking at a quantum system to get an ordinary result. A qubit always gives 0 or 1, and afterwards its state matches what you saw." },
  { id: "born-rule", term: "Born rule", match: ["Born rule"], short: "The rule that the probability of a measurement result equals the squared size of its amplitude." },
  { id: "collapse", term: "Collapse", match: ["collapse", "collapses"], short: "The name for the state changing to the observed result after a measurement." },
  { id: "phase", term: "Phase", match: ["phase", "phases", "relative phase"], short: "The “angle” part of an amplitude. It doesn't change the odds of an immediate measurement, but when amplitudes combine, phases decide whether they add up or cancel." },
  { id: "global-phase", term: "Global phase", match: ["global phase"], short: "A factor that multiplies the whole state equally. It has no observable effect, so it's ignored." },
  { id: "interference", term: "Interference", match: ["interference"], short: "What happens when amplitudes combine: some add up, making an outcome more likely, and some cancel, making it less likely. Quantum algorithms are designed so wrong answers cancel." },
  { id: "bloch-sphere", term: "Bloch sphere", match: ["Bloch sphere"], short: "A globe showing every possible state of one qubit. The poles are 0 and 1, points on the equator are even blends, and the longitude is the phase." },
  { id: "gate", term: "Gate", match: ["gate", "gates", "quantum gate", "quantum gates"], short: "An operation applied to qubits, like one step in a recipe. Quantum gates (before measurement) are reversible." },
  { id: "h-gate", term: "H (Hadamard) gate", match: ["H gate", "Hadamard gate", "Hadamard"], short: "A gate that turns a definite 0 or 1 into an even blend of both, and an even blend back into a definite value." },
  { id: "x-gate", term: "X gate (quantum NOT)", match: ["X gate", "quantum NOT"], short: "A gate that flips 0 to 1 and 1 to 0, like an ordinary NOT." },
  { id: "unitary", term: "Unitary", match: ["unitary", "unitary matrix", "unitary matrices"], short: "A reversible operation that keeps the total probability equal to 1. Every quantum gate (before measurement) is unitary." },
  { id: "cnot", term: "CNOT", match: ["CNOT", "controlled-NOT"], short: "A two-qubit gate that flips the second (target) qubit only if the first (control) qubit is 1. Combined with H, it creates entanglement." },
  { id: "entanglement", term: "Entanglement", match: ["entanglement", "entangled", "entangle"], short: "A link between qubits: you can't describe each one separately, and their measurement results are correlated. It doesn't let you send messages faster than light." },
  { id: "bell-state", term: "Bell state", match: ["Bell state", "Bell pair"], short: "The simplest entangled pair, such as (|00⟩ + |11⟩)/√2. Each qubit alone looks random, but the two always agree." },
  { id: "chsh", term: "Bell / CHSH test", match: ["Bell/CHSH inequalities", "Bell inequalities", "Bell inequality", "CHSH"], short: "A test that can tell real quantum entanglement from classical “shared randomness”. Classical models can score at most 2; quantum mechanics can reach about 2.83." },
  { id: "basis", term: "Basis", match: ["computational basis", "basis", "bases"], short: "A set of reference states you measure against. In the “computational basis” you simply read the qubit as 0 or 1." },
  { id: "simulation", term: "Simulation", match: ["simulating", "simulation", "simulate", "simulator"], short: "Using a computer to imitate how a system behaves. Simulating quantum systems on ordinary computers gets very hard as they grow." },
  { id: "grover", term: "Grover's algorithm", match: ["Grover's algorithm", "Grover's", "Grover"], short: "A quantum search method that finds one item among N unsorted items in about √N steps, versus about N/2 checking one by one. A real but modest (quadratic) speedup." },
  { id: "shor", term: "Shor's algorithm", match: ["Shor's algorithm", "Shor's", "Shor"], short: "A quantum method for factoring large numbers quickly. If a big enough quantum computer existed, it would break RSA and elliptic-curve encryption." },
  { id: "oracle", term: "Oracle", match: ["oracle", "oracle calls"], short: "In an algorithm, a black-box step that recognizes the answer you want without telling you where it is." },
  { id: "qft", term: "Quantum Fourier transform", match: ["quantum Fourier transform"], short: "A quantum building block for finding repeating patterns (periods). It's a key ingredient of Shor's algorithm." },
  { id: "quadratic", term: "Quadratic speedup", match: ["quadratic speedup", "quadratic"], short: "A speedup where the work drops from N to about √N. Real, but far smaller than an exponential speedup." },
  { id: "exponential", term: "Exponential", match: ["exponential", "exponentially"], short: "Growth that multiplies at every step (like doubling), so it becomes enormous quickly. Each extra qubit doubles the size of a quantum state's description." },
  { id: "polynomial", term: "Polynomial time", match: ["polynomial time", "polynomial"], short: "Running time that grows moderately (like n² or n³) as the input gets bigger, as opposed to exponential growth, which quickly becomes impossible." },
  { id: "heuristic", term: "Heuristic", match: ["heuristic", "heuristics"], short: "A method that often works well but comes with no guarantee." },
  { id: "nisq", term: "NISQ", match: ["NISQ"], short: "“Noisy Intermediate-Scale Quantum”: today's quantum computers, with tens to thousands of noisy qubits and no full error correction. The term was coined by John Preskill." },
  { id: "variational", term: "Variational algorithm (VQE, QAOA)", match: ["variational algorithms", "variational", "VQE", "QAOA"], short: "A hybrid method: a short quantum circuit with adjustable settings, while an ordinary computer tunes the settings. Popular on today's hardware, but not proven to beat the best classical methods." },
  { id: "barren-plateau", term: "Barren plateau", match: ["barren plateaus", "barren plateau"], short: "A flat “landscape” where the training signal almost vanishes, which makes a variational circuit nearly impossible to tune." },
  { id: "noise", term: "Noise", match: ["noise", "noisy"], short: "Unwanted disturbances that make qubits and gates make mistakes." },
  { id: "error-correction", term: "Error correction", match: ["error correction", "error-corrected"], short: "Spreading one qubit's information over many physical qubits so mistakes can be detected and fixed without destroying the information." },
  { id: "logical-qubit", term: "Logical qubit", match: ["logical qubit", "logical qubits"], short: "A reliable qubit built from many error-prone physical qubits using error correction." },
  { id: "physical-qubit", term: "Physical qubit", match: ["physical qubit", "physical qubits"], short: "An actual qubit in the hardware. Real ones are noisy, so many are needed to make one logical qubit." },
  { id: "surface-code", term: "Surface code", match: ["surface code"], short: "A leading error-correcting code that arranges qubits on a grid. It's widely studied and was used in Google's 2024 error-correction experiment." },
  { id: "fault-tolerant", term: "Fault-tolerant", match: ["fault-tolerant", "fault tolerant"], short: "Able to run long computations correctly even though the individual parts make errors, thanks to error correction." },
  { id: "quantum-advantage", term: "Quantum advantage", match: ["quantum advantage"], short: "When a quantum computer does something useful meaningfully better than the best classical computer." },
  { id: "dequantization", term: "Dequantization", match: ["dequantization"], short: "When researchers find an ordinary (classical) algorithm that matches a claimed quantum speedup, so the quantum advantage disappears." },
  { id: "pqc", term: "Post-quantum cryptography", match: ["post-quantum cryptography", "post-quantum", "PQC"], short: "New encryption methods designed to resist attacks from both ordinary and quantum computers. They run on ordinary computers." },
  { id: "hndl", term: "Harvest now, decrypt later", match: ["harvest now, decrypt later"], short: "Recording encrypted data today in order to unlock it years from now, once a powerful quantum computer exists." },
  { id: "public-key", term: "Public-key cryptography", match: ["public-key"], short: "Encryption where anyone can lock a message with a public key, but only the owner of the private key can unlock it. It secures much of the internet." },
  { id: "rsa", term: "RSA", match: ["RSA"], short: "A widely used public-key method whose security rests on factoring large numbers being hard. Shor's algorithm could break it." },
  { id: "ecc", term: "Elliptic-curve cryptography", match: ["elliptic-curve", "ECC"], short: "Another widely used public-key method. Shor's algorithm could break it too." },
  { id: "symmetric", term: "Symmetric encryption", match: ["symmetric ciphers", "symmetric"], short: "Encryption where the same secret key locks and unlocks. Quantum computers weaken it only modestly, so longer keys keep it safe." },
  { id: "aes", term: "AES", match: ["AES"], short: "A widely used symmetric encryption standard." },
  { id: "key-exchange", term: "Key exchange", match: ["key exchange", "key establishment", "key-encapsulation"], short: "A way for two parties to agree on a shared secret key over an open channel." },
  { id: "ml-kem", term: "ML-KEM", match: ["ML-KEM"], short: "A post-quantum key-exchange method standardized by NIST in 2024 (FIPS 203)." },
  { id: "nist", term: "NIST", match: ["NIST"], short: "The US National Institute of Standards and Technology, which publishes technical standards, including the first post-quantum ones." },
];

export const termById = (id: string) => GLOSSARY.find((t) => t.id === id);
