// Prints the blind case record handed to downstream agents: the extractor's
// facts and unknowns only. Its `redacted` list (which contains the clinician's
// hypothesis) is deliberately dropped here. That drop is the information barrier.
// usage: node scripts/build-facts.mjs <scenario> <pre|post>
import { readFileSync } from "node:fs";
const [scenario, phase] = process.argv.slice(2);
const root = new URL("..", import.meta.url).pathname;
const file = `${root}traces/raw/${scenario}/${phase === "post" ? "55" : "45"}-extractor.txt`;
const output = readFileSync(file, "utf8").split(/^--- output ---$/m)[1].trim().replace(/^```(?:json)?\s*/, "");
// Parse the leading JSON object (the extractor may append a remark after it).
let depth = 0, inStr = false, esc = false, end = -1;
for (let i = 0; i < output.length && end < 0; i++) {
  const c = output[i];
  if (inStr) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') inStr = false; }
  else if (c === '"') inStr = true; else if (c === "{") depth++; else if (c === "}" && --depth === 0) end = i + 1;
}
const { facts, unknowns } = JSON.parse(output.slice(0, end));
const lines = (items) => items.map((x) => "  " + JSON.stringify(x)).join(",\n");
process.stdout.write(`{\n "facts": [\n${lines(facts)}\n ],\n "unknowns": [\n${lines(unknowns)}\n ]\n}\n`);
