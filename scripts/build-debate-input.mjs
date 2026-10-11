// Prints debate inputs (docs/PROTOCOL.md step 4). Advocates and the judge see
// only the blind case record (facts_pre) and the arguments, never the transcript.
//   node scripts/build-debate-input.mjs <scenario> advocate <X|Y> <1|2>
//   node scripts/build-debate-input.mjs <scenario> judge [swapped]
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
const [scenario, role, a, b] = process.argv.slice(2);
const root = new URL("..", import.meta.url).pathname;
const dir = `${root}traces/raw/${scenario}`;
const debate = JSON.parse(readFileSync(`${dir}/debate.json`, "utf8"));
const record = execFileSync("node", [`${root}scripts/build-facts.mjs`, scenario, "pre"], { encoding: "utf8" }).trim();
const dx = { X: debate.positionX, Y: debate.positionY };
const seq = { X: { 1: 61, 2: 63 }, Y: { 1: 62, 2: 64 } };
const out = (n) => {
  const f = readdirSync(dir).find((f) => f.startsWith(`${n}-`));
  return readFileSync(`${dir}/${f}`, "utf8").split(/^--- output ---$/m)[1].trim();
};
let text;
if (role === "advocate") {
  const side = a, round = Number(b), other = side === "X" ? "Y" : "X";
  text = `Case record:\n\n${record}\n\n`;
  if (round === 1) {
    text += `Round 1 (opening). Your assigned diagnosis: ${dx[side]}.\n\nMake your case as specified.`;
  } else {
    text += `Round 2 (rebuttal). Your assigned diagnosis: ${dx[side]}.\n\nThe opposing advocate's opening, arguing for ${dx[other]}:\n\n${out(seq[other][1])}\n\nWrite your rebuttal as specified.`;
  }
} else {
  const labels = a === "swapped" ? { A: debate.labels.B, B: debate.labels.A } : debate.labels;
  text = `Case record:\n\n${record}\n\n`;
  for (const L of ["A", "B"]) {
    const side = labels[L];
    text += `Position ${L}: ${dx[side]}\n\nOpening:\n\n${out(seq[side][1])}\n\nRebuttal:\n\n${out(seq[side][2])}\n\n`;
  }
  text += "Give your verdict as specified.";
}
process.stdout.write(text + "\n");
