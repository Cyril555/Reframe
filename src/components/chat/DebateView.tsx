"use client";
import { useEffect, useRef, useState } from "react";
import type { Analysis } from "@/lib/chat";
import type { Argument } from "@/lib/trace";

// Pacing for the debate replay, in milliseconds.
const BEFORE_TYPING = 700;
const TYPING = 1500;
const READING = 4200;

type Side = "X" | "Y";
type Step =
  | { kind: "round"; label: string; detail: string }
  | { kind: "argument"; side: Side; arg: Argument; round: 1 | 2 }
  | { kind: "verdict" };

export function DebateView({
  a,
  positions,
  playing,
  onDone,
}: {
  a: Analysis;
  positions: { X: string; Y: string };
  playing: boolean;
  onDone: () => void;
}) {
  const steps: Step[] = [
    { kind: "round", label: "Round 1 · Openings", detail: "Written at the same time. Neither advocate sees the other." },
    { kind: "argument", side: "X", arg: a.debate.X1, round: 1 },
    { kind: "argument", side: "Y", arg: a.debate.Y1, round: 1 },
    { kind: "round", label: "Round 2 · Rebuttals", detail: "Each advocate now reads the other's opening and replies." },
    { kind: "argument", side: "X", arg: a.debate.X2, round: 2 },
    { kind: "argument", side: "Y", arg: a.debate.Y2, round: 2 },
    { kind: "round", label: "Ruling", detail: "The judge sees the facts and the arguments as A and B, assigned by coin flip." },
    { kind: "verdict" },
  ];
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLDivElement | null)[]>([]);
  const done = shown >= steps.length;

  useEffect(() => {
    if (done) onDone();
  }, [done, onDone]);

  // Round labels appear straight away; arguments and the verdict get a typing indicator first.
  useEffect(() => {
    if (!playing || done) return;
    const next = steps[shown];
    const prev = steps[shown - 1];
    const wait = shown === 0 ? 900 : prev.kind === "argument" ? READING : 600;
    if (next.kind === "round") {
      const t = setTimeout(() => setShown((s) => s + 1), wait);
      return () => clearTimeout(t);
    }
    const t1 = setTimeout(() => setTyping(true), prev?.kind === "round" ? BEFORE_TYPING : wait);
    const t2 = setTimeout(() => {
      setTyping(false);
      setShown((s) => s + 1);
    }, (prev?.kind === "round" ? BEFORE_TYPING : wait) + TYPING);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, shown, done]);

  useEffect(() => {
    const box = scroller.current;
    const el = items.current[shown - 1];
    if (!box || !el) return;
    box.scrollTo({ top: Math.max(0, el.offsetTop - 24), behavior: "smooth" });
  }, [shown]);

  useEffect(() => {
    if (typing && scroller.current) scroller.current.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [typing]);

  const next = steps[shown];
  const removed = a.recordPre.redacted.filter((r) => r.source === "clinician");
  const quotes = [...removed.filter((r) => r.reason === "hypothesis"), ...removed.filter((r) => r.reason !== "hypothesis")].slice(0, 2);
  const round = shown <= 3 ? 1 : 2;

  return (
    <>
      <div ref={scroller} className="relative flex-1 overflow-y-auto px-4 sm:px-8 py-8">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* What the panel was given */}
          <div className="animate-rise border border-line bg-panel/60 px-5 py-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">The barrier</div>
            <p className="mt-2 text-[15px] leading-relaxed">
              The panel gets <span className="font-medium">{a.recordPre.facts.length} facts</span> from turns 1–4. Every opinion is removed
              first, so no one on it knows what the doctor thinks.
            </p>
            <ul className="mt-3 space-y-1 text-[13px] text-muted">
              {quotes.map((q, i) => (
                <li key={i}>
                  <span className="line-through decoration-ink/40">“{q.text}”</span>
                  <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.12em]">removed</span>
                </li>
              ))}
            </ul>
          </div>

          {steps.slice(0, shown).map((s, i) => (
            <div key={i} ref={(el) => { items.current[i] = el; }} className="animate-rise">
              {s.kind === "round" && <RoundLabel label={s.label} detail={s.detail} />}
              {s.kind === "argument" && <ArgumentBubble side={s.side} arg={s.arg} round={s.round} name={positions[s.side]} full={s.side === "X" ? a.debate.positionX : a.debate.positionY} />}
              {s.kind === "verdict" && <VerdictCard a={a} />}
            </div>
          ))}

          {typing && next && next.kind === "argument" && (
            <Typing side={next.side} label={`Advocate for ${positions[next.side].toLowerCase()}`} />
          )}
          {typing && next && next.kind === "verdict" && <Typing side="judge" label="Blind judge is weighing A against B" />}
        </div>
      </div>

      <div className="shrink-0 border-t border-line px-4 sm:px-5 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <div className="flex-1 h-1 bg-line">
            <div className="h-1 bg-ink transition-all duration-500" style={{ width: `${(shown / steps.length) * 100}%` }} />
          </div>
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted whitespace-nowrap">
            {done ? "Blind panel · ruling" : `Blind panel · round ${round} of 2`}
          </span>
        </div>
      </div>
    </>
  );
}

