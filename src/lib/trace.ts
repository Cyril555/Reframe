// Typed access to the recorded agent runs in /traces (see docs/PROTOCOL.md).
// Everything the site shows comes from these files; nothing is hand-written.
import { readFileSync } from "fs";
import { join } from "path";

export type AgentId =
  | "reframe-assistant"
  | "reframe-extractor"
  | "reframe-shadow"
  | "reframe-monitor"
  | "reframe-advocate"
  | "reframe-judge";

export interface Fact {
  id: string;
  category?: string;
  text: string;
}

export interface Redaction {
  source: "clinician" | "assistant";
  text: string;
  reason: string;
}

export interface CaseRecord {
  facts: Fact[];
  unknowns: Fact[];
  redacted: Redaction[];
}

export interface Differential {
  differential: { diagnosis: string; probability: number; for: string[]; against: string[]; note: string }[];
  must_not_miss: string[];
  next_step: string;
}

export interface MonitorScore {
  score: number;
  band: "safe" | "amber" | "red";
  signals: { type: string; quote: string; why: string }[];
  dropped: string[];
  plain_english: string;
}

export interface Argument {
  diagnosis: string;
  round: number;
  claims: { claim: string; facts: string[] }[];
  concessions: string[];
  stakes: string;
  discriminating_test: string;
}

export interface Verdict {
  ranking: { diagnosis: string; likelihood: string; why: string; facts: string[] }[];
  stronger_position: "A" | "B";
  citation_problems: string[];
  must_not_miss: string | null;
  discriminating_test: string;
  immediate_action: string;
  confidence: string;
  plain_english: string;
}

export interface TraceEvent {
  seq: number;
  agent: AgentId;
  model: string;
  turn?: number;
  round?: number;
  note?: string;
  tools_used: string;
  duration_ms: number;
  input: string;
  output: string;
  parsed?: unknown;
  remark?: string;
}

export interface ClinicianMessage {
  turn: number;
  text: string;
  author: "scenario" | "orchestrator";
}

export interface Debate {
  positionX: string;
  positionXSource: string;
  positionY: string;
  positionYSource: string;
  coinFlip: number;
  labels: { A: "X" | "Y"; B: "X" | "Y" };
}

export interface Trace {
  scenario: string;
  title: string;
  recordedAt: string;
  orchestrator: string;
  clinician: ClinicianMessage[];
  debate: Debate;
  events: TraceEvent[];
}

export interface BarrierChecks {
  leakCheck: { pass: boolean; leaks: unknown[] };
  anchorSwap: {
    factCount: { original: number; swapped: number };
    clinicalValues: string[];
    pass: boolean;
  } | null;
}

const tracesDir = join(process.cwd(), "traces");

export const CASE_IDS = ["aortic-dissection", "pe-anxiety", "meningitis-viral"] as const;
export type CaseId = (typeof CASE_IDS)[number];

export function loadTrace(id: CaseId): Trace {
  return JSON.parse(readFileSync(join(tracesDir, `${id}.json`), "utf8"));
}

export function loadChecks(): Record<CaseId, BarrierChecks> {
  return JSON.parse(readFileSync(join(tracesDir, "checks.json"), "utf8"));
}

// ---- Convenience views over a trace ---------------------------------------

const find = (t: Trace, pred: (e: TraceEvent) => boolean) => t.events.find(pred);

export function assistantReply(t: Trace, turn: number) {
  return find(t, (e) => e.agent === "reframe-assistant" && e.turn === turn);
}

export function monitorScore(t: Trace, turn: number) {
  return find(t, (e) => e.agent === "reframe-monitor" && e.turn === turn)?.parsed as MonitorScore | undefined;
}

export function caseRecord(t: Trace, phase: "pre" | "post") {
  return find(t, (e) => e.agent === "reframe-extractor" && e.note === phase)?.parsed as CaseRecord | undefined;
}

export function shadow(t: Trace, phase: "pre" | "post") {
  return find(t, (e) => e.agent === "reframe-shadow" && e.note === phase)?.parsed as Differential | undefined;
}

export function argument(t: Trace, side: "X" | "Y", round: 1 | 2) {
  return find(t, (e) => e.agent === "reframe-advocate" && e.note === side && e.round === round)?.parsed as Argument | undefined;
}

export function verdict(t: Trace, which: "original" | "swapped") {
  return find(t, (e) => e.agent === "reframe-judge" && e.note === which)?.parsed as Verdict | undefined;
}

export function anchorPair(t: Trace) {
  return {
    original: find(t, (e) => e.note === "anchor-original")?.parsed as CaseRecord | undefined,
    swapped: find(t, (e) => e.note === "anchor-swapped")?.parsed as CaseRecord | undefined,
  };
}

// Which diagnosis the judge preferred, resolved through the A/B labels.
export function judgeChoice(t: Trace, which: "original" | "swapped"): "X" | "Y" | undefined {
  const v = verdict(t, which);
  if (!v) return undefined;
  const labels = which === "original" ? t.debate.labels : { A: t.debate.labels.B, B: t.debate.labels.A };
  return labels[v.stronger_position];
}

export function totals(t: Trace) {
  return {
    calls: t.events.length,
    ms: t.events.reduce((s, e) => s + e.duration_ms, 0),
    toolCalls: t.events.filter((e) => e.tools_used !== "none").length,
  };
}
