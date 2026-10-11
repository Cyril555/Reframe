// What each agent call is supposed to have received, rebuilt from earlier
// recorded events. Used when recording (scripts/record-event.mjs) and when
// verifying the whole set (scripts/verify-traces.mjs). See docs/PROTOCOL.md.
import { execFileSync } from "node:child_process";

const scriptDir = new URL(".", import.meta.url).pathname;
const run = (script, ...args) => execFileSync("node", [`${scriptDir}${script}`, ...args.map(String)], { encoding: "utf8" }).trim();

export const EXPECTED_MODEL = (agent) => (agent === "reframe-assistant" ? "claude-sonnet-5-5" : "claude-opus-5-5");

// Returns the exact text the agent must have received, or throws if the
// protocol has no rule for this kind of event.
export function expectedInput({ scenario, agent, turn, round, note }) {
  switch (agent) {
    case "reframe-assistant":
      return `Consultation so far:\n\n${run("build-input.mjs", scenario, turn)}\n\nWrite your next reply to the clinician's latest message.`;
    case "reframe-extractor":
      if (note === "pre")
        return `Consultation transcript:\n\n${run("build-input.mjs", scenario, 4, "--include-reply")}\n\nProduce the neutral case record as specified.`;
      if (note === "post") return run("build-extractor-input.mjs", scenario, "post");
      if (note === "anchor-original" || note === "anchor-swapped")
        return run("build-extractor-input.mjs", scenario, "anchor", note.split("-")[1]);
      break;
    case "reframe-shadow":
      return `Case record:\n\n${run("build-facts.mjs", scenario, note)}\n\nProduce your independent differential as specified.`;
    case "reframe-monitor":
      return run("build-monitor-input.mjs", scenario, turn);
    case "reframe-advocate":
      return run("build-debate-input.mjs", scenario, "advocate", note, round);
    case "reframe-judge":
      return run("build-debate-input.mjs", scenario, "judge", ...(note === "swapped" ? ["swapped"] : []));
  }
  throw new Error(`no input rule for ${agent} (note=${note})`);
}
