import type { Source } from "@/lib/types";

/** What kind of claim is this? Drives the colored label so readers can tell a deadline from a hope. */
export type ClaimKind = "scheduled" | "vendor-target" | "forecast" | "reported";
export const KIND_META: Record<ClaimKind, { label: string; hint: string }> = {
  scheduled: { label: "Scheduled", hint: "A dated commitment from a regulator or standards body. Dates can still slip." },
  "vendor-target": { label: "Vendor target", hint: "A company's own roadmap. A goal, not a result." },
  forecast: { label: "Forecast", hint: "An estimate. Experts disagree, and ranges are wide." },
  reported: { label: "Reported", hint: "A fact we only saw through press coverage. Verify before relying on it." },
};

export type Fact = { id: string; big: string; title: string; text: string; caveat: string; kind: ClaimKind; sources: Source[] };

export const FACTS: Fact[] = [
  {
    id: "money", big: "$2.0B → $12.6B", title: "Money is flooding in",
    text: "McKinsey's 2025 Quantum Technology Monitor counted nearly $2.0B invested in quantum startups in 2024 (up 50% from $1.3B in 2023). Coverage of its April 2026 edition reports $12.6B for 2025, about 6x more.",
    caveat: "We saw the 2026 number only in secondary coverage, and McKinsey notes data on Chinese startups is limited. Investment measures belief, not technical progress.",
    kind: "reported",
    sources: [
      { label: "Coverage of McKinsey's 2025 monitor (e27)", url: "https://e27.co/mckinsey-quantum-computing-20250812/" },
      { label: "Coverage of McKinsey's 2026 monitor (postquantum.com)", url: "https://postquantum.com/industry-news/mckinsey-quantum-monitor-2026/" },
    ],
  },
  {
    id: "valuations", big: "$7B · $10B", title: "Private valuations are large",
    text: "In September 2025 PsiQuantum raised $1B at a reported $7B valuation, and Quantinuum was reported at a $10B valuation.",
    caveat: "Reports disagree on the size of Quantinuum's round ($300M vs $600M). We found no source calling either a “record”. Valuations are bets on the future and are not evidence the technology works.",
    kind: "reported",
    sources: [
      { label: "Bloomberg: Nvidia backs PsiQuantum round (Sep 2025)", url: "https://www.bloomberg.com/news/articles/2025-09-10/nvidia-backs-psiquantum-in-1-billion-round-at-7-billion-value" },
      { label: "Bloomberg: Quantinuum weighs raise at $10B (Aug 2025)", url: "https://www.bloomberg.com/news/articles/2025-08-20/quantinuum-weighs-raising-funds-at-10-billion-valuation" },
    ],
  },
  {
    id: "darpa", big: "2033", title: "DARPA is asking the hard question",
    text: "DARPA's Quantum Benchmarking Initiative is testing whether an industrially useful quantum computer, one whose value exceeds its cost, can be built by 2033. In November 2025, 11 companies advanced to Stage B, a year-long review of their roadmaps. Stage C involves independent hardware verification.",
    caveat: "This is a feasibility test, not a promise. DARPA says it is not a competition, and plenty of expert opinion doubts the 2033 date.",
    kind: "scheduled",
    sources: [{ label: "Nextgov: 11 companies move to QBI Stage B", url: "https://www.nextgov.com/emerging-tech/2025/11/11-companies-move-second-stage-darpas-quantum-benchmarking-initiative/409405/" }],
  },
  {
    id: "experts", big: "28–49%", title: "Experts disagree about when encryption breaks",
    text: "The Global Risk Institute's annual survey (March 2026 edition, 26 experts) puts the chance of a quantum computer able to break RSA-2048 within 10 years at 28–49%, and within 15 years at 51–70%, with experts saying the timeline has moved earlier. Jensen Huang said in January 2025 that “very useful” quantum computers were 15–30 years away, then walked it back in March.",
    caveat: "26 experts is a small sample, the survey defines a narrow milestone (breaking RSA-2048), and Huang's company has a commercial stake. Treat all of it as a range, not a date.",
    kind: "forecast",
    sources: [
      { label: "Global Risk Institute: Quantum Threat Timeline Report", url: "https://globalriskinstitute.org/publication/quantum-threat-timeline-report-2025b/" },
      { label: "Slashdot: Huang's January 2025 remarks", url: "https://tech.slashdot.org/story/25/01/08/1328234/" },
    ],
  },
];

