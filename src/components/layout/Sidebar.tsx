"use client";
import Link from "next/link";
import { Scenario } from "@/types/scenario";
import { ScenarioCard } from "./ScenarioCard";
import { ConversationTurn } from "@/types/scenario";
import { useDriftTimeline } from "@/hooks/useDriftTimeline";
import { cn } from "@/lib/utils";

interface Props {
  scenarios: Scenario[];
  activeScenarioId?: string;
  visibleTurns: ConversationTurn[];
}

export function Sidebar({ scenarios, activeScenarioId, visibleTurns }: Props) {
  const driftEvents = useDriftTimeline(visibleTurns);

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-slate-100">
        <Link
          href="/"
          className="w-full text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-3"
        >
          ← All Scenarios
        </Link>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Scenarios
        </p>
        <div className="space-y-1">
          {scenarios.map((s) => (
            <ScenarioCard
              key={s.id}
              scenario={s}
              compact
              active={s.id === activeScenarioId}
            />
          ))}
        </div>
      </div>

      {driftEvents.length > 0 && (
        <div className="p-4 flex-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Drift Timeline
          </p>
          <div className="relative">
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-200" />
            <div className="space-y-4 pl-6">
              {driftEvents.map((event, i) => (
                <div key={i} className="relative">
                  <div
                    className={cn(
                      "absolute -left-4 top-1 w-2.5 h-2.5 rounded-full border-2 border-white",
                      event.type === "framing"
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                    )}
                  />
                  <p className="text-xs font-medium text-slate-500">
                    Turn {event.turnNumber}
                  </p>
                  <p
                    className={cn(
                      "text-xs mt-0.5",
                      event.type === "framing"
                        ? "text-amber-700"
                        : "text-slate-600"
                    )}
                  >
                    {event.label}
                  </p>
                  {event.score >= 40 && (
                    <span
                      className={cn(
                        "inline-block mt-1 text-xs px-1.5 py-0.5 rounded-full font-medium",
                        event.score >= 70
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      )}
                    >
                      Score: {event.score}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
