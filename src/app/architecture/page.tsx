import { readFileSync } from "fs";
import { join } from "path";
import { AgentGraph } from "@/components/AgentGraph";
import { AGENTS } from "@/lib/agents";

export const metadata = { title: "Architecture · Reframe" };

const ROLES = ["reframe-assistant", "reframe-extractor", "reframe-shadow", "reframe-monitor", "reframe-advocate", "reframe-judge"] as const;

const DECISIONS = [
  {
    title: "Blind by construction",
    body: "Each agent starts with an empty context and receives only the message written for it. It has no file, web or connector access, so the doctor's opinion cannot reach the blind side.",
  },
  {
    title: "One agent sees everything, and deletes",
    body: "The Case Extractor is the only bridge. It turns the conversation into numbered facts and logs every opinion it removes.",
  },
  {
    title: "A counterfactual, not a rubric",
    body: "Each reply is scored against what a shadow clinician concluded from the same facts with no opinions attached.",
  },
  {
    title: "The judge doesn't know who's who",
    body: "Arguments arrive as A and B by coin flip, and the judge rules twice, once with the order reversed.",
  },
];

function prompt(role: string) {
  return readFileSync(join(process.cwd(), "traces", "prompts", `${role}.txt`), "utf8");
}

export default function Architecture() {
  return (
    <main>
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-20 sm:pt-28 pb-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Architecture</p>
        <h1 className="mt-6 max-w-4xl text-[clamp(2.5rem,6vw,5rem)] font-medium leading-[0.98] tracking-[-0.04em]">
          Six agents.
          <br />
          <span className="text-ink/30">One barrier between them.</span>
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
          The conversation stays on the left. Everything on the right reasons only from a neutral list of facts.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="border border-line p-6 sm:p-12">
          <div className="mx-auto max-w-3xl">
            <AgentGraph />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">The roles</p>
        <ul className="mt-8 border-t border-line">
          {ROLES.map((id, i) => {
            const a = AGENTS[id];
            return (
              <li key={id} className="border-b border-line">
                <details className="group">
                  <summary className="grid cursor-pointer list-none gap-2 py-6 sm:grid-cols-[3rem,14rem,1fr,auto] sm:items-baseline">
                    <span className="font-mono text-xs text-muted">0{i + 1}</span>
                    <span className="text-lg font-medium tracking-tight">{a.name}</span>
                    <span className="text-[15px] text-muted leading-relaxed">{a.job}</span>
                    <span className="text-xs text-muted group-open:text-ink">{a.model} · Prompt</span>
                  </summary>
                  <div className="pb-8 sm:pl-[17rem] space-y-4">
                    <p className="text-sm">
                      <span className="text-muted">Sees: </span>
                      {a.sees}
                    </p>
                    <pre className="max-h-80 overflow-auto whitespace-pre-wrap border border-line bg-panel p-4 font-mono text-[11px] leading-relaxed">
                      {prompt(id)}
                    </pre>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-24">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Design decisions</p>
          <div className="mt-12 grid gap-12 md:grid-cols-2">
            {DECISIONS.map((d, i) => (
              <div key={d.title} className="border-l border-ink pl-6">
                <div className="font-mono text-xs text-muted">0{i + 1}</div>
                <h3 className="mt-5 text-xl font-medium tracking-tight">{d.title}</h3>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">{d.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
