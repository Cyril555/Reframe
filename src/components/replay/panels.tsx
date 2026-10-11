"use client";
import { useState } from "react";
import type { Argument, CaseRecord, Differential, MonitorScore, Verdict } from "@/lib/trace";
import { band } from "@/lib/agents";

const SIGNAL_LABEL: Record<string, string> = {
  framing_echo: "Echoes the doctor's framing",
  differential_narrowing: "Drops a serious alternative",
  position_drift: "Changes position without new evidence",
  affirmation_language: "Defers before reasoning",
  agreement_without_evidence: "Agrees without evidence",
};

const bandStyle = {
  safe: "text-safe bg-safe/10 border-safe/30",
  amber: "text-amber bg-amber/10 border-amber/30",
  red: "text-red bg-red/10 border-red/30",
};

export function ScorePill({ score }: { score: number }) {
  const b = band(score);
  return (
    <span className={`inline-flex items-baseline gap-1 rounded-full border px-2.5 py-0.5 font-mono text-sm ${bandStyle[b]}`}>
      <span className="font-semibold">{score}</span>
      <span className="text-[10px] uppercase tracking-wider">{b}</span>
    </span>
  );
}

export function MonitorCard({ m }: { m: MonitorScore }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <ScorePill score={m.score} />
        <span className="text-xs text-muted">0 = independent · 100 = pure echo</span>
      </div>
      <p className="text-sm leading-relaxed">{m.plain_english}</p>
      {m.signals.length > 0 && (
        <ul className="space-y-2">
          {m.signals.map((s, i) => (
            <li key={i} className="rounded-lg border border-line bg-paper p-2.5">
              <div className="text-[11px] font-medium uppercase tracking-wider text-monitor">{SIGNAL_LABEL[s.type] ?? s.type}</div>
              <blockquote className="mt-1 border-l-2 border-monitor/40 pl-2 text-sm italic">“{s.quote}”</blockquote>
              <p className="mt-1 text-xs text-muted">{s.why}</p>
            </li>
          ))}
        </ul>
      )}
      {m.dropped.length > 0 && (
        <div className="text-xs">
          <span className="font-medium">Dropped vs. the blind view: </span>
          <span className="text-muted">{m.dropped.join(" · ")}</span>
        </div>
      )}
    </div>
  );
}

export function RecordPanel({ r, showRedacted = true }: { r: CaseRecord; showRedacted?: boolean }) {
  const [open, setOpen] = useState(false);
  const fromClinician = r.redacted.filter((x) => x.source === "clinician");
  return (
    <div className="space-y-3 text-sm">
      <div>
        <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted">Passed on: {r.facts.length} facts</div>
        <ul className="space-y-1">
          {r.facts.map((f) => (
            <li key={f.id} className="flex gap-2">
              <span className="font-mono text-xs text-extractor shrink-0 w-7">{f.id}</span>
              <span>{f.text}</span>
            </li>
          ))}
        </ul>
      </div>
      {showRedacted && (
        <div>
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted">
            Stopped at the barrier: {r.redacted.length} spans ({fromClinician.length} from the doctor)
          </div>
          <ul className="space-y-1">
            {(open ? r.redacted : fromClinician.slice(0, 6)).map((x, i) => (
              <li key={i} className="flex gap-2 items-baseline">
                <span className="shrink-0 rounded bg-ink/5 px-1.5 text-[10px] uppercase tracking-wider text-muted">{x.reason}</span>
                <span className="line-through decoration-red/60 text-muted">{x.text}</span>
              </li>
            ))}
          </ul>
          <button onClick={() => setOpen(!open)} className="mt-1 text-xs text-extractor hover:underline">
            {open ? "Show fewer" : `Show all ${r.redacted.length}, including the assistant's own interpretations`}
          </button>
        </div>
      )}
    </div>
  );
}

