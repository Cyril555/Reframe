// Records one agent call into traces/raw/<scenario>/ straight from the
// subagent's Claude Code transcript (JSONL), so inputs and outputs are copied
// verbatim rather than retyped. See docs/PROTOCOL.md.
//
// usage: node scripts/record-event.mjs <transcript.jsonl> <scenario> <seq> <agent> [turn] [round] [note]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { expectedInput, EXPECTED_MODEL } from "./expected-input.mjs";

const [transcript, scenario, seq, agent, turn = "-", round = "-", note = "-"] = process.argv.slice(2);
if (!transcript || !scenario || !seq || !agent) {
  console.error("usage: record-event.mjs <transcript.jsonl> <scenario> <seq> <agent> [turn] [round] [note]");
  process.exit(1);
}

const lines = readFileSync(transcript, "utf8")
  .split("\n")
  .filter(Boolean)
  .map((l) => JSON.parse(l));

// The task message is the first plain-string user turn that isn't a harness reminder.
const input = lines.find(
  (l) => l.type === "user" && typeof l.message?.content === "string" && !l.message.content.startsWith("<system-reminder>"),
)?.message.content;

const assistantTurns = lines.filter((l) => l.type === "assistant");
const toolUses = assistantTurns.flatMap((l) => l.message.content.filter((c) => c.type === "tool_use"));
const handback = toolUses.find((t) => t.name === "SubagentHandback");
const otherTools = toolUses.filter((t) => t.name !== "SubagentHandback").map((t) => t.name);

if (!input || !handback) {
  console.error("could not find task message or SubagentHandback in transcript");
  process.exit(1);
}

const model = assistantTurns.find((l) => l.message.model)?.message.model;
if (model !== EXPECTED_MODEL(agent)) {
  console.error(`refusing to record: ${agent} ran on ${model}, protocol requires ${EXPECTED_MODEL(agent)}`);
  process.exit(1);
}
if (input.trim() !== expectedInput({ scenario, agent, turn, round, note })) {
  console.error(`refusing to record: ${agent} input does not match what the protocol says it should receive`);
  process.exit(1);
}
const start = Date.parse(lines[0].timestamp);
const end = Date.parse(assistantTurns.at(-1).timestamp);

const header = {
  agent,
  model,
  turn,
  round,
  note,
  tools_used: otherTools.length ? otherTools.join(",") : "none",
  duration_ms: end - start,
};

const body =
  Object.entries(header).map(([k, v]) => `${k}: ${v}`).join("\n") +
  `\n--- input ---\n${input.trim()}\n--- output ---\n${handback.input.message.trim()}\n`;

const dir = join(new URL("..", import.meta.url).pathname, "traces/raw", scenario);
mkdirSync(dir, { recursive: true });
const file = join(dir, `${String(seq).padStart(2, "0")}-${agent.replace(/^reframe-/, "")}${turn !== "-" ? `-t${turn}` : ""}${round !== "-" ? `-r${round}` : ""}.txt`);
writeFileSync(file, body);
console.log(`${file.split("/traces/")[1]}  model=${model}  tools=${header.tools_used}  ${header.duration_ms}ms  out=${handback.input.message.length}ch`);
