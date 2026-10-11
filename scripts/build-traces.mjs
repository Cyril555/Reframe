// Assembles raw recorded agent events (traces/raw/<scenario>/NN-*.txt) into
// one JSON trace per scenario (traces/<scenario>.json). See docs/PROTOCOL.md.
//
// Raw event format:
//   key: value header lines
//   --- input ---
//   <exact message the agent received>
//   --- output ---
//   <exact text the agent returned>
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { clinicianMessages } from "./clinician-messages.mjs";

const root = new URL("..", import.meta.url).pathname;
const rawDir = join(root, "traces/raw");
const NUMERIC = new Set(["seq", "turn", "round", "tool_uses", "duration_ms", "subagent_tokens"]);

function parseEvent(file) {
  const text = readFileSync(file, "utf8");
  const [header, rest] = text.split(/^--- input ---$/m);
  const [input, output] = rest.split(/^--- output ---$/m);
  const event = {};
  for (const line of header.trim().split("\n")) {
    const i = line.indexOf(":");
    const key = line.slice(0, i).trim();
    const value = line.slice(i + 1).trim();
    if (value === "" || value === "-") continue;
    event[key] = NUMERIC.has(key) ? Number(value) : value;
  }
  event.input = input.trim();
  event.output = output.trim();
  // Agents that return JSON get a parsed copy so the site needn't re-parse.
  // Agents sometimes add a short remark after the JSON; keep it as `remark`.
  if (event.agent !== "reframe-assistant") {
    const body = event.output.replace(/^```(?:json)?\s*/, "");
    const end = jsonObjectEnd(body);
    if (end < 0) throw new Error(`${file}: output does not start with a JSON object`);
    event.parsed = JSON.parse(body.slice(0, end));
    const remark = body.slice(end).replace(/^\s*```/, "").trim();
    if (remark) event.remark = remark;
  }
  return event;
}

// Index just past the first balanced top-level JSON object in `text`, or -1.
function jsonObjectEnd(text) {
  if (text[0] !== "{") return -1;
  let depth = 0, inString = false, escaped = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (c === "\\") escaped = true;
      else if (c === '"') inString = false;
    } else if (c === '"') inString = true;
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) return i + 1;
  }
  return -1;
}

for (const scenario of readdirSync(rawDir)) {
  const dir = join(rawDir, scenario);
  const metaFile = join(dir, "meta.json");
  const meta = existsSync(metaFile) ? JSON.parse(readFileSync(metaFile, "utf8")) : {};
  const events = readdirSync(dir)
    .filter((f) => /^\d+-.*\.txt$/.test(f))
    .sort()
    .map((f) => ({ seq: Number(f.split("-")[0]), ...parseEvent(join(dir, f)) }));
  const clinician = clinicianMessages(scenario).map((m, i) => ({ turn: i + 1, ...m }));
  const debateFile = join(dir, "debate.json");
  const debate = existsSync(debateFile) ? JSON.parse(readFileSync(debateFile, "utf8")) : undefined;
  const optional = (name) => (existsSync(join(dir, name)) ? JSON.parse(readFileSync(join(dir, name), "utf8")) : undefined);
  const escalation = optional("escalation.json");
  const anchorSwap = optional("anchor-swap.json");
  const trace = { scenario, protocol: "docs/PROTOCOL.md", ...meta, clinician, escalation, anchorSwap, debate, events };
  writeFileSync(join(root, "traces", `${scenario}.json`), JSON.stringify(trace, null, 2) + "\n");
  console.log(`${scenario}: ${events.length} events`);
}