export type HorizonItem = { when: string; what: string; kind: ClaimKind };
export const HORIZON: { span: string; items: HorizonItem[] }[] = [
  {
    span: "Now to 2027",
    items: [
      { when: "End of 2026", what: "EU roadmap: member states should start post-quantum migration (national strategies, cryptographic inventories, pilots).", kind: "scheduled" },
      { when: "1 Jan 2027", what: "US national security systems: new acquisitions expected to be CNSA 2.0-compliant (per secondary sources).", kind: "scheduled" },
      { when: "~2027", what: "NIST expects to finalize the HQC backup encryption standard. FN-DSA (FIPS 206) was still pending in our sources.", kind: "scheduled" },
    ],
  },
  {
    span: "2028 to 2033",
    items: [
      { when: "2029", what: "IBM's target for “Starling”, a fault-tolerant machine with ~200 logical qubits. Reports differ on the exact date.", kind: "vendor-target" },
      { when: "End of 2030", what: "EU roadmap: critical infrastructure should be on post-quantum cryptography. Some CNSA 2.0 categories (software signing, networking) also target 2030.", kind: "scheduled" },
      { when: "2033", what: "DARPA QBI's feasibility target for a useful quantum computer. CNSA 2.0 aims to complete most US national-security transitions.", kind: "scheduled" },
    ],
  },
  {
    span: "2035 and beyond",
    items: [
      { when: "2035", what: "EU: migrate as many systems as practical. NIST's draft IR 8547 proposes disallowing RSA/ECC after 2035 (still a draft when we checked).", kind: "scheduled" },
      { when: "2035", what: "McKinsey scenarios for the whole quantum technology market range up to about $97B in its 2025 edition (computing $28–72B). A 2026 edition is reported to raise this.", kind: "forecast" },
      { when: "Unknown", what: "A computer that can break RSA-2048. Experts' 10-year odds span 28–49%.", kind: "forecast" },
    ],
  },
];

export type Lane = {
  id: string; title: string; stage: string; why: string;
  build: string[]; risks: string[]; first30: string[]; sources: Source[];
};

export const LANES: Lane[] = [
  {
    id: "pqc", title: "Enterprise post-quantum migration", stage: "Nearest to revenue",
    why: "The deadlines come from regulators, not from physics. Whether or not a code-breaking machine arrives on schedule, large organizations are being asked to inventory, plan and migrate cryptography. Much of the work is discovery, architecture and change management, not quantum physics.",
    build: [
      "Cryptographic inventory and discovery: where do RSA, ECC and long-lived secrets actually live in a client's systems?",
      "“Crypto-agility” architecture so algorithms can be swapped without rewrites",
      "Triage of long-lived data most exposed to “harvest now, decrypt later”",
      "Hybrid key-exchange pilots and supplier / third-party readiness questionnaires",
    ],
    risks: [
      "Standards are still moving (HQC due ~2027; FN-DSA not final in our sources), so avoid locking clients into one algorithm",
      "We'd expect competition from large vendors and consultancies, so differentiate on a niche (an industry, a toolchain, a regulation)",
      "Enterprise sales cycles are long, and services can be hard to turn into a product",
    ],
    first30: [
      "Run the Build Lab's crypto-inventory idea on your own repository",
      "Read NIST's FIPS 203/204/205 announcement and the EU roadmap, then summarize both in one page",
      "Map one real client's long-lived-data exposure and write a two-page migration playbook",
    ],
    sources: [
      { label: "EU Commission: post-quantum cryptography roadmap", url: "https://digital-strategy.ec.europa.eu/en/news/eu-reinforces-its-cybersecurity-post-quantum-cryptography" },
      { label: "NIST: first 3 finalized PQC standards (Aug 2024)", url: "https://www.nist.gov/news-events/news/2024/08/nist-releases-first-3-finalized-post-quantum-encryption-standards" },
      { label: "NIST: HQC selected as fifth algorithm (Mar 2025)", url: "https://www.nist.gov/news-events/news/2025/03/nist-selects-hqc-fifth-algorithm-post-quantum-encryption" },
      { label: "CNSA 2.0 explainer (secondary)", url: "https://www.encryptionconsulting.com/education-center/what-is-cnsa-2-0/" },
      { label: "FN-DSA / FIPS 206 status (secondary)", url: "https://www.encryptionconsulting.com/education-center/fn-dsa-fips-206/" },
    ],
  },
  {
    id: "tooling", title: "Tooling and verification software", stage: "Medium term, small market today",
    why: "Every hardware company needs compilers, error-correction decoders, benchmarking and workflow software, and buyers need ways to check vendor claims. DARPA's QBI explicitly plans independent verification of hardware, which suggests that independent measurement is a real need.",
    build: [
      "Independent benchmarking and claim-verification suites (reproduce a published result, then publish the discrepancies)",
      "Error-mitigation and decoding libraries",
      "Workflow tooling that joins quantum jobs to classical HPC and data pipelines",
      "Training and onboarding products for engineers moving into the field",
    ],
    risks: [
      "Qiskit, Cirq and PennyLane are free and entrenched, so competing head-on is hard",
      "You depend on hardware vendors' platforms and roadmaps, and the leading qubit technology is unsettled",
      "Paying customers are few: one reading of McKinsey's data puts 2024 quantum-computing company revenue at roughly $650–750M in total",
    ],
    first30: [
      "Pick one published performance claim and reproduce it on a simulator",
      "Contribute a fix or doc improvement to an open-source quantum SDK",
      "Write up what you could and couldn't verify, then post it",
    ],
    sources: [
      { label: "Nextgov: DARPA QBI stages (Stage C = independent verification)", url: "https://www.nextgov.com/emerging-tech/2025/11/11-companies-move-second-stage-darpas-quantum-benchmarking-initiative/409405/" },
      { label: "Coverage of McKinsey's 2025 monitor (e27)", url: "https://e27.co/mckinsey-quantum-computing-20250812/" },
      { label: "Quantum talent gap, McKinsey coverage (dated; secondary)", url: "https://quantumzeitgeist.com/quantum-talents-insight-from-mckinsey/" },
    ],
  },
  {
    id: "apps", title: "Applications: your domain × quantum", stage: "Long term, highest hype risk",
    why: "If fault-tolerant machines arrive, simulating chemistry and materials is the best-motivated payoff. Nobody has yet shown a commercial advantage, so the valuable, honest work today is figuring out which problems might benefit, at what machine size, against the best classical method.",
    build: [
      "Resource-estimation studies: how many logical qubits and gates would problem X need, and when does that beat a tuned classical solver?",
      "Quantum-readiness assessments for one industry (what to monitor, what to ignore)",
      "Hybrid pipelines prototyped on simulators, always next to a strong classical baseline",
    ],
    risks: [
      "The advantage may never materialize for your domain, and classical algorithms keep improving (Tang's “dequantization” results erased some celebrated quantum-ML speedups)",
      "Long time to revenue, so plan how to stay solvent meanwhile (consulting, grants or a classical product)",
      "A quadratic speedup can vanish under error-correction overhead (Babbush et al.)",
    ],
    first30: [
      "Pick one problem from a domain you know and solve it classically first",
      "Estimate what a quantum approach would need, using published resource estimates",
      "Run the idea through the hype check below and keep the honest write-up",
    ],
    sources: [
      { label: "Babbush et al. (2021), Focus beyond quadratic speedups", url: "https://arxiv.org/abs/2011.04149" },
      { label: "Tang (2018), dequantization", url: "https://arxiv.org/abs/1807.04271" },
      { label: "Aaronson (2015), Read the fine print", url: "https://www.scottaaronson.com/papers/qml.pdf" },
    ],
  },
];

