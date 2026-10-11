"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, PanelRight } from "lucide-react";
import { Markdown } from "@/components/Markdown";
import type { Chat } from "@/lib/chat";
import { AnalysisDrawer, type DrawerTab } from "./AnalysisDrawer";
import { DebateView } from "./DebateView";

// Pacing for the automatic replay, in milliseconds.
const BEFORE_DOCTOR = 700;
const BEFORE_TYPING = 900;
const TYPING = 1700;
const READING = 3600;
const TO_DEBATE = 4000;

export function ChatDemo({ chat, caseTitle, positions }: { chat: Chat; caseTitle: string; positions: { X: string; Y: string } }) {
  const { messages } = chat;
  const [shown, setShown] = useState(0); // number of messages visible
  const [typing, setTyping] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [mode, setMode] = useState<"consult" | "debate">("consult");
  const [debateRun, setDebateRun] = useState(0); // bumping this restarts the debate
  const [debateDone, setDebateDone] = useState(false);
  const handedOver = useRef(false); // the automatic handoff to the debate happens once per playthrough
  const [drawer, setDrawer] = useState<{ open: boolean; tab: DrawerTab; turn: number }>({ open: false, tab: "drift", turn: 1 });
  const scroller = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLDivElement | null)[]>([]);
  const done = shown >= messages.length;
  const finished = mode === "consult" ? done : debateDone;

  // Drive the replay: doctor message, then a typing indicator, then the reply.
  useEffect(() => {
    if (!playing || done) return;
    const next = messages[shown];
    const prev = messages[shown - 1];
    if (next.role === "doctor") {
      const t = setTimeout(() => setShown((s) => s + 1), shown === 0 ? BEFORE_DOCTOR : prev?.role === "assistant" ? READING : BEFORE_DOCTOR);
      return () => clearTimeout(t);
    }
    const t1 = setTimeout(() => setTyping(true), BEFORE_TYPING);
    const t2 = setTimeout(() => {
      setTyping(false);
      setShown((s) => s + 1);
    }, BEFORE_TYPING + TYPING);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [playing, shown, done, messages]);

  // Keep the newest message in view, aligned to its top so long replies read from the start.
  useEffect(() => {
    const box = scroller.current;
    const el = items.current[shown - 1];
    if (!box || !el) return;
    box.scrollTo({ top: Math.max(0, el.offsetTop - 24), behavior: "smooth" });
  }, [shown]);

  useEffect(() => {
    if (typing && scroller.current) scroller.current.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [typing]);

  // When the consultation ends, hand over to the blind panel.
  useEffect(() => {
    if (!done || !playing || mode !== "consult" || handedOver.current) return;
    const t = setTimeout(() => showDebate(), TO_DEBATE);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, playing, mode]);

  const showDebate = () => {
    handedOver.current = true;
    setMode("debate");
    setPlaying(true);
  };

  const onDebateDone = useCallback(() => setDebateDone(true), []);

  const restart = useCallback(() => {
    setPlaying(true);
    if (mode === "debate") {
      setDebateDone(false);
      setDebateRun((n) => n + 1);
      return;
    }
    handedOver.current = false;
    setShown(0);
    setTyping(false);
    scroller.current?.scrollTo({ top: 0 });
  }, [mode]);

  const switchTo = (m: "consult" | "debate") => {
    if (m === mode) return;
    handedOver.current = true;
    setMode(m);
    setPlaying(true);
    if (m === "consult") {
      setShown(messages.length);
      setTyping(false);
    }
  };

  const currentTurn = messages[Math.max(0, shown - 1)]?.turn ?? 1;
  const openAnalysis = (tab: DrawerTab, turn = currentTurn) => {
    setPlaying(false);
    setDrawer({ open: true, tab, turn });
  };

  return (
    <>
      <div className="flex h-[calc(100svh-15rem)] min-h-[520px] flex-col border border-line bg-paper">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 sm:px-5 h-12 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`hidden sm:block h-1.5 w-1.5 shrink-0 rounded-full ${playing && !finished ? "bg-ink animate-pulse" : "bg-muted/50"}`} />
            <div className="flex h-8 shrink-0 border border-line text-[13px]" role="tablist">
              {(["consult", "debate"] as const).map((m) => (
                <button
                  key={m}
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => switchTo(m)}
                  className={`px-3 transition-colors ${mode === m ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}
                >
                  {m === "consult" ? "Consultation" : "Blind debate"}
                </button>
              ))}
            </div>
            <span className="hidden lg:block truncate text-[13px] text-muted">{caseTitle}</span>
          </div>
          <div className="flex items-center gap-1">
            {!finished && (
              <IconButton label={playing ? "Pause" : "Play"} onClick={() => setPlaying(!playing)}>
                {playing ? <Pause size={15} /> : <Play size={15} />}
              </IconButton>
            )}
            <IconButton label="Start over" onClick={restart}>
              <RotateCcw size={15} />
            </IconButton>
            <button
              onClick={() => openAnalysis(mode === "debate" ? "panel" : "drift")}
              className="ml-1 inline-flex items-center gap-1.5 border border-line px-3 h-8 text-[13px] hover:border-ink transition-colors"
            >
              <PanelRight size={14} /> <span className="hidden sm:inline">Analysis</span>
            </button>
          </div>
        </div>

        {mode === "debate" ? (
          <DebateView key={debateRun} a={chat.analysis} positions={positions} playing={playing} onDone={onDebateDone} />
        ) : (
          <>
            {/* Messages */}
            <div ref={scroller} className="relative flex-1 overflow-y-auto px-4 sm:px-8 py-8">
              <div className="mx-auto max-w-2xl space-y-8">
                {messages.slice(0, shown).map((m, i) => (
                  <div key={i} ref={(el) => { items.current[i] = el; }} className="animate-rise">
                    {m.role === "doctor" ? (
                      <DoctorMessage text={m.text} note={m.note} />
                    ) : (
                      <AssistantMessage text={m.text} onAnalysis={() => openAnalysis("drift", m.turn)} />
                    )}
                  </div>
                ))}
                {typing && <Typing />}
                {done && (
                  <div className="animate-rise border-t border-line pt-6 text-center">
                    <p className="text-[13px] text-muted">End of the recorded consultation</p>
                    <button onClick={showDebate} className="mt-4 inline-flex items-center gap-2 bg-ink px-4 h-10 text-sm text-paper hover:bg-ink/85 transition-colors">
                      Watch the blind panel debate it
                    </button>
                    {playing && !handedOver.current && <p className="mt-3 text-[12px] text-muted">Starting automatically…</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Faux composer, so it reads as a chat */}
            <div className="shrink-0 border-t border-line px-4 sm:px-5 py-3">
              <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
                <div className="flex-1 h-1 bg-line">
                  <div className="h-1 bg-ink transition-all duration-500" style={{ width: `${(shown / messages.length) * 100}%` }} />
                </div>
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted whitespace-nowrap">
                  Recorded run · turn {Math.max(1, messages[Math.max(0, shown - 1)]?.turn ?? 1)} of 5
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      <AnalysisDrawer
        analysis={chat.analysis}
        open={drawer.open}
        tab={drawer.tab}
        turn={drawer.turn}
        onTab={(tab) => setDrawer((d) => ({ ...d, tab }))}
        onTurn={(turn) => setDrawer((d) => ({ ...d, turn }))}
        onClose={() => setDrawer((d) => ({ ...d, open: false }))}
      />
    </>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className="grid h-8 w-8 place-items-center text-muted hover:text-ink transition-colors">
      {children}
    </button>
  );
}

const NOTE = {
  pressure: "Added for the experiment · pressure only, no new clinical facts",
  findings: "New clinical findings",
  change: "The doctor changes course",
};

function DoctorMessage({ text, note }: { text: string; note?: keyof typeof NOTE }) {
  return (
    <div className="flex flex-col items-end">
      <span className="mb-1.5 text-[12px] text-muted">Doctor</span>
      <div className="max-w-[85%] sm:max-w-[78%] bg-ink px-4 py-3 text-[15px] leading-relaxed text-paper">{text}</div>
      {note && (
        <span className="mt-1.5 text-[11px] text-muted">
          {NOTE[note]}
        </span>
      )}
    </div>
  );
}

function AssistantMessage({ text, onAnalysis }: { text: string; onAnalysis: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-[12px] text-muted">
        <span className="grid h-5 w-5 place-items-center border border-line font-mono text-[9px] text-ink">AI</span>
        AI assistant
      </div>
      <div className={open ? "" : "relative max-h-52 overflow-hidden"}>
        <Markdown>{text}</Markdown>
        {!open && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-paper to-transparent" />}
      </div>
      <div className="mt-2 flex gap-5 text-[12px] text-muted">
        <button onClick={() => setOpen(!open)} className="hover:text-ink">
          {open ? "Show less" : "Show full reply"}
        </button>
        <button onClick={onAnalysis} className="hover:text-ink">
          Analysis
        </button>
      </div>
    </div>
  );
}

function Typing() {
  return (
    <div className="animate-rise">
      <div className="mb-2 flex items-center gap-2 text-[12px] text-muted">
        <span className="grid h-5 w-5 place-items-center border border-line font-mono text-[9px] text-ink">AI</span>
        AI assistant
      </div>
      <div className="flex gap-1 py-2" aria-label="The assistant is typing">
        {[0, 1, 2].map((i) => (
          <span key={i} className="typing-dot h-1.5 w-1.5 rounded-full bg-ink" />
        ))}
      </div>
    </div>
  );
}
