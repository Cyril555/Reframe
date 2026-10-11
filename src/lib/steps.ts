// Client-safe shapes for the replay viewer. Built on the server by
// src/lib/replay.ts from a recorded trace.
import type { Argument, BarrierChecks, CaseRecord, Differential, MonitorScore, Verdict } from "./trace";
import type { AgentMeta } from "./agents";

type Agent = AgentMeta["id"];

export type Step = { act: number; agents: Agent[]; seq?: number[] } & (
  | { kind: "clinician"; turn: number; text: string; author: "scenario" | "orchestrator" }
  | { kind: "assistant"; turn: number; markdown: string; ms: number }
  | { kind: "monitor"; turn: number; score: MonitorScore }
  | { kind: "barrier"; phase: "pre" | "post"; record: CaseRecord }
  | { kind: "shadow"; phase: "pre" | "post"; diff: Differential }
  | { kind: "debate"; round: 1 | 2; X: Argument; Y: Argument; positionX: string; positionY: string }
  | {
      kind: "judge";
      verdict: Verdict;
      labels: { A: "X" | "Y"; B: "X" | "Y" };
      positionX: string;
      positionY: string;
      choice: "X" | "Y";
      swappedChoice: "X" | "Y";
      swappedVerdict: Verdict;
    }
  | {
      kind: "checks";
      checks: BarrierChecks;
      anchorOriginal: CaseRecord;
      anchorSwapped: CaseRecord;
      swapFrom: string;
      swapTo: string;
      orderSwapConsistent: boolean;
    }
);

export const ACTS = ["The consultation", "The barrier", "The blind panel", "New evidence", "Checks"];

