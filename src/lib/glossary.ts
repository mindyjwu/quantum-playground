import { GLOSSARY } from "@/data/glossary";

export type Segment = { type: "text"; text: string } | { type: "term"; text: string; id: string };

const norm = (s: string) => s.toLowerCase().replace(/[’‘]/g, "'");
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&").replace(/'/g, "['’]").replace(/\s+/g, "\\s+");

/** One pattern for every wording, longest first so “Grover's algorithm” wins over “Grover”. Case-insensitive, whole words only. */
const lookup = new Map<string, string>();
const parts: { alias: string; pattern: string }[] = [];
for (const t of GLOSSARY) for (const m of t.match) {
  lookup.set(norm(m).replace(/\s+/g, " "), t.id);
  // A guard such as (?<!\b(?:a|an)\s) stops "a bit like" from being read as the unit "bit".
  const guard = t.avoidAfter?.length ? `(?<!\\b(?:${t.avoidAfter.join("|")})\\s)` : "";
  parts.push({ alias: m, pattern: guard + escape(m) });
}
parts.sort((a, b) => b.alias.length - a.alias.length);
const PATTERN = `(?<![\\p{L}\\p{N}_])(?:${parts.map((p) => p.pattern).join("|")})(?![\\p{L}\\p{N}_])`;

/**
 * Splits blocks of text into plain and term segments. Each term is marked only the first time it appears across all the blocks
 * (pass a lesson's paragraphs together), so the page doesn't fill up with underlines. Joining a block's segments always gives back the original text.
 */
export function annotateBlocks(blocks: string[]): Segment[][] {
  const seen = new Set<string>();
  return blocks.map((text) => {
    const out: Segment[] = [];
    const re = new RegExp(PATTERN, "giu");
    let last = 0, m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      const id = lookup.get(norm(m[0]).replace(/\s+/g, " "));
      if (!id || seen.has(id)) continue;
      seen.add(id);
      if (m.index > last) out.push({ type: "text", text: text.slice(last, m.index) });
      out.push({ type: "term", text: m[0], id });
      last = m.index + m[0].length;
    }
    if (last < text.length) out.push({ type: "text", text: text.slice(last) });
    return out.length ? out : [{ type: "text", text }];
  });
}
