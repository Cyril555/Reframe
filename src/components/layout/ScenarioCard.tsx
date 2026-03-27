"use client";
import { useRouter } from "next/navigation";
import { Heart, Wind, Brain } from "lucide-react";
import { Scenario } from "@/types/scenario";
import { cn } from "@/lib/utils";

const scenarioIcons: Record<string, React.ElementType> = {
  heart: Heart,
  wind: Wind,
  brain: Brain,
};

interface Props {
  scenario: Scenario;
  compact?: boolean;
  active?: boolean;
}

export function ScenarioCard({ scenario, compact, active }: Props) {
  const router = useRouter();
  const Icon = scenarioIcons[scenario.icon] ?? Heart;

  if (compact) {
    return (
      <button
        onClick={() => router.push(`/chat?scenario=${scenario.id}`)}
        className={cn(
          "w-full text-left px-3 py-2 rounded-lg transition-all text-sm flex items-center gap-2",
          active
            ? "bg-blue-50 text-blue-700 font-medium"
            : "text-slate-600 hover:bg-slate-100"
        )}
      >
        <Icon size={14} />
        <span className="truncate">{scenario.title}</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => router.push(`/chat?scenario=${scenario.id}`)}
      className="bg-white rounded-xl border border-slate-200 p-6 hover:border-blue-400 hover:shadow-md transition-all text-left w-full group"
    >
      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-blue-50 transition-colors">
        <Icon size={20} className="text-slate-500 group-hover:text-blue-600 transition-colors" />
      </div>
      <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-700 transition-colors">
        {scenario.title}
      </h3>
      <p className="text-sm text-slate-500 mb-4">{scenario.subtitle}</p>
      <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
        Start Demo →
      </span>
    </button>
  );
}
