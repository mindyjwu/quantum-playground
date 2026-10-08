import ResourceLibrary from "@/components/ResourceLibrary";

export const metadata = { title: "Resource Library · Quantum Playground" };

export default function Page() {
  return (
    <div className="fade-in">
      <h1 className="text-3xl font-semibold sm:text-4xl">Resource Library</h1>
      <p className="mt-3 max-w-2xl text-soft">
        A short, opinionated list of the best ways to go deeper, from a first video to the graduate textbook. Filter by format, level and cost.
      </p>
      <ResourceLibrary />
    </div>
  );
}
