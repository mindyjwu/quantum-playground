import PlayBoard from "@/components/PlayBoard";

export const metadata = { title: "Circuit Puzzles" };

export default function Page() {
  return (
    <div className="fade-in">
      <h1 className="text-3xl font-semibold sm:text-4xl">Circuit Puzzles</h1>
      <p className="mt-3 max-w-2xl text-soft">
        Reach the target quantum state using as few gates as you can. Every puzzle starts from |0…0⟩ and uses the same simulator as the Demos.
        Each one has a “par”, which is the true minimum number of gates, checked by exhaustive search.
      </p>
      <PlayBoard />
    </div>
  );
}
