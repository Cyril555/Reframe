"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, EyeOff } from "lucide-react";
import { AgentGraph } from "@/components/AgentGraph";
import { DriftChart } from "@/components/DriftChart";
import { Markdown } from "@/components/Markdown";
import { AGENTS, TURN_LABELS } from "@/lib/agents";
import { ACTS, type Step } from "@/lib/steps";
import { DebatePanel, DifferentialBars, MonitorCard, RawInput, RecordPanel, ScorePill, VerdictPanel } from "./panels";

const LEAD_AGENT: Record<Step["kind"], keyof typeof AGENTS> = {
  clinician: "clinician",
  assistant: "reframe-assistant",
  monitor: "reframe-monitor",
  barrier: "reframe-extractor",
  shadow: "reframe-shadow",
  debate: "reframe-advocate",
  judge: "reframe-judge",
  checks: "reframe-extractor",
};

function title(s: Step) {
  switch (s.kind) {
    case "clinician":
      return `Turn ${s.turn} · ${TURN_LABELS[s.turn - 1]}`;
    case "assistant":
      return `Turn ${s.turn} · The assistant replies`;
    case "monitor":
      return `Turn ${s.turn} · The monitor scores the reply`;
    case "barrier":
      return s.phase === "pre" ? "The barrier strips the doctor's opinions" : "The barrier adds the new findings";
    case "shadow":
      return s.phase === "pre" ? "A shadow clinician reads only the facts" : "The shadow clinician re-reads the updated facts";
    case "debate":
      return s.round === 1 ? "Two advocates argue, blind" : "Rebuttals";
    case "judge":
      return "The blind judge rules";
    case "checks":
      return "Did the barrier hold?";
  }
}

function Narration({ s }: { s: Step }) {
  switch (s.kind) {
    case "clinician":
      return s.author === "orchestrator" ? (
        <p>
          This message was added by the experiment, not the original scenario. It adds <strong>pressure only, no new medical facts</strong>,
          so if the assistant moves now, it moved because of who was asking, not what they found.
        </p>
      ) : s.turn === 5 ? (
        <p>New clinical findings arrive. Changing position now is the right behaviour, and the monitor should not flag it.</p>
      ) : (
        <p>The doctor's message, word for word from the original scenario.</p>
      );
    case "assistant":
      return (
        <p>
          A recorded reply from the assistant under observation ({AGENTS["reframe-assistant"].model}, ordinary clinical-assistant
          prompt). It saw the whole conversation. Took {(s.ms / 1000).toFixed(0)}s.
        </p>
      );
    default:
      return null;
  }
}

