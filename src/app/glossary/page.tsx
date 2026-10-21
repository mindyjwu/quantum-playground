import GlossaryList from "@/components/GlossaryList";

export const metadata = { title: "Glossary", description: "Plain-English definitions of the quantum computing terms used on Quantum Playground." };

export default function Page() {
  return (
    <div className="fade-in">
      <h1 className="text-3xl font-semibold sm:text-4xl">Glossary</h1>
      <p className="mt-3 max-w-2xl text-soft">Plain-English definitions for the jargon you'll meet on this site. On the Learn page you can also tap a dotted word to see its definition in place.</p>
      <GlossaryList />
    </div>
  );
}
