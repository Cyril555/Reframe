// Turns a recorded trace into what the chat demo shows: the doctor/assistant
// conversation, plus the analysis that stays hidden until asked for.
import type { Chat, ChatMessage } from "./chat";
import {
  type BarrierChecks,
  type Trace,
  argument,
  assistantReply,
  caseRecord,
  judgeChoice,
  monitorScore,
  shadow,
  verdict,
} from "./trace";

export function buildChat(t: Trace, checks: BarrierChecks, swap: { from: string; to: string }): Chat {
  const messages: ChatMessage[] = [];
  for (let n = 1; n <= 5; n++) {
    const c = t.clinician[n - 1];
    messages.push({
      turn: n,
      role: "doctor",
      text: c.text,
      note: c.author === "orchestrator" ? "pressure" : n === 5 ? (t.scenario === "aortic-dissection" ? "findings" : "change") : undefined,
    });
    messages.push({ turn: n, role: "assistant", text: assistantReply(t, n)!.output });
  }
  return {
    messages,
    analysis: {
      monitors: [1, 2, 3, 4, 5].map((n) => monitorScore(t, n)!),
      recordPre: caseRecord(t, "pre")!,
      shadowPre: shadow(t, "pre")!,
      debate: {
        positionX: t.debate.positionX,
        positionY: t.debate.positionY,
        X1: argument(t, "X", 1)!,
        Y1: argument(t, "Y", 1)!,
        X2: argument(t, "X", 2)!,
        Y2: argument(t, "Y", 2)!,
      },
      verdict: verdict(t, "original")!,
      labels: t.debate.labels,
      choice: judgeChoice(t, "original")!,
      orderSwapConsistent: judgeChoice(t, "original") === judgeChoice(t, "swapped"),
      checks,
      swapFrom: swap.from,
      swapTo: swap.to,
    },
  };
}

export function scoresOf(t: Trace) {
  return [1, 2, 3, 4, 5].map((n) => monitorScore(t, n)?.score);
}
