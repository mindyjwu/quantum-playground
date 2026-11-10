/**
 * Guided tours. Each step opens a page, highlights one thing, and says what to do and what it means.
 * Written for a curious high-schooler: short sentences, no formulas, every new word explained on the spot.
 */
export type TourStep = {
  path: string;
  /** CSS selectors to highlight, tried in order; the first one that is visible wins. Omit for a step with no highlight. */
  sel?: string[];
  title: string;
  text: string;
  /** One concrete thing to click or drag. */
  tryIt?: string;
};

export type Tour = {
  id: string;
  title: string;
  minutes: number;
  /** One line: what this tour is for. */
  blurb: string;
  /** What you will be able to say or do afterwards. */
  learn: string[];
  steps: TourStep[];
};

export const TOURS: Tour[] = [
  {
    id: "start",
    title: "Find your way around",
    minutes: 2,
    blurb: "A quick look at every part of the site, so you know where to go next.",
    learn: ["Where the lessons, demos and puzzles live", "How to set the site to your level", "What to do when you hit a word you don't know"],
    steps: [
      {
        path: "/", sel: ['section[aria-labelledby="start-title"]', 'section[aria-labelledby="path-title"]'],
        title: "First, pick your level",
        text: "The site can explain things three ways: Beginner (no physics or math needed), Intermediate, or Expert. Your choice changes how lessons are written and which puzzles you see first.",
        tryIt: "Choose Beginner if this is all new to you. You can change it any time.",
      },
      {
        path: "/", sel: ['section[aria-labelledby="const-title"]'],
        title: "Your star map",
        text: "Every lesson you read, quiz you pass and puzzle you solve lights up a star here. It is saved only in this browser, so there is no account and no login.",
      },
      {
        path: "/learn", sel: ['[role="tablist"][aria-label="Stages"]'],
        title: "Learn: short lessons, in order",
        text: "Four stages take you from \"what is quantum?\" to real uses. Each lesson starts in plain language. The math is tucked behind a button, so you only open it if you want it.",
        tryIt: "Click a stage to see its lessons. Each stage ends with a short quiz.",
      },
      {
        path: "/demos", sel: ["#bloch"],
        title: "Demos: learn by poking things",
        text: "Five small simulators run right in your browser. You press buttons and watch what a qubit (a quantum bit) does. Nothing can break, so try everything.",
      },
      {
        path: "/play", sel: ['ol[aria-label="Puzzles"]'],
        title: "Play: puzzles with stars",
        text: "Each puzzle gives you a goal and a few building blocks called gates. Solve it with as few gates as you can to earn three stars.",
      },
      {
        path: "/glossary", sel: ["h1"],
        title: "Stuck on a word?",
        text: "Words with a dotted underline explain themselves when you tap them. This page lists every one of those words in plain English.",
        tryIt: "Next, try the tour \"Meet a qubit\". It takes about three minutes.",
      },
    ],
  },
  {
    id: "qubit",
    title: "Meet a qubit",
    minutes: 3,
    blurb: "See what makes a quantum bit different from the 0s and 1s in your phone.",
    learn: ["The difference between a bit and a qubit", "What \"superposition\" means", "Why measuring a qubit gives a random answer"],
    steps: [
      {
        path: "/demos", sel: ["#bloch"],
        title: "A qubit is an arrow on a ball",
        text: "A normal bit is a switch: 0 or 1. A qubit is more like an arrow that can point anywhere on this ball. Pointing straight up means 0. Pointing straight down means 1.",
      },
      {
        path: "/demos", sel: ['[aria-label="Apply gates"]'],
        title: "Gates move the arrow",
        text: "A gate is a simple instruction that turns the arrow. The X gate flips it upside down, so 0 becomes 1. The H gate tips it onto its side, halfway between 0 and 1.",
        tryIt: "Press \"Reset |0⟩\" so the arrow points up. Press \"Apply X\" and watch it flip. Reset again, then press \"Apply H\".",
      },
      {
        path: "/demos", sel: ['[aria-label="Measurement probabilities"]'],
        title: "Halfway is called superposition",
        text: "After H, these bars read 50% and 50%. The qubit is not secretly 0 or secretly 1. It is in a blend of both, called a superposition, and the bars show the chance of each answer if you look.",
      },
      {
        path: "/demos", sel: ["#measure"],
        title: "Looking gives one answer",
        text: "When you measure a qubit you never see a blend. You get a plain 0 or a plain 1, picked at random. The percentages only show up when you repeat the experiment many times.",
        tryIt: "Press \"|+⟩\" to make a 50/50 qubit. Press \"Measure ×1\" a few times, then \"Measure ×1000\".",
      },
      {
        path: "/demos", sel: ['[aria-label="Observed frequencies"]', "#measure"],
        title: "What you just learned",
        text: "A qubit can be in a blend of 0 and 1. Gates change the blend. Measuring gives one random answer, and repeating reveals the odds. Those three ideas are the base of everything else here.",
        tryIt: "Next tour: \"Two qubits that act as one\".",
      },
    ],
  },
  {
    id: "entangle",
    title: "Two qubits that act as one",
    minutes: 3,
    blurb: "Build an entangled pair and see what it can, and can't, do.",
    learn: ["What entanglement is", "How to make it with two gates", "Why it does not let you send messages faster than light"],
    steps: [
      {
        path: "/demos", sel: ["#bell"],
        title: "Start with two plain qubits",
        text: "Both qubits begin at 0. We will link them in two moves. The steps are listed on the left of this demo.",
        tryIt: "Click \"Apply H to q0\". The first qubit becomes a 50/50 blend. The second is still 0.",
      },
      {
        path: "/demos", sel: ["#bell"],
        title: "Now link them",
        text: "The CNOT gate says: flip the second qubit only if the first one is 1. Because the first is a blend of 0 and 1, the pair becomes a blend of \"both 0\" and \"both 1\". That linked state is called entanglement.",
        tryIt: "Click \"Apply CNOT (q0 → q1)\".",
      },
      {
        path: "/demos", sel: ['[aria-label="Measurement results"]', "#bell"],
        title: "They always agree",
        text: "Measure the pair. Each result is random, but the two qubits always match: 00 or 11, never 01 or 10. Neither qubit had a set value beforehand, yet they agree every time.",
        tryIt: "Press \"×20\" and look for a 01 or a 10. You won't find one.",
      },
      {
        path: "/demos", sel: ["#bell"],
        title: "What it does not mean",
        text: "This is not a way to send messages instantly. Each person just sees random 0s and 1s. The matching only shows up later, when they compare notes in the ordinary way. Read the \"Read this carefully\" box in this demo.",
      },
      {
        path: "/demos", sel: ["#circuit"],
        title: "Build it yourself",
        text: "This is a circuit builder. Each line is a qubit, and you place gates on it from left to right, like notes on sheet music.",
        tryIt: "Click the \"Bell state\" example. It loads the same H then CNOT you just used.",
      },
    ],
  },
  {
    id: "noise",
    title: "Why quantum computers make mistakes",
    minutes: 2,
    blurb: "Turn on noise and watch a perfect result fall apart.",
    learn: ["What \"noise\" means for a quantum computer", "How to read a fidelity score", "Why today's machines are small and error-prone"],
    steps: [
      {
        path: "/demos", sel: ["#circuit"],
        title: "Start with a perfect circuit",
        text: "So far every gate worked perfectly. Real qubits are fragile: heat, stray signals and imperfect controls nudge them off course. Engineers call all of that noise.",
        tryIt: "Click the \"Bell state\" example so there is a circuit to test.",
      },
      {
        path: "/demos", sel: ["#noise-slider"],
        title: "Add some noise",
        text: "This slider sets how often a gate goes wrong. At zero, the Bell state only ever gives 00 or 11. Slide it up and wrong answers (01 and 10) start to appear.",
        tryIt: "Drag the slider to the right, or press the \"5%\" button.",
      },
      {
        path: "/demos", sel: ['[data-testid="fidelity"]', "#noise-slider"],
        title: "Fidelity: a score out of 100%",
        text: "Fidelity tells you how close the noisy result is to the perfect one. 100% is perfect. More gates and more noise both pull the score down.",
      },
      {
        path: "/demos", sel: ['[aria-label="Counts from 1000 shots"]', "#circuit"],
        title: "Run it 1000 times",
        text: "On a real machine you run the same circuit many times. Each run is called a shot. You then count the answers. With noise on, some shots land on answers that should be impossible.",
        tryIt: "Press \"Run 1000 shots\" and compare the counts with noise at 0 and at 5%.",
      },
      {
        path: "/real-world", sel: ['[aria-label="Filter by maturity"]'],
        title: "Why this matters",
        text: "Noise is the main reason useful quantum computers are hard to build. Fixing errors takes many extra qubits. This page shows honestly which quantum technologies work today and which are still experiments.",
      },
    ],
  },
  {
    id: "spy",
    title: "Catch a spy with physics",
    minutes: 3,
    blurb: "Share a secret key and see why an eavesdropper can't hide.",
    learn: ["How two people can agree on a secret key using qubits", "Why listening in leaves fingerprints", "What this demo leaves out compared with real systems"],
    steps: [
      {
        path: "/demos", sel: ["#bb84"],
        title: "Alice, Bob and a secret",
        text: "Alice wants to share a secret key (a string of random 0s and 1s) with Bob. She sends it as qubits. For each one she secretly picks one of two ways to write it, called a basis.",
        tryIt: "Press \"1. Alice sends\", then \"2. Bob measures\".",
      },
      {
        path: "/demos", sel: ["#bb84"],
        title: "Keep only the matching rounds",
        text: "Bob has to guess which basis to read each qubit in. A right guess gives him Alice's bit. A wrong guess gives him a coin flip. Afterwards they tell each other the bases (not the bits) and keep only the rounds that matched.",
        tryIt: "Press \"3. Compare bases\". About half the rounds survive.",
      },
      {
        path: "/demos", sel: ['[data-testid="bb84-summary"]', "#bb84"],
        title: "Check for errors",
        text: "They read some of their kept bits out loud to compare. With nobody listening, those bits always agree, so the error rate is 0%.",
        tryIt: "Press \"4. Check for a spy\" and read the error rate.",
      },
      {
        path: "/demos", sel: ["#bb84"],
        title: "Now add a spy",
        text: "Eve tries to read the qubits on the way. She has to guess the basis too, and each wrong guess scrambles the qubit. That shows up as errors: about one compared bit in four no longer matches.",
        tryIt: "Tick the box that says Eve intercepts, then press \"4. Check for a spy\" again.",
      },
      {
        path: "/demos", sel: ['[data-testid="bb84-verdict"]', "#bb84"],
        title: "What you just learned",
        text: "Measuring a qubit disturbs it, so spying leaves evidence. That is the idea behind quantum key distribution. In a short run a spy can still get lucky, and real systems need extra steps this demo skips. The demo tells you when that happens.",
      },
    ],
  },
  {
    id: "puzzle",
    title: "Solve your first puzzle",
    minutes: 2,
    blurb: "Use one gate to hit a target and earn your first stars.",
    learn: ["How to read a puzzle's goal", "How to place and remove gates", "What \"par\" and the stars mean"],
    steps: [
      {
        path: "/play", sel: ['[role="group"][aria-label="Puzzle level"]'],
        title: "Pick a level",
        text: "Puzzles come in three levels. Beginner puzzles need only one or two gates.",
        tryIt: "Choose Beginner, then the first puzzle, \"Flip the switch\".",
      },
      {
        path: "/play", sel: ['aside[aria-label="Puzzle target and status"]'],
        title: "Read the goal",
        text: "This panel shows what you are aiming for. The bars are your circuit's results. The small tick marks are the target. You win when the bars reach the ticks.",
      },
      {
        path: "/play", sel: ['[data-testid="gate-count"]', 'ol[aria-label="Puzzles"]'],
        title: "Place a gate",
        text: "Tap a gate, then tap an empty slot on the qubit's line. Tap a placed gate to remove it. For \"Flip the switch\" you need the gate that turns 0 into 1.",
        tryIt: "Tap X, then tap the first slot. Stuck? Hints never cost stars.",
      },
      {
        path: "/play", sel: ['ol[aria-label="Puzzles"]'],
        title: "Stars and par",
        text: "Par is the smallest number of gates that can solve the puzzle. Match par for three stars. Then try \"Spooky twins\", where you build an entangled pair on your own.",
      },
    ],
  },
  {
    id: "future",
    title: "What is quantum good for?",
    minutes: 3,
    blurb: "Sort what's real today from what's still a promise.",
    learn: ["Which quantum technologies you already use", "How to tell a fact from a forecast", "How to write down your own next step"],
    steps: [
      {
        path: "/real-world", sel: ['[aria-label="Filter by maturity"]'],
        title: "Real today, or still a promise?",
        text: "Every technology here is tagged: In use today, Emerging, or Experimental. Lasers, MRI scanners and the atomic clocks behind GPS already depend on quantum physics. Large quantum computers are not here yet.",
        tryIt: "Click each filter and open a card. Each one has a \"caveat\": the honest catch.",
      },
      {
        path: "/think-bigger", sel: ['section[aria-labelledby="state"]'],
        title: "Facts come with labels",
        text: "This page marks each claim by type: scheduled, a company's own target, a forecast, or something reported. A company's roadmap is a plan, not a promise.",
      },
      {
        path: "/think-bigger", sel: ['section[aria-labelledby="hype"]'],
        title: "A hype checker",
        text: "Saw an exciting quantum headline? Answer these questions about it. They help you spot the difference between a real result and marketing.",
        tryIt: "Think of a headline you've seen and answer the first two questions.",
      },
      {
        path: "/think-bigger", sel: ['section[aria-labelledby="goals"]'],
        title: "Write down your next step",
        text: "This space is yours. Add a goal, give it a date, and jot notes. It is saved only in this browser, and you can download it as a file.",
        tryIt: "Add one small goal, like \"finish the Beginner puzzles this week\".",
      },
    ],
  },
];

export const tourById = (id: string | null | undefined): Tour | undefined => TOURS.find((t) => t.id === id);
