"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const LINKS = [
  { href: "/learn", label: "Learn" },
  { href: "/demos", label: "Demos" },
  { href: "/real-world", label: "Real World" },
  { href: "/build-lab", label: "Build Lab" },
  { href: "/resources", label: "Resources" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 sm:flex-nowrap sm:px-6">
        <Link href="/" className="mr-auto font-serif text-lg font-semibold">
          Quantum <span className="text-accent">Playground</span>
        </Link>
        <nav aria-label="Main" className="order-last -mx-1 flex w-full items-center gap-0 overflow-x-auto sm:order-none sm:mx-0 sm:w-auto sm:gap-1">
          {LINKS.map((l) => {
            const active = path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-2 py-2 text-sm whitespace-nowrap sm:px-3 transition-colors ${active ? "bg-card2 text-ink" : "text-soft hover:text-ink"}`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
