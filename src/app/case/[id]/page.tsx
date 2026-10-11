import { notFound } from "next/navigation";
import Link from "next/link";
import { ChatDemo } from "@/components/chat/ChatDemo";
import { CASES } from "@/lib/cases";
import { buildChat } from "@/lib/replay";
import { CASE_IDS, type CaseId, loadChecks, loadTrace } from "@/lib/trace";

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
  const swap = (trace as unknown as { anchorSwap: { from: string; to: string } }).anchorSwap;
  const chat = buildChat(trace, loadChecks()[id], swap);

  return (
    <main className="mx-auto max-w-7xl px-5 sm:px-8 pt-8 pb-16">
      <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] border-b border-line">
        {CASE_IDS.map((other, i) => (
          <Link
            key={other}
            href={`/case/${other}`}
            className={`-mb-px pb-3 border-b ${other === id ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"}`}
          >
            <span className="font-mono text-[11px] mr-1.5">0{i + 1}</span>
            {CASES[other].short}
          </Link>
        ))}
      </nav>
      <div className="max-w-3xl py-7">
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight">{c.title}</h1>
        <p className="mt-2 text-[15px] text-muted leading-relaxed">{c.doctorWants}</p>
      </div>
      <ChatDemo key={id} chat={chat} caseTitle={c.patient} positions={c.positions} />
    </main>
  );
}