export const PATHS: { title: string; blurb: string; next: string }[] = [
  { title: "Study", blurb: "A master's or PhD in physics, CS theory or quantum information. The deepest route, and the right one if you want to do research or work on error correction.", next: "Work through Watrous's course and Nielsen & Chuang, then read two recent papers you can explain out loud." },
  { title: "Build", blurb: "Engineering roles on compilers, control software, simulators and verification, or on the cloud platforms that sit around the hardware.", next: "Finish Build Labs 1 and 2, then contribute something small to an open-source SDK." },
  { title: "Advise", blurb: "Translate between hype and reality for organizations: post-quantum migration, readiness assessments, vendor due diligence. This is where an existing consulting and data background carries the most weight.", next: "Draft a two-page migration playbook for one client scenario." },
  { title: "Found", blurb: "Start a company. The safer ideas keep their value whether or not quantum computers arrive on schedule.", next: "Interview five potential customers before writing any quantum code, and ask what they'd pay for if quantum never arrived." },
];

export const HYPE_CHECK: { id: string; q: string; why: string }[] = [
  { id: "proven", q: "Is the speedup proven, or only “the best known classical algorithm is slower”?", why: "Even Shor's algorithm is in the second category. Proven speedups, like Grover's quadratic one, are rarer and smaller." },
  { id: "io", q: "Does it survive loading the data in and reading the answer out?", why: "Data loading and readout can erase a speedup. This is the main trap in quantum machine learning claims." },
  { id: "scale", q: "Do you know the machine size it needs: logical qubits, gate count, error rate?", why: "A claim with no resource estimate can't be compared with the hardware that exists or is on a roadmap." },
  { id: "baseline", q: "Was it compared against the best, tuned classical method on the same problem?", why: "Weak baselines produce impressive-looking advantages that disappear under scrutiny." },
  { id: "verified", q: "Is the result independently verified or peer-reviewed, not just announced?", why: "A press release is not a result. Microsoft's 2025 topological-qubit announcement drew sharp expert skepticism." },
  { id: "survives", q: "Does the business still work if useful quantum computers arrive much later than promised?", why: "Post-quantum migration does. “We win when a big machine exists” bets do not." },
];

export const THINK_SOURCES: Source[] = [
  { label: "Science News: physicists mostly unconvinced by Microsoft's topological chip", url: "https://www.sciencenews.org/article/microsoft-topological-quantum-majorana" },
  { label: "IBM roadmap coverage (secondary): Starling 2029", url: "https://www.constellationr.com/insights/news/ibm-outlines-quantum-computing-roadmap-through-2029-fault-tolerant-systems" },
  { label: "NIST IR 8547 draft explainer (secondary)", url: "https://www.encryptionconsulting.com/nist-ir-8547-2030-2035-action-plan/" },
];
