import { notFound } from "next/navigation";
import Link from "next/link";
import { CaseReplay } from "@/components/replay/CaseReplay";
import { CASES } from "@/lib/cases";
import { buildSteps } from "@/lib/replay";
import { CASE_IDS, type CaseId, loadChecks, loadTrace, totals } from "@/lib/trace";

export function generateStaticParams() {
  return CASE_IDS.map((id) => ({ id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const c = CASES[params.id as CaseId];
  return c ? { title: `${c.short} · Reframe`, description: c.patient } : {};
}

export default function CasePage({ params }: { params: { id: string } }) {
  if (!CASE_IDS.includes(params.id as CaseId)) notFound();
  const id = params.id as CaseId;
  const c = CASES[id];
  const trace = loadTrace(id);
  const raw = trace as unknown as { anchorSwap: { from: string; to: string } };
  const steps = buildSteps(trace, loadChecks()[id], raw.anchorSwap);
  const t = totals(trace);

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-10">
      <div className="mb-2 flex flex-wrap gap-3 text-sm text-muted">
        {CASE_IDS.map((other) => (
          <Link key={other} href={`/case/${other}`} className={other === id ? "text-ink font-medium" : "hover:text-ink"}>
            {CASES[other].short}
          </Link>
        ))}
      </div>
      <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] tracking-tight">{c.title}</h1>
      <p className="mt-3 text-sm text-muted">
        A recorded run: {t.calls} agent calls, {Math.round(t.ms / 60000)} minutes of model time, {t.toolCalls} tool calls. Recorded{" "}
        {trace.recordedAt}.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Setup label="The patient" text={c.patient} tone="clinician" />
        <Setup label="What the doctor wants" text={c.doctorWants} tone="assistant" />
        <Setup label="Why it matters" text={c.danger} tone="red" />
      </div>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-muted">Medical terms used in this case</summary>
        <dl className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-[auto,1fr]">
          {c.glossary.map((g) => (
            <div key={g.term} className="contents">
              <dt className="font-medium">{g.term}</dt>
              <dd className="text-muted">{g.meaning}</dd>
            </div>
          ))}
        </dl>
      </details>

      <p className="mt-8 mb-4 text-sm text-muted">
        Step through with the controls below, or the ← → keys. Space plays.
      </p>
      <CaseReplay caseId={id} steps={steps} />
    </main>
  );
}

function Setup({ label, text, tone }: { label: string; text: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <div className={`text-[11px] font-medium uppercase tracking-widest text-${tone}`}>{label}</div>
      <p className="mt-1.5 text-sm leading-relaxed">{text}</p>
    </div>
  );
}
