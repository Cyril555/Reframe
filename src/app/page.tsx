import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { CASES } from "@/lib/cases";
import { scoresOf } from "@/lib/replay";
import { CASE_IDS, assistantReply, judgeChoice, loadTrace, totals, verdict } from "@/lib/trace";

// Pull a sentence out of a recorded output, so quotes on this page can never
// drift from the trace.
function sentence(text: string, startsWith: string) {
  const i = text.indexOf(startsWith);
  if (i < 0) throw new Error(`quote not found in trace: ${startsWith}`);
  const end = text.slice(i).search(/[.!?](\s|$)/);
  return text.slice(i, i + end + 1);
}

const STEPS = [
  {
    n: "01",
    title: "Watch",
    body: "A monitor agent scores every reply for how far it bends toward the doctor instead of the evidence.",
  },
  {
    n: "02",
    title: "Isolate",
    body: "A barrier agent strips every opinion, hunch and appeal to seniority before the case goes any further.",
  },
  {
    n: "03",
    title: "Judge blind",
    body: "Two advocates argue, and a judge rules from the facts alone, never knowing which side the doctor is on.",
  },
];

export default function Home() {
  const traces = CASE_IDS.map((id) => loadTrace(id));
  const aortic = traces[0];
  const caved = sentence(assistantReply(aortic, 4)!.output, "The decision is yours");
  const held = sentence(verdict(aortic, "original")!.immediate_action, "Hold");
  const peak = Math.max(...traces.flatMap((t) => scoresOf(t).slice(0, 4).map((s) => s ?? 0)));
  const stable = traces.filter((t) => judgeChoice(t, "original") === judgeChoice(t, "swapped")).length;
  const calls = traces.reduce((s, t) => s + totals(t).calls, 0);
  const tools = traces.reduce((s, t) => s + totals(t).toolCalls, 0);

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-24 sm:pt-36 pb-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Multi-agent oversight for clinical AI</p>
        <h1 className="mt-6 text-[clamp(2.75rem,7.5vw,6.5rem)] font-medium leading-[0.95] tracking-[-0.04em]">
          When the doctor pushes,
          <br />
          <span className="text-ink/30">does the AI push back?</span>
        </h1>
        <p className="mt-10 max-w-xl text-lg leading-relaxed text-muted">
          Reframe watches a clinical AI assistant for signs it is agreeing with the doctor instead of the evidence, and asks a panel of
          agents that cannot see what the doctor wants.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-6">
          <Link href="/case/aortic-dissection" className="inline-flex items-center gap-2 bg-ink px-6 h-12 text-sm font-medium text-paper hover:bg-ink/85 transition-colors">
            Watch the demo <ArrowRight size={16} />
          </Link>
          <Link href="/architecture" className="text-sm font-medium underline underline-offset-4 decoration-line hover:decoration-ink">
            How it works
          </Link>
        </div>
      </section>

      {/* The moment */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-24">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">One case, same facts</p>
          <h2 className="mt-4 max-w-3xl text-3xl sm:text-5xl font-medium tracking-[-0.03em] leading-[1.05]">Two very different answers.</h2>
          <div className="mt-16 grid gap-px bg-line md:grid-cols-2 border border-line">
            <figure className="bg-paper p-8 sm:p-10">
              <figcaption className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">The AI assistant, under pressure</figcaption>
              <blockquote className="mt-6 text-2xl sm:text-[1.75rem] leading-snug tracking-tight">“{caved}”</blockquote>
              <p className="mt-6 text-sm text-muted">Then it listed blood-thinner doses for a patient who might have a torn aorta.</p>
            </figure>
            <figure className="bg-paper p-8 sm:p-10">
              <figcaption className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">The blind judge, same facts</figcaption>
              <blockquote className="mt-6 text-2xl sm:text-[1.75rem] leading-snug tracking-tight">“{held}”</blockquote>
              <p className="mt-6 text-sm text-muted">It never learned which diagnosis the doctor wanted.</p>
            </figure>
          </div>
          <p className="mt-6 text-sm text-muted">Two turns later the doctor checked the other arm. It was a torn aorta.</p>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-24">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">How it works</p>
          <h2 className="mt-4 max-w-3xl text-3xl sm:text-5xl font-medium tracking-[-0.03em] leading-[1.05]">
            Six agents. One barrier between them.
          </h2>
          <div className="mt-16 grid gap-10 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="border-l border-ink pl-6">
                <div className="font-mono text-xs text-muted">{s.n}</div>
                <h3 className="mt-6 text-xl font-medium tracking-tight">{s.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{s.body}</p>
              </div>
            ))}
          </div>
          <Link href="/architecture" className="mt-14 inline-flex items-center gap-1.5 text-sm font-medium hover:gap-2.5 transition-all">
            See the architecture <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* Numbers */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-24 grid gap-12 sm:grid-cols-3">
          {[
            [String(peak), "Highest sycophancy score under pressure alone, out of 100"],
            [`${stable}/3`, "Blind verdicts unchanged when the arguments were reversed"],
            [String(tools), `Tool calls across ${calls} recorded agent calls. No agent could peek.`],
          ].map(([v, l]) => (
            <div key={l}>
              <div className="text-6xl font-medium tracking-[-0.04em]">{v}</div>
              <p className="mt-4 max-w-[16rem] text-sm leading-relaxed text-muted">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cases */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-24">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Recorded cases</p>
          <ul className="mt-10 border-t border-line">
            {CASE_IDS.map((id, i) => (
              <li key={id}>
                <Link href={`/case/${id}`} className="group flex items-center gap-6 border-b border-line py-7">
                  <span className="font-mono text-xs text-muted w-6">0{i + 1}</span>
                  <span className="flex-1 text-xl sm:text-3xl font-medium tracking-tight">{CASES[id].title}</span>
                  <ArrowUpRight size={22} className="text-muted group-hover:text-ink group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
