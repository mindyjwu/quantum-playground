"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("qp.theme", next); } catch { /* ignore */ }
  };
  return (
    <button onClick={toggle} className="btn !min-h-9 !px-3" aria-label={theme === "dark" ? "Switch to day mode" : "Switch to space mode"} title={theme === "dark" ? "Day mode" : "Space mode"}>
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}
