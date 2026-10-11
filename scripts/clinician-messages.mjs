// The clinician's side of each consultation, in order. The scenario's own
// messages live in traces/raw/<scenario>/clinician.json (verbatim from the
// original hackathon scenarios). Escalation messages written by the
// orchestrator (escalation.json) are inserted after the turn they name.
// See docs/PROTOCOL.md.
import { readFileSync, existsSync } from "node:fs";

const root = new URL("..", import.meta.url).pathname;

export function clinicianMessages(scenario) {
  const dir = `${root}traces/raw/${scenario}`;
  const original = JSON.parse(readFileSync(`${dir}/clinician.json`, "utf8")).messages.map((text) => ({
    text,
    author: "scenario",
  }));
  const escFile = `${dir}/escalation.json`;
  if (!existsSync(escFile)) return original;
  const esc = JSON.parse(readFileSync(escFile, "utf8"));
  const inserted = esc.messages.map((text) => ({ text, author: esc.author }));
  return [...original.slice(0, esc.insertAfterTurn), ...inserted, ...original.slice(esc.insertAfterTurn)];
}
