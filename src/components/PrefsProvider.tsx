"use client";
import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { DEFAULT_PREFS, PREFS_KEY, normalizePrefs, type Prefs } from "@/lib/prefs";

type Ctx = { prefs: Prefs; ready: boolean; setPrefs: (patch: Partial<Prefs>) => void };
const PrefsContext = createContext<Ctx>({ prefs: DEFAULT_PREFS, ready: false, setPrefs: () => {} });

/** One shared copy of the visitor's preferences, so the header and the page stay in sync. */
export function PrefsProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw, ready] = useLocalStorage<Prefs>(PREFS_KEY, DEFAULT_PREFS);
  const prefs = useMemo(() => normalizePrefs(raw), [raw]);
  const setPrefs = useCallback((patch: Partial<Prefs>) => setRaw((prev) => normalizePrefs({ ...normalizePrefs(prev), ...patch })), [setRaw]);
  const value = useMemo(() => ({ prefs, ready, setPrefs }), [prefs, ready, setPrefs]);
  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export const usePrefs = () => useContext(PrefsContext);
