import type { Cost, Format, Level, Resource } from "@/data/resources";

export type Filters = { formats: Format[]; levels: Level[]; cost: Cost | "all"; query: string };
export const NO_FILTERS: Filters = { formats: [], levels: [], cost: "all", query: "" };

/** An empty format/level list means “any”. Query matches title, creator and blurb (case-insensitive). */
export function filterResources(items: Resource[], f: Filters): Resource[] {
  const q = f.query.trim().toLowerCase();
  return items.filter((r) =>
    (f.formats.length === 0 || f.formats.includes(r.format)) &&
    (f.levels.length === 0 || f.levels.includes(r.level)) &&
    (f.cost === "all" || r.cost === f.cost) &&
    (q === "" || `${r.title} ${r.creator} ${r.blurb}`.toLowerCase().includes(q)),
  );
}
