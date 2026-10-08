export type Format = "video" | "podcast" | "article" | "book" | "course";
export type Level = "beginner" | "intermediate" | "advanced";
export type Cost = "free" | "paid";

export type Resource = {
  id: string;
  title: string;
  creator: string;
  format: Format;
  level: Level;
  cost: Cost;
  /** What it is and why it's worth your time. */
  blurb: string;
  bestFor: string;
  /** Honest limitation, prerequisite, or caveat. */
  caveat?: string;
  url: string;
  /** Where the URL came from. "search" = appeared in web search results; "memory" = recalled, least certain. */
  urlBasis: "search" | "memory";
  /** ISO date the link was last confirmed to load. Absent = unverified. Set by whoever runs `npm run check-links`. */
  verified?: string;
};

export const FORMAT_LABEL: Record<Format, string> = { video: "Video", podcast: "Podcast", article: "Article", book: "Book", course: "Course" };
export const LEVEL_LABEL: Record<Level, string> = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };
export const COST_LABEL: Record<Cost, string> = { free: "Free", paid: "Paid" };

export const RESOURCES: Resource[] = [
  {
    id: "3b1b-quantum", title: "But what is quantum computing? (Grover's algorithm)", creator: "3Blue1Brown (Grant Sanderson)",
    format: "video", level: "beginner", cost: "free",
    blurb: "A ~37-minute visual walkthrough of qubits and state vectors that builds to Grover's search algorithm, opening by debunking the “tries every answer at once” myth.",
    bestFor: "The best first video if you want intuition for amplitudes and interference.",
    caveat: "Published April 2025. A follow-up lesson clarifies a point about linearity, so watch both.",
    url: "https://www.3blue1brown.com/lessons/grover/", urlBasis: "search",
  },
  {
    id: "eater-explorable", title: "Quantum computing explorable (visualizing qubit states)", creator: "Ben Eater & Grant Sanderson",
    format: "video", level: "beginner", cost: "free",
    blurb: "An interactive explorable paired with videos on how qubit states can be visualized and manipulated.",
    bestFor: "Building hands-on intuition for single-qubit states before touching code.",
    caveat: "Least certain entry: web search could not confirm this page, so the URL is from memory. If it 404s, search for “Ben Eater quantum explorable” and tell us.",
    url: "https://eater.net/quantum", urlBasis: "memory",
  },
  {
    id: "pbs-spacetime", title: "PBS Space Time", creator: "PBS",
    format: "video", level: "beginner", cost: "free",
    blurb: "A physics channel with accessible episodes on quantum mechanics, cryptography and the quantum internet (e.g. “Why Quantum Computing Requires Quantum Cryptography”, 2019; “Solving Quantum Cryptography”, 2020).",
    bestFor: "Broad conceptual context on quantum physics and why it matters.",
    caveat: "Mostly physics, not hands-on quantum computing. We found no dedicated quantum-computing playlist, so search the channel for episodes.",
    url: "https://www.youtube.com/@pbsspacetime", urlBasis: "memory",
  },
  {
    id: "watrous-course", title: "Understanding Quantum Information and Computation", creator: "John Watrous (IBM Quantum / Qiskit)",
    format: "course", level: "intermediate", cost: "free",
    blurb: "16 lessons in four units, each pairing a video with written material: quantum information basics, algorithm fundamentals, the general formulation, and error-correction foundations. IBM describes it as roughly a one-semester advanced-undergraduate / intro-graduate course.",
    bestFor: "The most rigorous free route from “knows the basics” to real fluency. Pairs well with the Build Lab.",
    caveat: "Math-forward (linear algebra throughout). Videos are on the Qiskit YouTube channel; the written course lives on IBM Quantum Learning.",
    url: "https://quantum.cloud.ibm.com/learning/en/courses/basics-of-quantum-information", urlBasis: "search",
  },
  {
    id: "watrous-text", title: "Understanding Quantum Information and Computation (text, “Director's Cut”)", creator: "John Watrous",
    format: "book", level: "intermediate", cost: "free",
    blurb: "The written version of the Watrous course as a single PDF on arXiv.",
    bestFor: "Reading offline or searching the full text.",
    url: "https://arxiv.org/abs/2507.11536", urlBasis: "search",
  },
  {
    id: "susskind-tm", title: "The Theoretical Minimum: Quantum Mechanics", creator: "Leonard Susskind (Stanford Continuing Studies)",
    format: "course", level: "intermediate", cost: "free",
    blurb: "Lecture series that teaches the physics you need to “start doing” quantum mechanics, with the math included but kept to the essentials.",
    bestFor: "Learners who want the physics foundations behind qubits, not just the computing abstractions.",
    caveat: "Lectures are free; the companion book (Susskind & Friedman) is paid. Physics-first, not quantum-computing-first. This links to the site's home page, where the quantum mechanics course is listed.",
    url: "https://theoreticalminimum.com/", urlBasis: "search",
  },
  {
    id: "mit-804", title: "8.04 Quantum Physics I (Spring 2016)", creator: "MIT OpenCourseWare (Barton Zwiebach)",
    format: "course", level: "intermediate", cost: "free",
    blurb: "A full undergraduate quantum mechanics course: the experimental basis of quantum physics, wave mechanics, and the Schrödinger equation in one and three dimensions. Lecture notes, problem sets and exams are included.",
    bestFor: "A university-grade physics foundation if you're considering a formal study path.",
    caveat: "Wave-mechanics based, so it does not cover qubits or circuits. Expect calculus-level prerequisites. Video lectures are linked separately from the course page.",
    url: "https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/", urlBasis: "search",
  },
  {
    id: "mindscape", title: "Sean Carroll's Mindscape", creator: "Sean Carroll",
    format: "podcast", level: "intermediate", cost: "free",
    blurb: "Long-form interviews across science and ideas, with several quantum episodes, including #99 with Scott Aaronson on complexity, computers and quantum gravity.",
    bestFor: "Deep conversations with researchers; good for forming your own opinions on the field's hype and substance.",
    caveat: "Broad show, so search for quantum episodes. Link goes to the show's hub page (URL from memory).",
    url: "https://www.preposterousuniverse.com/podcast/", urlBasis: "memory",
  },
  {
    id: "quanta-joy-of-why", title: "The Joy of Why (Quanta Magazine podcast)", creator: "Steven Strogatz & Janna Levin",
    format: "podcast", level: "beginner", cost: "free",
    blurb: "Interviews on open questions in science and math. The April 2025 episode “What Is the True Promise of Quantum Computing?” discusses how hard it has been to find problems where quantum machines clearly win, including Ewin Tang's work.",
    bestFor: "A sober, expert take on what quantum computers might actually be good for.",
    caveat: "Quantum is one topic among many. Link goes to the podcast hub (URL from memory).",
    url: "https://www.quantamagazine.org/podcasts/", urlBasis: "memory",
  },
  {
    id: "physics-world-weekly", title: "Physics World Weekly", creator: "Physics World (Institute of Physics)",
    format: "podcast", level: "intermediate", cost: "free",
    blurb: "Weekly interviews on new physics research with frequent quantum technology episodes (e.g. topological phases and error correction, quantum simulators, quantum materials).",
    bestFor: "Keeping up with what researchers are working on right now.",
    caveat: "Link goes to the show's introductory post (the page web search returned). Find current episodes via the Physics World site or your podcast app.",
    url: "https://physicsworld.com/a/introducing-physics-world-weekly-podcast/", urlBasis: "search",
  },
  {
    id: "quantum-country", title: "Quantum Country", creator: "Michael Nielsen & Andy Matuschak",
    format: "article", level: "intermediate", cost: "free",
    blurb: "A free essay series (starting with “Quantum computing for the very curious”) using a “mnemonic medium”: embedded review questions plus emailed spaced-repetition reminders so you actually retain what you read.",
    bestFor: "Learners who want to remember the material, not just read it. Needs basic linear algebra.",
    caveat: "The retention emails require an account. The reading itself is free.",
    url: "https://quantum.country/", urlBasis: "search",
  },
  {
    id: "nielsen-chuang", title: "Quantum Computation and Quantum Information (10th Anniversary Edition)", creator: "Michael Nielsen & Isaac Chuang",
    format: "book", level: "advanced", cost: "paid",
    blurb: "The standard graduate textbook, covering algorithms, teleportation, cryptography and error correction (702 pages; Cambridge University Press, ISBN 9781107002173).",
    bestFor: "A serious study path or becoming the person who can read the original papers.",
    caveat: "Dense and mathematical, and not a casual read. Price and availability vary by retailer and region. The link goes to a Cambridge bookshop listing (UK delivery only for that shop).",
    url: "https://www.cambridgebookshop.co.uk/products/quantum-computation-and-quantum-information-10th-anniversary-edition", urlBasis: "search",
  },
];
