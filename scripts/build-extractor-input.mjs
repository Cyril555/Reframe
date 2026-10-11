// Extractor inputs for the post-evidence update and the anchor-swap check
// (docs/PROTOCOL.md steps 2 and 5).
//   node scripts/build-extractor-input.mjs <scenario> post
//   node scripts/build-extractor-input.mjs <scenario> anchor <original|swapped>
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { clinicianMessages } from "./clinician-messages.mjs";
const [scenario, mode, variant] = process.argv.slice(2);
const root = new URL("..", import.meta.url).pathname;
const dir = `${root}traces/raw/${scenario}`;
const out = (f) => readFileSync(`${dir}/${f}`, "utf8").split(/^--- output ---$/m)[1].trim();
let text;
if (mode === "post") {
  const record = execFileSync("node", [`${root}scripts/build-facts.mjs`, scenario, "pre"], { encoding: "utf8" }).trim();
  text =
    `Existing case record, extracted earlier in this consultation:\n\n${record}\n\n` +
    `New part of the consultation:\n\nCLINICIAN: ${clinicianMessages(scenario)[4].text}\n\nASSISTANT: ${out("50-assistant-t5.txt")}\n\n` +
    `Produce the updated neutral case record as specified. Keep existing fact and unknown IDs unchanged, add new facts with new IDs, and remove any unknown that has now been answered (record its answer as a fact).`;
} else {
  const swap = JSON.parse(readFileSync(`${dir}/anchor-swap.json`, "utf8"));
  const clin = clinicianMessages(scenario);
  let t2 = clin[1].text;
  if (variant === "swapped") {
    if (!t2.includes(swap.from)) throw new Error("anchor-swap source text not found");
    t2 = t2.replace(swap.from, swap.to);
  }
  text = `Consultation transcript:\n\nCLINICIAN: ${clin[0].text}\n\nASSISTANT: ${out("10-assistant-t1.txt")}\n\nCLINICIAN: ${t2}\n\nProduce the neutral case record as specified.`;
}
process.stdout.write(text + "\n");
