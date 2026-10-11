import { readFileSync } from "fs";
import { join } from "path";
import { EyeOff, Eye } from "lucide-react";
import { AgentGraph } from "@/components/AgentGraph";
import { AGENTS } from "@/lib/agents";

export const metadata = { title: "Architecture · Reframe" };

const ROLES = ["reframe-assistant", "reframe-extractor", "reframe-shadow", "reframe-monitor", "reframe-advocate", "reframe-judge"] as const;

const CANNOT_SEE: Record<(typeof ROLES)[number], string[]> = {
  "reframe-assistant": [],
  "reframe-extractor": ["Anything downstream"],
  "reframe-shadow": ["The conversation", "The doctor's opinion", "The assistant's replies"],
  "reframe-monitor": ["Earlier turns beyond the previous reply", "Later turns"],
  "reframe-advocate": ["The conversation", "The doctor's opinion", "The other advocate's opening (in round 1)"],
  "reframe-judge": ["The conversation", "Which diagnosis the doctor holds", "Which argument came from which side"],
};

const DECISIONS = [
  {
    title: "Blindness is enforced by information flow, not by instruction",
    body: "Telling a model to 'ignore the doctor's opinion' does not remove it from the context. Each Reframe agent is a separate process that starts with an empty context and receives only the message written for it. Its tool access is restricted to a single read-only skill listing, so it cannot open files, browse, or read another agent's output. The judge is blind because the doctor's words never reach it.",
  },
  {
    title: "One agent is allowed to see everything, and its only job is to delete",
    body: "The Case Extractor is the single bridge between the conversation and the blind side. It outputs numbered facts and a list of what it removed and why: hypothesis, preference, pressure or interpretation. The removed list is recorded for auditing and dropped before anything is passed on.",
  },
  {
    title: "A counterfactual, not a heuristic, is the reference for sycophancy",
    body: "The monitor doesn't score replies against a rubric alone. It compares each reply with what a Shadow Clinician concluded from the same facts with the opinions removed. That turns 'is this sycophantic?' into a concrete comparison: what did the reply drop or adopt that the blind view didn't support?",
  },
  {
    title: "Advocates commit before they see each other",
    body: "Debate agents tend to converge on whoever argues most confidently, so round 1 runs in parallel and each advocate writes its opening alone. In round 2 each sees the other's opening and may concede points, but it cannot switch sides.",
  },
  {
    title: "The judge doesn't know who's who",
    body: "Positions reach the judge as A and B, assigned by a recorded coin flip. The judge then runs a second time with the labels reversed. A verdict that changes with the order is a position bias, not a judgement. All three verdicts held.",
  },
  {
    title: "Every claim cites the record",
    body: "Advocates must attach fact IDs to every claim, and the judge must check them. In the recorded runs the judges flagged claims that didn't match their citations, including a pain descriptor ('tearing') that appears in no fact. That came from the assistant and was picked up downstream.",
  },
];

function prompt(role: string) {
  return readFileSync(join(process.cwd(), "traces", "prompts", `${role}.txt`), "utf8");
}

export default function Architecture() {
  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-14">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-monitor">Architecture</p>
      <h1 className="mt-3 font-display text-5xl sm:text-6xl tracking-tight leading-[1.02] max-w-3xl">Six agents, one barrier.</h1>
      <p className="mt-5 max-w-2xl text-lg text-muted leading-relaxed">
        The conversation lives on the left. Everything on the right reasons only from a neutral fact list. The Case Extractor is the
        only path between them.
      </p>

      <div className="mt-10 rounded-2xl border border-line bg-card p-4 sm:p-8">
        <AgentGraph />
      </div>

      <section className="mt-16">
        <h2 className="font-display text-3xl tracking-tight">The roles</h2>
        <p className="mt-2 text-muted max-w-2xl">
          Each role is a Claude Code subagent defined in <code className="font-mono text-sm text-ink">.claude/agents/</code>. The prompts
          below are the exact system prompts the recorded agents ran with, extracted from their transcripts.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {ROLES.map((id) => {
            const a = AGENTS[id];
            return (
              <article key={id} className="rounded-2xl border border-line bg-card p-5 flex flex-col">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 font-medium">
                    <span className={`h-3 w-3 rounded-full bg-${a.colour}`} />
                    {a.name}
                  </h3>
                  <span className="font-mono text-xs text-muted">{a.model}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed">{a.job}</p>
                <div className="mt-4 grid gap-2 text-sm">
                  <div className="flex gap-2">
                    <Eye size={15} className="mt-0.5 shrink-0 text-muted" />
                    <span>
                      <span className="text-muted">Sees: </span>
                      {a.sees}
                    </span>
                  </div>
                  {CANNOT_SEE[id].length > 0 && (
                    <div className="flex gap-2">
                      <EyeOff size={15} className={`mt-0.5 shrink-0 ${a.blind ? "text-judge" : "text-muted"}`} />
                      <span>
                        <span className="text-muted">Never sees: </span>
                        {CANNOT_SEE[id].join(" · ")}
                      </span>
                    </div>
                  )}
                </div>
                <details className="mt-4 text-sm">
                  <summary className="cursor-pointer text-muted hover:text-ink">System prompt</summary>
                  <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-line bg-paper p-3 font-mono text-[11px] leading-relaxed">
                    {prompt(id)}
                  </pre>
                </details>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-3xl tracking-tight">Design decisions</h2>
        <div className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {DECISIONS.map((d, i) => (
            <div key={d.title} className="flex gap-4">
              <span className="font-display text-3xl text-muted leading-none">{i + 1}</span>
              <div>
                <h3 className="font-medium leading-snug">{d.title}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">{d.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-3xl tracking-tight">How a run is orchestrated</h2>
        <ol className="mt-6 space-y-3 max-w-3xl text-sm leading-relaxed">
          {[
            ["Consultation", "For each doctor message, the assistant replies with the full conversation in view."],
            ["Barrier", "The extractor reads the whole conversation, including every pushback, and emits facts. The shadow clinician produces a differential from those facts alone."],
            ["Monitoring", "Each reply is scored against the blind differential. The monitor sees the previous reply, the doctor's message and the new reply, never later turns."],
            ["Debate", "On the highest-scoring turn, one advocate takes the doctor's diagnosis and one takes the strongest alternative. Openings run in parallel, then rebuttals."],
            ["Judgement", "The blind judge rules on the facts and the anonymised arguments, then again with the labels reversed."],
            ["Checks", "An automated leak scan, an anchor-swap extraction and the order-swap verdict confirm the barrier held. Every input is re-verified with npm run verify."],
          ].map(([t, b], i) => (
            <li key={t} className="flex gap-3">
              <span className="font-mono text-xs text-muted pt-0.5 w-5">{i + 1}.</span>
              <span>
                <span className="font-medium">{t}. </span>
                <span className="text-muted">{b}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
