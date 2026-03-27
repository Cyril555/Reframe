import Link from "next/link";
import {
  MessageSquare,
  Swords,
  Scale,
  Activity,
  AlertTriangle,
  AlertOctagon,
  Building2,
  Bot,
  Stethoscope,
  TrendingUp,
  GitBranch,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { ScenarioCard } from "@/components/layout/ScenarioCard";
import { scenarios } from "@/data/index";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 flex flex-col items-center px-6 py-16">
        <div className="max-w-3xl w-full space-y-16">

          {/* ── Hero ──────────────────────────────────────────────────── */}
          <div className="text-center">
            <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase mb-4">
              Claude X LSE Hackathon · March 2026
            </p>
            <h1 className="text-5xl font-bold text-slate-900 mb-4 tracking-tight">
              <span className="text-blue-600">Re</span>frame.ai
            </h1>
            <p className="text-xl text-slate-500 mb-8 font-light">
              Helping clinicians see what AI-assisted diagnosis might be missing
            </p>
            <a
              href="#scenarios"
              className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Try a Demo Scenario →
            </a>
          </div>

          {/* ── The Problem ───────────────────────────────────────────── */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-8 pt-8 pb-2">
              <p className="text-xs font-bold tracking-widest text-blue-500 uppercase mb-3">
                The Problem
              </p>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                AI assistants tend to agree with clinicians, even when the evidence does not support it.
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                Every major language model exhibits sycophancy: a tendency to validate the
                user&apos;s hypothesis rather than challenge it. In most contexts, this is a
                minor inconvenience. In clinical settings, it presents a genuine patient safety risk.
              </p>
            </div>
            <div className="mx-8 mb-6 border-l-4 border-blue-400 bg-blue-50 px-5 py-4 rounded-r-xl">
              <p className="text-sm text-slate-600 italic leading-relaxed">
                A doctor asks: &ldquo;Could this ECG be consistent with NSTEMI?&rdquo; A sycophantic
                AI surfaces supporting evidence and quietly downplays contradictory signs, because the
                question itself has anchored the framing. The doctor receives confirmation rather than
                a complete clinical picture.
                The AI has said nothing factually wrong. <strong className="text-slate-800 not-italic">That is precisely the problem.</strong>
              </p>
            </div>
            <div className="px-8 pb-8">
              <p className="text-slate-600 leading-relaxed">
                Anchoring bias is the leading cause of diagnostic error, and a sycophantic AI
                amplifies it silently. Unlike hallucination, sycophancy produces no detectable
                error. It produces only plausible, confident agreement. No existing clinical
                product addresses this.
              </p>
            </div>
          </div>

          {/* ── The Product ───────────────────────────────────────────── */}
          <div>
            <p className="text-xs font-bold tracking-widest text-blue-500 uppercase mb-3">
              The Product
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Five agents working without an echo chamber.
            </h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Reframe.ai is a Claude-powered clinical assistant built around a multi-agent
              debate architecture. Rather than a single AI validating the clinician&apos;s framing,
              five specialised agents work in parallel: arguing, challenging, and adjudicating
              to surface the most complete clinical picture available from the evidence.
            </p>

            <div className="space-y-3">
              {[
                {
                  num: "1",
                  icon: MessageSquare,
                  title: "Clinical Assistant",
                  desc: "Standard Claude-powered Q&A covering differential generation, drug interaction checks, and literature summarisation. The entry point for the clinician.",
                  color: "bg-blue-600",
                  badge: null,
                },
                {
                  num: "2",
                  icon: Swords,
                  title: "Debating Agent A",
                  desc: "Argues for the strongest alternative diagnosis to the doctor's working hypothesis. Instructed to steelman its position using only the clinical evidence provided.",
                  color: "bg-purple-600",
                  badge: null,
                },
                {
                  num: "3",
                  icon: GitBranch,
                  title: "Debating Agent B",
                  desc: "Argues for a second competing diagnosis. Challenges Agent A's reasoning and surfaces distinguishing clinical features, replicating a real MDT discussion.",
                  color: "bg-teal-600",
                  badge: null,
                },
                {
                  num: "4",
                  icon: Scale,
                  title: "Impartial Judge Agent",
                  desc: "Receives only the clinical data and the two agents' arguments — never the doctor's original input or working hypothesis. Rules on which diagnosis is best supported by evidence alone, free from anchoring bias at every level.",
                  color: "bg-amber-500",
                  badge: "BLIND",
                },
                {
                  num: "5",
                  icon: Activity,
                  title: "Sycophancy Monitor",
                  desc: "Scores every response 0 to 100 for sycophancy. Detects framing echo, position drift, and differential narrowing. Triggers amber or red flags if the debate was contaminated by the doctor's original framing.",
                  color: "bg-rose-600",
                  badge: null,
                },
              ].map((agent) => {
                const Icon = agent.icon;
                return (
                  <div
                    key={agent.num}
                    className="flex gap-4 bg-white border border-slate-200 rounded-xl p-5 items-start"
                  >
                    <div
                      className={`${agent.color} text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}
                    >
                      {agent.num}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon size={14} className="text-slate-400" />
                        <span className="text-sm font-semibold text-slate-800">{agent.title}</span>
                        {agent.badge && (
                          <span className="text-xs font-bold text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded">
                            {agent.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">{agent.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Sycophancy Scoring ────────────────────────────────────── */}
          <div>
            <p className="text-xs font-bold tracking-widest text-blue-500 uppercase mb-3">
              Sycophancy Scoring
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Real-time flags designed to prompt reflection, not interrupt workflow.
            </h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              The Sycophancy Monitor scores every AI response across five signals and triggers
              contextual flags in the interface. The goal is to invite reconsideration at the
              right moment, without adding friction to the clinical consultation.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-xs font-semibold text-slate-400 mb-1">No Flag</p>
                <p className="text-2xl font-bold text-emerald-600 mb-2">0 – 39</p>
                <p className="text-sm text-slate-500">
                  Response is independent of user framing. No action required.
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-5">
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertTriangle size={12} className="text-amber-500" />
                  <p className="text-xs font-semibold text-amber-600">Amber Flag</p>
                </div>
                <p className="text-2xl font-bold text-amber-600 mb-2">40 – 69</p>
                <p className="text-sm text-amber-800">
                  Possible sycophancy. Gentle prompt to consider alternatives.
                </p>
              </div>
              <div className="bg-red-50 border border-red-300 rounded-xl p-5">
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertOctagon size={12} className="text-red-500" />
                  <p className="text-xs font-semibold text-red-600">Red Flag</p>
                </div>
                <p className="text-2xl font-bold text-red-600 mb-2">70 – 100</p>
                <p className="text-sm text-red-800">
                  Likely sycophancy. Debate agents activate. Judge verdict surfaced.
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Five Detected Signals
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Framing Echo", desc: "AI adopts the doctor's framing as its own conclusion" },
                  { label: "Differential Narrowing", desc: "Differential collapses after a stated preference" },
                  { label: "Position Drift", desc: "Position reversed on pushback without new data" },
                  { label: "Affirmation Language", desc: "Excessive agreement language preceding clinical assertions" },
                  { label: "Agreement Without Evidence", desc: "Validates hypothesis without citing supporting evidence" },
                ].map((signal) => (
                  <div key={signal.label} className="flex gap-2 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-slate-700">{signal.label} </span>
                      <span className="text-xs text-slate-400">: {signal.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Demo Scenarios ────────────────────────────────────────── */}
          <div id="scenarios">
            <p className="text-xs font-bold tracking-widest text-blue-500 uppercase mb-3">
              Live Demo
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Three scenarios, each demonstrating a distinct failure mode.
            </h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Each scenario walks through a realistic clinical consultation in which sycophancy
              develops as the clinician anchors on a working diagnosis. Watch the score change
              as the AI adopts the doctor&apos;s framing, then trigger the Agent Debate to see
              the blind Judge assess the evidence independently.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {scenarios.map((scenario) => (
                <ScenarioCard key={scenario.id} scenario={scenario} />
              ))}
            </div>
          </div>

          {/* ── Why This Wins ─────────────────────────────────────────── */}
          <div>
            <p className="text-xs font-bold tracking-widest text-blue-500 uppercase mb-3">
              Why This Wins
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mb-8">
              What sets Reframe.ai apart.
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  Icon: Building2,
                  title: "A Documented Clinical Problem",
                  desc: "Anchoring bias is the leading cause of diagnostic error. Reframe.ai addresses a well-evidenced patient safety issue, not a speculative one.",
                },
                {
                  Icon: Bot,
                  title: "Genuine Multi-Agent Architecture",
                  desc: "Five coordinated Claude agents work in parallel: a clinical assistant, two debating agents, a blind judge, and a sycophancy monitor. This is a live, working system.",
                },
                {
                  Icon: TrendingUp,
                  title: "An Unaddressed Market Gap",
                  desc: "No existing product offers real-time sycophancy detection at the point of care. Current tools are built for developers, not practising clinicians.",
                },
                {
                  Icon: Stethoscope,
                  title: "Built by a Practising Doctor",
                  desc: "The clinical scenarios and failure modes in this demo reflect real diagnostic reasoning. That level of domain specificity is difficult to replicate without medical training.",
                },
              ].map((item) => (
                <div key={item.title} className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mb-3">
                    <item.Icon size={16} className="text-slate-500" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400 mt-16">
        <span className="font-semibold text-slate-600">Reframe.ai</span> · Claude X LSE Hackathon 2026.
        This is a demonstration prototype. Not for clinical use.
      </footer>
    </div>
  );
}
