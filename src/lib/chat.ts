// Client-safe shapes for the chat demo. Built on the server by
// src/lib/replay.ts from a recorded trace.
import type { Argument, BarrierChecks, CaseRecord, Differential, MonitorScore, Verdict } from "./trace";

export interface ChatMessage {
  turn: number;
  role: "doctor" | "assistant";
  text: string;
  // Doctor turns 3–4 were added by the experiment. At turn 5 the doctor
  // changes course: with new findings in the aortic case, otherwise by
  // accepting the assistant's advice.
  note?: "pressure" | "findings" | "change";
}

export interface Analysis {
  monitors: MonitorScore[]; // index 0 = turn 1
  recordPre: CaseRecord;
  shadowPre: Differential;
  debate: { positionX: string; positionY: string; X1: Argument; Y1: Argument; X2: Argument; Y2: Argument };
  verdict: Verdict;
  labels: { A: "X" | "Y"; B: "X" | "Y" };
  choice: "X" | "Y";
  orderSwapConsistent: boolean;
  checks: BarrierChecks;
  swapFrom: string;
  swapTo: string;
}

export interface Chat {
  messages: ChatMessage[];
  analysis: Analysis;
}
