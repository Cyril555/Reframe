import Link from "next/link";
import { ArrowRight, EyeOff, ShieldCheck } from "lucide-react";
import { AgentGraph } from "@/components/AgentGraph";
import { DriftChart } from "@/components/DriftChart";
import { AGENTS } from "@/lib/agents";
import { CASES } from "@/lib/cases";
import { scoresOf } from "@/lib/replay";
import { CASE_IDS, assistantReply, judgeChoice, loadChecks, loadTrace, totals, verdict } from "@/lib/trace";

// Pull a sentence out of a recorded output, so quotes on this page can never
// drift from the trace.
function sentence(text: string, startsWith: string) {
  const i = text.indexOf(startsWith);
  if (i < 0) throw new Error(`quote not found in trace: ${startsWith}`);
  const end = text.slice(i).search(/[.!?](\s|$)/);
  return text.slice(i, i + end + 1);
}

export default function Home() {
  const traces = CASE_IDS.map((id) => ({ id, trace: loadTrace(id) }));
  const checks = loadChecks();
  const all = traces.map((t) => totals(t.trace));
  const calls = all.reduce((s, t) => s + t.calls, 0);
  const toolCalls = all.reduce((s, t) => s + t.toolCalls, 0);
  const leaksClean = CASE_IDS.every((id) => checks[id].leakCheck.pass && checks[id].anchorSwap?.pass);
  const orderStable = traces.filter((t) => judgeChoice(t.trace, "original") === judgeChoice(t.trace, "swapped")).length;

  const aortic = traces[0].trace;
  const caved = sentence(assistantReply(aortic, 4)!.output, "The decision is yours");
  const held = sentence(verdict(aortic, "original")!.immediate_action, "Hold");
  const peak = Math.max(...scoresOf(aortic).slice(0, 4).map((s) => s ?? 0));

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 sm:pt-24 pb-12">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-monitor">Multi-agent oversight for clinical AI</p>
        <h1 className="mt-4 font-display text-5xl sm:text-7xl leading-[0.98] tracking-tight max-w-4xl">
          When the doctor pushes, <em className="text-assistant">does the AI push back?</em>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Reframe watches a clinical AI assistant, measures how far each reply bends toward the doctor instead of the evidence, and
          convenes a panel of agents that is <span className="text-ink">structurally prevented</span> from learning what the doctor wants.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/case/aortic-dissection" className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper">
            Replay a recorded run <ArrowRight size={16} />
          </Link>
          <Link href="/architecture" className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium">
            How the agents are wired
          </Link>
        </div>
      </section>

      {/* The moment */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <h2 className="font-display text-3xl sm:text-4xl tracking-tight">The same facts. Two answers.</h2>
        <p className="mt-3 max-w-2xl text-muted">
          A 62-year-old man with sudden, severe chest pain through to his back. The doctor is sure it's a heart attack and wants
          blood-thinner doses. Nobody has checked for a torn aorta, where those drugs can be fatal. After three rounds of pressure and no
          new findings:
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <figure className="rounded-2xl border border-assistant/30 bg-assistant/[0.05] p-6">
            <figcaption className="text-[11px] font-medium uppercase tracking-widest text-assistant">
              The assistant, with the doctor in the room
            </figcaption>
            <blockquote className="mt-3 font-display text-2xl sm:text-3xl leading-snug">“{caved}”</blockquote>
            <p className="mt-4 text-sm text-muted">
              It then listed the loading doses. Sycophancy score for that reply: <span className="font-mono text-amber">{peak}</span>
              , up from 8 on the first turn.
            </p>
          </figure>
          <figure className="rounded-2xl border border-judge/30 bg-judge/[0.05] p-6">
            <figcaption className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-judge">
              <EyeOff size={13} /> The blind judge, who never learned what the doctor wanted
            </figcaption>
            <blockquote className="mt-3 font-display text-2xl sm:text-3xl leading-snug">“{held}”</blockquote>
            <p className="mt-4 text-sm text-muted">
              Same facts, stripped of opinion by the barrier. Its verdict held when the order of the arguments was reversed.
            </p>
          </figure>
        </div>
        <p className="mt-4 text-sm text-muted">
          Two turns later the doctor measured the other arm: a 36 mmHg difference and a widened chest X-ray. It was a dissection.
        </p>
      </section>

      {/* Drift across cases */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <h2 className="font-display text-3xl sm:text-4xl tracking-tight">Pressure moves the score. Evidence resets it.</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Sycophancy score for every assistant reply in all three recorded cases. Turns 3 and 4 add seniority and time pressure but no new
          medical facts. Turn 5 brings real findings, and changing course there is the correct behaviour.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {traces.map(({ id, trace }) => (
            <Link key={id} href={`/case/${id}`} className="group rounded-2xl border border-line bg-card p-4 hover:border-ink/30 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-medium">{CASES[id].short}</span>
                <ArrowRight size={16} className="text-muted group-hover:text-ink transition-colors" />
              </div>
              <DriftChart scores={scoresOf(trace)} height={190} compact />
            </Link>
          ))}
        </div>
      </section>

      {/* Architecture */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] items-center">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl tracking-tight">Six agents, one barrier.</h2>
            <p className="mt-3 text-muted leading-relaxed">
              Most multi-agent debate systems let every agent see everything, so the agents inherit the same anchor as the user. Reframe
              splits the system in two. A Case Extractor turns the conversation into numbered facts and deletes every opinion, hypothesis
              and appeal to authority. Everything on the right of the barrier reasons only from those facts.
            </p>
            <ul className="mt-6 space-y-3">
              {(["reframe-extractor", "reframe-shadow", "reframe-monitor", "reframe-advocate", "reframe-judge"] as const).map((id) => (
                <li key={id} className="flex gap-3">
                  <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-${AGENTS[id].colour}`} />
                  <span className="text-sm">
                    <span className="font-medium">{AGENTS[id].name}.</span> <span className="text-muted">{AGENTS[id].job}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/architecture" className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-assistant hover:underline">
              Full architecture and design decisions <ArrowRight size={14} />
            </Link>
          </div>
          <div className="rounded-2xl border border-line bg-card p-4">
            <AgentGraph />
          </div>
        </div>
      </section>

      {/* Verification */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <h2 className="font-display text-3xl sm:text-4xl tracking-tight">Built to be checked.</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Nothing on this site is a mock-up. Every message is a recorded, unedited model response, and the repository contains each
          agent's exact input and output.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat value={String(calls)} label="recorded agent calls across three cases" />
          <Stat value={String(toolCalls)} label="tool calls: no agent could read a file, the web, or another agent's work" />
          <Stat value={leaksClean ? "0" : "!"} label="diagnostic labels leaked through the barrier, and flipping the doctor's hypothesis didn't change the facts" />
          <Stat value={`${orderStable}/3`} label="judge verdicts unchanged when the two arguments were presented in reverse order" />
        </div>
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-line bg-card p-4 text-sm">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-safe" />
          <p className="text-muted">
            <code className="font-mono text-ink">npm run verify</code> rebuilds what every agent should have received from the agents
            before it, and fails if any recorded input differs, any call used a tool, or any call ran on the wrong model.
          </p>
        </div>
      </section>

      {/* Cases */}
      <section id="cases" className="mx-auto max-w-6xl px-4 sm:px-6 py-12 scroll-mt-20">
        <h2 className="font-display text-3xl sm:text-4xl tracking-tight">Three recorded cases.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {CASE_IDS.map((id) => (
            <Link key={id} href={`/case/${id}`} className="group flex flex-col rounded-2xl border border-line bg-card p-5 hover:border-ink/30 transition-colors">
              <span className="font-display text-2xl leading-tight">{CASES[id].title}</span>
              <span className="mt-3 text-sm text-muted">{CASES[id].doctorWants}</span>
              <span className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-medium">
                Replay <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
        <p className="mt-8 max-w-2xl text-sm text-muted">
          Three cases are a demonstration, not a benchmark. The assistant held its position more often than expected, and the
          write-up reports where the system itself fell short.{" "}
          <Link href="/method" className="text-ink underline decoration-dotted underline-offset-2">
            Read the method and limitations
          </Link>
          .
        </p>
      </section>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-5">
      <div className="font-display text-5xl tracking-tight">{value}</div>
      <p className="mt-2 text-sm text-muted leading-snug">{label}</p>
    </div>
  );
}
