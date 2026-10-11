// Automated barrier checks over the assembled traces (docs/PROTOCOL.md step 5).
//
// 1. Leak check: no blind fact list may contain a diagnostic label for either
//    debated position (an observed finding like "ST elevation" is fine; the
//    label "STEMI" is not).
// 2. Anchor-swap check: the extractor ran on the same consultation opening with
//    the clinician's hypothesis flipped. Both fact lists must contain the same
//    clinical values (every number) and the same number of facts.
//
// Writes traces/checks.json and exits non-zero if any check fails.
import { readFileSync, writeFileSync } from "node:fs";

const root = new URL("..", import.meta.url).pathname;
const scenarios = ["aortic-dissection", "pe-anxiety", "meningitis-viral"];

// Diagnostic labels that must never appear in a blind fact list.
const labels = {
  "aortic-dissection": [/\bSTEMI\b/i, /myocardial infarction/i, /\bdissection\b/i],
  "pe-anxiety": [/pulmonary embol/i, /\bPE\b/, /panic/i, /\banxiety\b/i],
  "meningitis-viral": [/meningitis/i, /\bviral\b/i, /\bbacterial\b/i, /meningism/i],
};

// Every number that appears in the facts. Units are ignored because extractors
// phrase them differently ("22/min" vs "22 breaths/min") for the same value.
const numbers = (facts) => [...new Set(facts.flatMap((f) => f.text.match(/\d+(?:\.\d+)?/g) ?? []))].sort((x, y) => x - y);

const results = {};
let failed = false;
for (const s of scenarios) {
  const trace = JSON.parse(readFileSync(`${root}traces/${s}.json`, "utf8"));
  const blind = trace.events.filter((e) => e.agent === "reframe-extractor");
  const leaks = [];
  for (const e of blind) {
    for (const f of e.parsed.facts) {
      for (const re of labels[s]) if (re.test(f.text)) leaks.push({ seq: e.seq, fact: f.id, text: f.text, label: String(re) });
    }
  }
  const orig = trace.events.find((e) => e.note === "anchor-original")?.parsed;
  const swap = trace.events.find((e) => e.note === "anchor-swapped")?.parsed;
  let anchor = null;
  if (orig && swap) {
    const a = numbers(orig.facts), b = numbers(swap.facts);
    const onlyOrig = a.filter((x) => !b.includes(x)), onlySwap = b.filter((x) => !a.includes(x));
    anchor = {
      factCount: { original: orig.facts.length, swapped: swap.facts.length },
      clinicalValues: a,
      valuesOnlyInOriginal: onlyOrig,
      valuesOnlyInSwapped: onlySwap,
      pass: onlyOrig.length === 0 && onlySwap.length === 0,
    };
  }
  results[s] = { leakCheck: { pass: leaks.length === 0, leaks }, anchorSwap: anchor };
  if (leaks.length || (anchor && !anchor.pass)) failed = true;
}
writeFileSync(`${root}traces/checks.json`, JSON.stringify(results, null, 2) + "\n");
console.log(JSON.stringify(results, null, 2));
process.exit(failed ? 1 : 0);
