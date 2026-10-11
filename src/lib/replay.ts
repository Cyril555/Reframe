// Turns a recorded trace into the ordered steps the replay viewer walks
// through. Runs on the server; the client receives these light objects and
// fetches full raw inputs from /traces/<id>.json only when asked.
import {
  type BarrierChecks,
  type CaseId,
  type Trace,
  argument,
  assistantReply,
  caseRecord,
  judgeChoice,
  monitorScore,
  shadow,
  verdict,
  anchorPair,
} from "./trace";

import { ACTS, type Step } from "./steps";

export function buildSteps(t: Trace, checks: BarrierChecks, swap: { from: string; to: string }): Step[] {
  const steps: Step[] = [];
  const seqOf = (agent: string, pred: (e: Trace["events"][number]) => boolean) =>
    t.events.filter((e) => e.agent === agent && pred(e)).map((e) => e.seq);

  const turn = (n: number, act: number) => {
    const c = t.clinician[n - 1];
    steps.push({ act, kind: "clinician", turn: n, text: c.text, author: c.author, agents: ["clinician"] });
    const r = assistantReply(t, n)!;
    steps.push({ act, kind: "assistant", turn: n, markdown: r.output, ms: r.duration_ms, agents: ["clinician", "reframe-assistant"], seq: [r.seq] });
    if (n < 5) {
      steps.push({
        act,
        kind: "monitor",
        turn: n,
        score: monitorScore(t, n)!,
        agents: ["reframe-assistant", "reframe-monitor", "reframe-shadow"],
        seq: seqOf("reframe-monitor", (e) => e.turn === n),
      });
    }
  };

  for (let n = 1; n <= 4; n++) turn(n, 0);

  steps.push({ act: 1, kind: "barrier", phase: "pre", record: caseRecord(t, "pre")!, agents: ["clinician", "reframe-assistant", "reframe-extractor"], seq: seqOf("reframe-extractor", (e) => e.note === "pre") });
  steps.push({ act: 1, kind: "shadow", phase: "pre", diff: shadow(t, "pre")!, agents: ["reframe-extractor", "reframe-shadow"], seq: seqOf("reframe-shadow", (e) => e.note === "pre") });

  const { positionX, positionY } = t.debate;
  for (const round of [1, 2] as const) {
    steps.push({
      act: 2,
      kind: "debate",
      round,
      X: argument(t, "X", round)!,
      Y: argument(t, "Y", round)!,
      positionX,
      positionY,
      agents: ["reframe-extractor", "reframe-advocate"],
      seq: seqOf("reframe-advocate", (e) => e.round === round),
    });
  }
  steps.push({
    act: 2,
    kind: "judge",
    verdict: verdict(t, "original")!,
    swappedVerdict: verdict(t, "swapped")!,
    labels: t.debate.labels,
    positionX,
    positionY,
    choice: judgeChoice(t, "original")!,
    swappedChoice: judgeChoice(t, "swapped")!,
    agents: ["reframe-extractor", "reframe-advocate", "reframe-judge"],
    seq: seqOf("reframe-judge", () => true),
  });

  turn(5, 3);
  steps.push({ act: 3, kind: "barrier", phase: "post", record: caseRecord(t, "post")!, agents: ["clinician", "reframe-assistant", "reframe-extractor"], seq: seqOf("reframe-extractor", (e) => e.note === "post") });
  steps.push({ act: 3, kind: "shadow", phase: "post", diff: shadow(t, "post")!, agents: ["reframe-extractor", "reframe-shadow"], seq: seqOf("reframe-shadow", (e) => e.note === "post") });
  steps.push({ act: 3, kind: "monitor", turn: 5, score: monitorScore(t, 5)!, agents: ["reframe-assistant", "reframe-monitor", "reframe-shadow"], seq: seqOf("reframe-monitor", (e) => e.turn === 5) });

  const pair = anchorPair(t);
  steps.push({
    act: 4,
    kind: "checks",
    checks,
    anchorOriginal: pair.original!,
    anchorSwapped: pair.swapped!,
    swapFrom: swap.from,
    swapTo: swap.to,
    orderSwapConsistent: judgeChoice(t, "original") === judgeChoice(t, "swapped"),
    agents: ["reframe-extractor", "reframe-judge"],
    seq: [...seqOf("reframe-extractor", (e) => e.note?.startsWith("anchor") ?? false)],
  });
  return steps;
}

export function scoresOf(t: Trace) {
  return [1, 2, 3, 4, 5].map((n) => monitorScore(t, n)?.score);
}

export type { CaseId, Step };
export { ACTS };
