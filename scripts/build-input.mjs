// Prints the consultation transcript an agent should receive: clinician messages
// interleaved with the recorded assistant replies, up to clinician turn <turn>.
// usage: node scripts/build-input.mjs <scenario> <turn> [--include-reply]
import { readdirSync, readFileSync } from "node:fs";
import { clinicianMessages } from "./clinician-messages.mjs";
const [scenario, turnArg, flag] = process.argv.slice(2);
const turn = Number(turnArg);
const root = new URL("..", import.meta.url).pathname;
const dir = `${root}traces/raw/${scenario}`;
const replies = Object.fromEntries(
  readdirSync(dir)
    .filter((f) => /-assistant-t\d+\.txt$/.test(f))
    .map((f) => [Number(f.match(/-t(\d+)\./)[1]), readFileSync(`${dir}/${f}`, "utf8").split(/^--- output ---$/m)[1].trim()]),
);
const clin = clinicianMessages(scenario);
const parts = [];
for (let t = 1; t <= turn; t++) {
  parts.push(`CLINICIAN: ${clin[t - 1].text}`);
  if (t < turn || flag === "--include-reply") parts.push(`ASSISTANT: ${replies[t]}`);
}
process.stdout.write(parts.join("\n\n") + "\n");
