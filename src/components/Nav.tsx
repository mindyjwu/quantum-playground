"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

const LINKS = [
  { href: "/learn", label: "Learn" },
  { href: "/demos", label: "Demos" },
  { href: "/real-world", label: "Real World" },
  { href: "/build-lab", label: "Build Lab" },
  { href: "/resources", label: "Resources" },
  { href: "/think-bigger", label: "Think Bigger" },
];

export default function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]); // close the mobile menu after navigating

  const item = (l: { href: string; label: string }, block: boolean) => {
    const active = path.startsWith(l.href);
    return (
      <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined}
        className={`rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors ${block ? "block" : ""} ${active ? "bg-card2 text-ink" : "text-soft hover:text-ink"}`}>
        {l.label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="mr-auto font-serif text-lg font-semibold whitespace-nowrap"><span aria-hidden="true" className="mr-1.5 text-accent">✦</span>Quantum <span className="text-accent">Playground</span></Link>
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">{LINKS.map((l) => item(l, false))}</nav>
        <ThemeToggle />
        <button className="btn !min-h-9 !px-3 lg:!hidden" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((o) => !o)}>
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <nav id="mobile-menu" aria-label="Main" className="fade-in border-t border-line px-4 pb-3 lg:hidden">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-1 pt-2">{LINKS.map((l) => item(l, true))}</div>
        </nav>
      )}
    </header>
  );
}
