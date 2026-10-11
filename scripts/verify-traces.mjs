// Re-verifies every recorded agent call in traces/raw:
//   - it ran on the model the protocol specifies
//   - it called no tools
//   - its input is exactly what the protocol says it should have received,
//     rebuilt from the events recorded before it
// Exits non-zero on any mismatch. Run with `npm run verify`.
import { readdirSync, readFileSync } from "node:fs";
import { expectedInput, EXPECTED_MODEL } from "./expected-input.mjs";

const root = new URL("..", import.meta.url).pathname;
const rawDir = `${root}traces/raw`;
let failures = 0, checked = 0;

for (const scenario of readdirSync(rawDir)) {
  const dir = `${rawDir}/${scenario}`;
  for (const file of readdirSync(dir).filter((f) => /^\d+-.*\.txt$/.test(f)).sort()) {
    const text = readFileSync(`${dir}/${file}`, "utf8");
    const [header, rest] = text.split(/^--- input ---$/m);
    const input = rest.split(/^--- output ---$/m)[0].trim();
    const h = Object.fromEntries(header.trim().split("\n").map((l) => [l.slice(0, l.indexOf(":")).trim(), l.slice(l.indexOf(":") + 1).trim()]));
    const problems = [];
    if (h.model !== EXPECTED_MODEL(h.agent)) problems.push(`model ${h.model}`);
    if (h.tools_used !== "none") problems.push(`tools used: ${h.tools_used}`);
    if (expectedInput({ scenario, agent: h.agent, turn: h.turn, round: h.round, note: h.note }) !== input) problems.push("input differs from protocol");
    checked++;
    if (problems.length) {
      failures++;
      console.error(`FAIL ${scenario}/${file}: ${problems.join("; ")}`);
    }
  }
}
console.log(`${checked} agent calls checked, ${failures} failed`);
process.exit(failures ? 1 : 0);
