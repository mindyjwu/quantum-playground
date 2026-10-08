import Link from "next/link";
import { HomeProgress } from "@/components/Progress";
import { REAL_WORLD } from "@/data/realworld";
import { RESOURCES } from "@/data/resources";

const SECTIONS = [
  { href: "/learn", title: "Learning Path", tag: "4 stages · quizzes", text: "Foundations → Qubits & Gates → Algorithms → Real-World Applications, with the actual math and a progress tracker." },
  { href: "/demos", title: "Interactive Demos", tag: "4 simulators", text: "Rotate a qubit on the Bloch sphere, measure it, entangle a Bell pair, and wire your own circuit." },
  { href: "/build-lab", title: "Build Lab", tag: "4 hands-on labs", text: "Run a circuit on real IBM hardware, test a Bell inequality, and try Cirq and PennyLane. Starter code included." },
  { href: "/think-bigger", title: "Think Bigger", tag: "opportunities · your goals", text: "Where the field is heading, where the opportunities are, a hype check, and a space for your own quantum goals." },
  { href: "/resources", title: "Resource Library", tag: `${RESOURCES.length} curated picks`, text: "Videos, courses, podcasts and books, filterable by format, level and cost." },
  { href: "/real-world", title: "Quantum in the Real World", tag: `${REAL_WORLD.length} technologies`, text: "What's already in your pocket, what's emerging, and what's still experimental — with the caveats." },
];

export default function Home() {
  return (
    <div className="fade-in space-y-10">
      <section className="pt-4">
        <p className="mb-3 text-sm font-medium tracking-wide text-teal uppercase">Learn it · Simulate it · See what's real</p>
        <h1 className="max-w-3xl text-4xl leading-tight font-semibold sm:text-5xl">
          A quantum playground for people who build things.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-soft">
          You already think in data and systems. This is a hands-on way to see how qubits work, what quantum technology actually does today,
          and where a career or company could plug in, without the hype.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/learn" className="btn btn-primary">Start the learning path</Link>
          <Link href="/demos" className="btn">Jump to the demos</Link>
        </div>
      </section>

      <HomeProgress />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href} className="card group p-5 transition-colors hover:border-accent">
            <p className="text-xs text-muted">{s.tag}</p>
            <h2 className="mt-1 text-xl font-semibold group-hover:text-accent">{s.title}</h2>
            <p className="mt-2 text-sm text-soft">{s.text}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