function Lens({ agent }: { agent: keyof typeof AGENTS }) {
  const meta = AGENTS[agent];
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 border-${meta.colour}/40 text-${meta.colour}`}>
        <span className={`h-2 w-2 rounded-full bg-${meta.colour}`} />
        {meta.name} · {meta.model}
      </span>
      <span className="text-muted">Sees: {meta.sees}</span>
      {meta.blind && (
        <span className="inline-flex items-center gap-1 rounded-full bg-judge/10 px-2 py-0.5 text-judge">
          <EyeOff size={12} /> never sees the doctor's opinion
        </span>
      )}
    </div>
  );
}

function ChecksPanel({ s }: { s: Extract<Step, { kind: "checks" }> }) {
  const a = s.checks.anchorSwap!;
  return (
    <div className="space-y-4 text-sm">
      <Check ok={s.checks.leakCheck.pass} title="No diagnostic label leaked into any blind fact list">
        An automated scan of every fact list the blind agents received, looking for the debated diagnoses by name.
      </Check>
      <Check ok={a.pass} title="Flipping the doctor's hypothesis didn't change the facts">
        The extractor ran twice on the same opening. Once the doctor said <em>“{s.swapFrom.split(/[.?]/)[0]}”</em>, once{" "}
        <em>“{s.swapTo.split(/[.?]/)[0]}”</em>. Both runs produced {a.factCount.original} vs {a.factCount.swapped} facts with identical
        clinical values ({a.clinicalValues.join(", ")}).
      </Check>
      <Check ok={s.orderSwapConsistent} title="The judge's verdict survived swapping A and B">
        The judge ran a second time with the positions' labels reversed, to rule out a preference for whichever argument came first.
      </Check>
    </div>
  );
}

function Check({ ok, title, children }: { ok: boolean; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className={`mt-0.5 h-5 w-5 shrink-0 rounded-full grid place-items-center text-xs text-white ${ok ? "bg-safe" : "bg-red"}`}>{ok ? "✓" : "✕"}</span>
      <div>
        <div className="font-medium">{title}</div>
        <p className="text-muted mt-0.5">{children}</p>
      </div>
    </div>
  );
}

function Detail({ s, caseId }: { s: Step; caseId: string }) {
  let body: React.ReactNode = null;
  switch (s.kind) {
    case "monitor":
      body = <MonitorCard m={s.score} />;
      break;
    case "barrier":
      body = <RecordPanel r={s.record} />;
      break;
    case "shadow":
      body = <DifferentialBars d={s.diff} />;
      break;
    case "debate":
      body = <DebatePanel X={s.X} Y={s.Y} round={s.round} />;
      break;
    case "judge":
      body = <VerdictPanel {...s} v={s.verdict} />;
      break;
    case "checks":
      body = <ChecksPanel s={s} />;
      break;
    default:
      body = (
        <div className="text-sm leading-relaxed">
          <Narration s={s} />
        </div>
      );
  }
  return (
    <div className="space-y-3">
      {body}
      {s.seq && s.seq.length > 0 && s.kind !== "assistant" && <RawInput caseId={caseId} seq={s.seq} />}
    </div>
  );
}

export function CaseReplay({ caseId, steps }: { caseId: string; steps: Step[] }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const feedEnd = useRef<HTMLDivElement>(null);
  const step = steps[i];
  const clamp = useCallback((n: number) => Math.max(0, Math.min(steps.length - 1, n)), [steps.length]);
  const go = useCallback((n: number) => setI(clamp(n)), [clamp]);
  const move = useCallback((d: number) => setI((p) => clamp(p + d)), [clamp]);

  useEffect(() => {
    if (!playing) return;
    if (i >= steps.length - 1) return setPlaying(false);
    const t = setTimeout(() => go(i + 1), step.kind === "assistant" ? 4200 : 3000);
    return () => clearTimeout(t);
  }, [playing, i, step.kind, steps.length, go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  useEffect(() => {
    if (step.kind === "clinician" || step.kind === "assistant") feedEnd.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [i, step.kind]);

  const shown = steps.slice(0, i + 1);
  const scores = useMemo(() => {
    const out: (number | undefined)[] = [undefined, undefined, undefined, undefined, undefined];
    for (const s of shown) if (s.kind === "monitor") out[s.turn - 1] = s.score.score;
    return out;
  }, [shown]);
  const scoreByTurn = (t: number) => scores[t - 1];
  const lead = LEAD_AGENT[step.kind];

  return (
    <div className="pb-28">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* Conversation */}
        <section aria-label="Consultation" className="space-y-3 min-w-0">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-muted">The consultation</h2>
          {shown.map((s, k) =>
            s.kind === "clinician" ? (
              <div key={k} className="rounded-2xl border border-line bg-card p-4">
                <div className="mb-1.5 flex items-center gap-2 text-xs">
                  <span className="font-medium text-clinician">Doctor · turn {s.turn}</span>
                  {s.author === "orchestrator" && (
                    <span className="rounded-full bg-amber/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber">
                      pressure only · added by experiment
                    </span>
                  )}
                  {s.turn === 5 && (
                    <span className="rounded-full bg-judge/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-judge">new evidence</span>
                  )}
                </div>
                <p className="text-sm leading-relaxed">{s.text}</p>
              </div>
            ) : s.kind === "assistant" ? (
              <AssistantCard key={k} turn={s.turn} markdown={s.markdown} score={scoreByTurn(s.turn)} latest={k === i} />
            ) : null,
          )}
          <div ref={feedEnd} />
        </section>

        {/* Agents */}
        <aside className="lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto space-y-4 min-w-0 lg:pr-1">
          <div className="rounded-2xl border border-line bg-card p-4">
            <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-widest text-muted">
              <span>
                Act {step.act + 1} · {ACTS[step.act]}
              </span>
              <span className="font-mono normal-case tracking-normal">
                {i + 1}/{steps.length}
              </span>
            </div>
            <AgentGraph active={step.agents} compact />
          </div>
          <div className="rounded-2xl border border-line bg-card p-4 space-y-3" aria-live="polite">
            <h3 className="font-display text-2xl leading-tight">{title(step)}</h3>
            <Lens agent={lead} />
            <Detail s={step} caseId={caseId} />
          </div>
          <div className="rounded-2xl border border-line bg-card p-4">
            <div className="mb-1 text-[11px] font-medium uppercase tracking-widest text-muted">Sycophancy score by turn</div>
            <DriftChart scores={scores} height={150} />
          </div>
        </aside>
      </div>

      {/* Controls */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 sm:px-6 py-3">
          <button onClick={() => go(i - 1)} disabled={i === 0} className="rounded-full border border-line p-2 disabled:opacity-30" aria-label="Previous step">
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setPlaying(!playing)}
            className="rounded-full bg-ink p-2 text-paper"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button onClick={() => go(i + 1)} disabled={i === steps.length - 1} className="rounded-full border border-line p-2 disabled:opacity-30" aria-label="Next step">
            <ChevronRight size={18} />
          </button>
          <input
            type="range"
            min={0}
            max={steps.length - 1}
            value={i}
            onChange={(e) => go(Number(e.target.value))}
            className="flex-1 accent-[rgb(var(--monitor))]"
            aria-label="Step"
          />
          <span className="hidden sm:inline text-xs text-muted w-40 truncate text-right">{ACTS[step.act]}</span>
        </div>
      </div>
    </div>
  );
}

function AssistantCard({ turn, markdown, score, latest }: { turn: number; markdown: string; score?: number; latest: boolean }) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(latest), [latest]);
  return (
    <div className="rounded-2xl border border-assistant/25 bg-assistant/[0.04] p-4">
      <div className="mb-2 flex items-center justify-between gap-2 text-xs">
        <span className="font-medium text-assistant">Assistant · turn {turn}</span>
        {score !== undefined && <ScorePill score={score} />}
      </div>
      <div className={open ? "" : "relative max-h-44 overflow-hidden"}>
        <Markdown>{markdown}</Markdown>
        {!open && <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-paper to-transparent" />}
      </div>
      <button onClick={() => setOpen(!open)} className="mt-2 text-xs text-assistant hover:underline">
        {open ? "Collapse" : "Read the full reply"}
      </button>
    </div>
  );
}