function RoundLabel({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-px flex-1 bg-line" />
      <div className="text-center">
        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink">{label}</div>
        <div className="mt-1 text-[12px] text-muted">{detail}</div>
      </div>
      <div className="h-px flex-1 bg-line" />
    </div>
  );
}

function Avatar({ side }: { side: Side | "judge" }) {
  const letter = side === "judge" ? "J" : side === "X" ? "1" : "2";
  return (
    <span
      className={`grid h-5 w-5 place-items-center font-mono text-[9px] ${
        side === "judge" ? "bg-ink text-paper" : side === "X" ? "border border-line text-ink" : "border border-ink text-ink"
      }`}
    >
      {letter}
    </span>
  );
}

function ArgumentBubble({ side, arg, round, name, full }: { side: Side; arg: Argument; round: 1 | 2; name: string; full: string }) {
  const [open, setOpen] = useState(false);
  const right = side === "Y";
  const lead = arg.claims[0];
  const rest = arg.claims.slice(1);
  return (
    <div className={`flex flex-col ${right ? "items-end" : "items-start"}`}>
      <div className={`mb-2 flex items-center gap-2 text-[12px] text-muted ${right ? "flex-row-reverse" : ""}`}>
        <Avatar side={side} />
        <span>
          Advocate for <span className="text-ink">{name.toLowerCase()}</span>
          {side === "X" && <span className="ml-1.5">· the doctor&apos;s view</span>}
        </span>
      </div>
      <div className={`max-w-[92%] sm:max-w-[82%] border px-4 py-3.5 ${right ? "border-ink/80 bg-paper" : "border-line bg-panel/70"}`}>
        <p className="text-[15px] leading-relaxed">{lead.claim}</p>
        <Facts ids={lead.facts} />
        {round === 2 && arg.concessions[0] && (
          <p className="mt-3 border-t border-line pt-3 text-[13px] leading-relaxed text-muted">
            <span className="mr-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink">Concedes</span>
            {arg.concessions[0]}
          </p>
        )}
        {open && (
          <div className="mt-3 space-y-3 border-t border-line pt-3">
            <p className="text-[12px] text-muted">Full position: {full}</p>
            {rest.map((c, i) => (
              <div key={i}>
                <p className="text-[14px] leading-relaxed">{c.claim}</p>
                <Facts ids={c.facts} />
              </div>
            ))}
          </div>
        )}
      </div>
      {rest.length > 0 && (
        <button onClick={() => setOpen(!open)} className="mt-2 text-[12px] text-muted hover:text-ink">
          {open ? "Show less" : `+ ${rest.length} more points`}
        </button>
      )}
    </div>
  );
}

function Facts({ ids }: { ids: string[] }) {
  if (!ids.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {ids.map((id) => (
        <span key={id} className="border border-line bg-paper px-1.5 py-px font-mono text-[10px] text-muted" title="Fact cited from the case record">
          {id}
        </span>
      ))}
    </div>
  );
}

function VerdictCard({ a }: { a: Analysis }) {
  const v = a.verdict;
  const [open, setOpen] = useState(false);
  const action = v.immediate_action.split(/(?<=\.)\s/)[0];
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-[12px] text-muted">
        <Avatar side="judge" />
        <span>
          Blind judge · <span className="text-ink">ruling</span>
        </span>
      </div>
      <div className="border border-ink">
        <div className="bg-ink px-5 py-4 text-paper">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper/60">Can&apos;t miss</div>
          <div className="mt-1.5 text-xl sm:text-2xl font-medium leading-snug tracking-tight">{v.must_not_miss}</div>
        </div>
        <div className="space-y-4 px-5 py-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Do now</div>
            <p className="mt-1.5 text-[15px] font-medium leading-relaxed">{action}</p>
          </div>
          <p className="text-[14px] leading-relaxed text-muted">{v.plain_english}</p>
          {open && (
            <ul className="space-y-3 border-t border-line pt-4">
              {v.ranking.map((r, i) => (
                <li key={i} className="text-[13px] leading-relaxed">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-medium">{r.diagnosis}</span>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">{r.likelihood}</span>
                  </div>
                  <p className="mt-1 text-muted">{r.why}</p>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line pt-3 text-[12px] text-muted">
            <span>
              Never told which side the doctor is on ·{" "}
              {a.orderSwapConsistent ? "same ruling with A and B swapped" : "ruling changed with A and B swapped"}
            </span>
            <button onClick={() => setOpen(!open)} className="hover:text-ink">
              {open ? "Hide reasoning" : "Show reasoning"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Typing({ side, label }: { side: Side | "judge"; label: string }) {
  const right = side === "Y";
  return (
    <div className={`animate-rise flex flex-col ${right ? "items-end" : "items-start"}`}>
      <div className={`mb-2 flex items-center gap-2 text-[12px] text-muted ${right ? "flex-row-reverse" : ""}`}>
        <Avatar side={side} />
        {label}
      </div>
      <div className="flex gap-1 py-2" aria-label={`${label}…`}>
        {[0, 1, 2].map((i) => (
          <span key={i} className="typing-dot h-1.5 w-1.5 rounded-full bg-ink" />
        ))}
      </div>
    </div>
  );
}
