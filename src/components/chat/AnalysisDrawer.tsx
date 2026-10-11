"use client";
import { useEffect } from "react";
import { X } from "lucide-react";
import { DriftChart } from "@/components/DriftChart";
import { TURN_LABELS, band } from "@/lib/agents";
import type { Analysis } from "@/lib/chat";

export type DrawerTab = "drift" | "panel" | "checks";

const TABS: { id: DrawerTab; label: string }[] = [
  { id: "drift", label: "Score" },
  { id: "panel", label: "Blind panel" },
  { id: "checks", label: "Checks" },
];

const SIGNAL: Record<string, string> = {
  framing_echo: "Echoes the doctor's framing",
  differential_narrowing: "Drops a serious alternative",
  position_drift: "Shifts without new evidence",
  affirmation_language: "Defers before reasoning",
  agreement_without_evidence: "Agrees without evidence",
};

const BAND_TEXT = { safe: "text-safe", amber: "text-amber", red: "text-red" };

export function AnalysisDrawer({
  analysis,
  open,
  tab,
  turn,
  onTab,
  onTurn,
  onClose,
}: {
  analysis: Analysis;
  open: boolean;
  tab: DrawerTab;
  turn: number;
  onTab: (t: DrawerTab) => void;
  onTurn: (n: number) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-ink/10 transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        aria-hidden
      />
      <aside
        aria-label="Analysis"
        aria-hidden={!open}
        className={`fixed right-0 top-0 z-50 flex h-full w-full sm:w-[480px] flex-col border-l border-line bg-paper transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-5">
          <nav className="flex gap-6 text-[13px]">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => onTab(t.id)}
                className={`h-14 border-b-2 -mb-px transition-colors ${tab === t.id ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"}`}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <button onClick={onClose} aria-label="Close analysis" className="text-muted hover:text-ink">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-6">
          {tab === "drift" && <DriftTab a={analysis} turn={turn} onTurn={onTurn} />}
          {tab === "panel" && <PanelTab a={analysis} />}
          {tab === "checks" && <ChecksTab a={analysis} />}
        </div>
      </aside>
    </>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{children}</div>;
}

function DriftTab({ a, turn, onTurn }: { a: Analysis; turn: number; onTurn: (n: number) => void }) {
  const m = a.monitors[turn - 1];
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted leading-relaxed">
        A separate monitor agent scores each reply from 0 to 100: how far it bent toward the doctor rather than the evidence.
      </p>
      <DriftChart scores={a.monitors.map((x) => x.score)} active={turn} height={170} />
      <ul className="border-t border-line">
        {a.monitors.map((x, i) => (
          <li key={i}>
            <button
              onClick={() => onTurn(i + 1)}
              className={`flex w-full items-center justify-between border-b border-line py-3 text-left text-sm transition-colors ${
                turn === i + 1 ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              <span>
                <span className="font-mono text-xs mr-3">0{i + 1}</span>
                {TURN_LABELS[i]}
              </span>
              <span className={`font-mono ${BAND_TEXT[band(x.score)]}`}>{x.score}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="space-y-4">
        <Label>Turn {turn} · monitor's note</Label>
        <p className="text-[15px] leading-relaxed">{m.plain_english}</p>
        {m.signals.length > 0 && (
          <details className="text-sm">
            <summary className="cursor-pointer text-muted hover:text-ink">
              {m.signals.length} signal{m.signals.length > 1 ? "s" : ""} detected
            </summary>
            <ul className="mt-3 space-y-3">
              {m.signals.map((s, i) => (
                <li key={i} className="border-l-2 border-ink pl-3">
                  <div className="text-xs font-medium">{SIGNAL[s.type] ?? s.type}</div>
                  <q className="mt-1 block text-muted italic">{s.quote}</q>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}

function PanelTab({ a }: { a: Analysis }) {
  const v = a.verdict;
  const removed = a.recordPre.redacted.filter((r) => r.source === "clinician");
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <Label>Verdict</Label>
        <p className="text-xl leading-snug font-medium tracking-tight">{v.immediate_action.split(/(?<=\.)\s/)[0]}</p>
        <p className="text-sm text-muted leading-relaxed">{v.plain_english}</p>
        <dl className="grid grid-cols-[7.5rem,1fr] gap-y-2 border-t border-line pt-4 text-sm">
          <dt className="text-muted">Can't miss</dt>
          <dd>{v.must_not_miss}</dd>
          <dt className="text-muted">Arguments reversed</dt>
          <dd>{a.orderSwapConsistent ? "Same verdict" : "Verdict changed"}</dd>
        </dl>
      </section>

      <section className="space-y-3">
        <Label>What the panel never saw</Label>
        <p className="text-sm text-muted leading-relaxed">
          Before the panel sees anything, a barrier agent removes every opinion. These are some of the doctor's words it removed:
        </p>
        <ul className="space-y-2 text-sm">
          {removed.slice(0, 4).map((r, i) => (
            <li key={i} className="text-muted line-through decoration-ink/40">
              {r.text}
            </li>
          ))}
        </ul>
        <details className="text-sm">
          <summary className="cursor-pointer text-muted hover:text-ink">The {a.recordPre.facts.length} facts it did see</summary>
          <ol className="mt-3 space-y-1.5">
            {a.recordPre.facts.map((f) => (
              <li key={f.id} className="flex gap-3">
                <span className="w-7 shrink-0 font-mono text-xs text-muted">{f.id}</span>
                {f.text}
              </li>
            ))}
          </ol>
        </details>
      </section>

    </div>
  );
}

function ChecksTab({ a }: { a: Analysis }) {
  const anchor = a.checks.anchorSwap!;
  const rows = [
    {
      ok: a.checks.leakCheck.pass,
      title: "No diagnosis leaked to the blind side",
      body: "An automated scan of every fact list the blind agents received.",
    },
    {
      ok: anchor.pass,
      title: "Flipping the doctor's opinion changed nothing",
      body: `The barrier ran twice, once with the doctor's hypothesis reversed. Both produced ${anchor.factCount.original} facts with identical clinical values.`,
    },
    {
      ok: a.orderSwapConsistent,
      title: "The judge wasn't swayed by order",
      body: "The judge ruled again with the two arguments in reverse order and reached the same verdict.",
    },
  ];
  return (
    <div className="space-y-6">
      <ul className="border-t border-line">
        {rows.map((r) => (
          <li key={r.title} className="flex gap-4 border-b border-line py-4">
            <span className={`font-mono text-xs pt-0.5 ${r.ok ? "text-safe" : "text-red"}`}>{r.ok ? "PASS" : "FAIL"}</span>
            <div>
              <div className="text-sm font-medium">{r.title}</div>
              <p className="mt-1 text-sm text-muted leading-relaxed">{r.body}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted leading-relaxed">
        Every agent's exact input and output is in the repository. <code className="font-mono text-ink">npm run verify</code> re-derives
        each input and fails on any difference.
      </p>
    </div>
  );
}
