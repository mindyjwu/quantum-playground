#!/usr/bin/env node
/**
 * Verifies every external URL in src/data/*.ts.
 * Usage: node scripts/check-links.mjs [extra-url ...]
 * Exit code 1 if any link fails. Needs outbound internet (it can't run in a locked-down sandbox).
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = new URL("../src/data/", import.meta.url).pathname;
const found = new Map(); // url -> files
for (const f of readdirSync(dir).filter((x) => x.endsWith(".ts"))) {
  for (const m of readFileSync(join(dir, f), "utf8").matchAll(/https?:\/\/[^"'`\s)]+/g)) {
    const u = m[0].replace(/[.,;]+$/, "");
    found.set(u, [...(found.get(u) ?? []), f]);
  }
}
for (const u of process.argv.slice(2)) found.set(u, ["(cli)"]);

const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
async function check(url) {
  for (const method of ["HEAD", "GET"]) { // some sites reject HEAD
    try {
      const res = await fetch(url, { method, redirect: "follow", headers: { "user-agent": UA, accept: "text/html,*/*" }, signal: AbortSignal.timeout(20000) });
      if (res.ok) return { ok: true, status: res.status, final: res.url };
      // Some publishers block scripts (401/403/429). That says nothing about whether the page exists, so warn instead of failing.
      if (method === "GET" && [401, 403, 429].includes(res.status)) return { ok: true, warn: true, status: res.status };
      if (method === "GET" || res.status === 404 || res.status === 410) return { ok: false, status: res.status };
    } catch (e) {
      if (method === "GET") return { ok: false, status: String(e.cause?.code ?? e.name) };
    }
  }
  return { ok: false, status: "?" };
}

const urls = [...found.keys()];
const results = new Array(urls.length);
let next = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (next < urls.length) { const i = next++; results[i] = await check(urls[i]); }
}));

let bad = 0, warned = 0;
urls.forEach((u, i) => {
  const r = results[i];
  if (!r.ok) bad++;
  if (r.warn) warned++;
  const tag = !r.ok ? "FAIL" : r.warn ? "WARN" : "OK  ";
  console.log(`${tag} ${String(r.status).padEnd(5)} ${u}${r.ok && r.final && r.final !== u ? `  -> ${r.final}` : ""}`);
});
console.log(`\n${urls.length - bad - warned}/${urls.length} links OK` + (warned ? `, ${warned} blocked the checker (WARN: open in a browser to confirm)` : "") + (bad ? `, ${bad} FAILED` : ""));
if (warned / urls.length > 0.25) {
  // A few blocked links is normal (some publishers reject scripts). Most blocked means we're offline, behind a proxy or rate-limited.
  console.log("\nMost links were blocked, so these results are NOT meaningful. Check your connection / network policy and try again.");
  process.exit(2);
}
process.exit(bad ? 1 : 0);