export function DifferentialBars({ d }: { d: Differential }) {
  const max = Math.max(...d.differential.map((x) => x.probability));
  return (
    <div className="space-y-3 text-sm">
      <ul className="space-y-1.5">
        {d.differential.map((x) => (
          <li key={x.diagnosis}>
            <div className="flex justify-between gap-3">
              <span className="leading-snug">{x.diagnosis}</span>
              <span className="font-mono text-xs text-muted shrink-0">{Math.round(x.probability * 100)}%</span>
            </div>
            <div className="mt-0.5 h-1.5 rounded-full bg-ink/5">
              <div className="h-1.5 rounded-full bg-shadow" style={{ width: `${(x.probability / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
      <div className="rounded-lg border border-shadow/30 bg-shadow/5 p-2.5">
        <div className="text-[11px] font-medium uppercase tracking-wider text-shadow">Next step</div>
        <p className="mt-0.5">{d.next_step}</p>
      </div>
    </div>
  );
}

function ArgumentCol({ a, label, tone }: { a: Argument; label: string; tone: string }) {
  return (
    <div className="space-y-2 min-w-0">
      <div className={`text-[11px] font-medium uppercase tracking-wider ${tone}`}>{label}</div>
      <div className="font-medium leading-snug">{a.diagnosis}</div>
      <ul className="space-y-1.5">
        {a.claims.slice(0, 4).map((c, i) => (
          <li key={i} className="text-sm leading-snug">
            {c.claim}{" "}
            <span className="font-mono text-[10px] text-extractor whitespace-nowrap">[{c.facts.join(" ")}]</span>
          </li>
        ))}
      </ul>
      {a.concessions.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-xs text-muted">{a.concessions.length} concessions</summary>
          <ul className="mt-1 list-disc pl-4 space-y-1 text-muted">
            {a.concessions.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

export function DebatePanel({ X, Y, round }: { X: Argument; Y: Argument; round: 1 | 2 }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">
        {round === 1
          ? "Each advocate wrote its opening without seeing the other's. Neither knows which side the doctor is on."
          : "Each advocate now answers the other's opening. It may concede points but not switch sides."}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <ArgumentCol a={X} label="The doctor's diagnosis" tone="text-clinician" />
        <ArgumentCol a={Y} label="The strongest alternative" tone="text-advocate" />
      </div>
    </div>
  );
}

export function VerdictPanel({
  v,
  labels,
  positionX,
  positionY,
  choice,
  swappedChoice,
}: {
  v: Verdict;
  labels: { A: "X" | "Y"; B: "X" | "Y" };
  positionX: string;
  positionY: string;
  choice: "X" | "Y";
  swappedChoice: "X" | "Y";
}) {
  const name = (s: "X" | "Y") => (s === "X" ? positionX : positionY);
  return (
    <div className="space-y-3 text-sm">
      <div className="rounded-lg border border-judge/40 bg-judge/5 p-3">
        <div className="text-[11px] font-medium uppercase tracking-wider text-judge">Immediate action</div>
        <p className="mt-1 font-medium leading-snug">{v.immediate_action}</p>
      </div>
      <dl className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1.5">
        <dt className="text-muted">Can't miss</dt>
        <dd>{v.must_not_miss}</dd>
        <dt className="text-muted">Stronger case</dt>
        <dd>
          Position {v.stronger_position} ({name(labels[v.stronger_position])})
          {choice === "X" ? " · the doctor's side" : " · the alternative"}
        </dd>
        <dt className="text-muted">Order swapped</dt>
        <dd className={choice === swappedChoice ? "text-safe" : "text-red"}>
          {choice === swappedChoice ? "Same verdict with A and B reversed" : "Verdict changed when A and B were reversed"}
        </dd>
        <dt className="text-muted">Confidence</dt>
        <dd>{v.confidence}</dd>
      </dl>
      <p className="text-muted leading-relaxed">{v.plain_english}</p>
      <details>
        <summary className="cursor-pointer text-xs text-judge">{v.citation_problems.length} citation problems the judge caught</summary>
        <ul className="mt-1 list-disc pl-4 space-y-1 text-muted">
          {v.citation_problems.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}

export function RawInput({ caseId, seq }: { caseId: string; seq: number[] }) {
  const [data, setData] = useState<{ seq: number; agent: string; input: string; model: string; duration_ms: number }[] | null>(null);
  const [open, setOpen] = useState(false);
  const load = async () => {
    setOpen(!open);
    if (data) return;
    const t = await fetch(`/traces/${caseId}.json`).then((r) => r.json());
    setData(t.events.filter((e: { seq: number }) => seq.includes(e.seq)));
  };
  return (
    <div className="text-xs">
      <button onClick={load} className="text-muted underline decoration-dotted underline-offset-2 hover:text-ink">
        {open ? "Hide" : "Show"} the exact input this agent received
      </button>
      {open && (
        <div className="mt-2 space-y-3">
          {!data && <p className="text-muted">Loading trace…</p>}
          {data?.map((e) => (
            <div key={e.seq}>
              <div className="mb-1 font-mono text-[10px] text-muted">
                event {e.seq} · {e.agent} · {e.model} · {(e.duration_ms / 1000).toFixed(1)}s · tools used: none
              </div>
              <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-lg border border-line bg-paper p-3 font-mono text-[11px] leading-relaxed">
                {e.input}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
