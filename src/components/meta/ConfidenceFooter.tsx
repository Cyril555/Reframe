"use client";
import { AlertTriangle, FileText, BookOpen, GitBranch } from "lucide-react";
import { ConfidenceData } from "@/types/scenario";
import { cn } from "@/lib/utils";

const SourceIcon = ({ sourceType }: { sourceType: ConfidenceData["sourceType"] }) => {
  if (sourceType === "guidelines") return <FileText size={11} className="inline-block" />;
  if (sourceType === "literature") return <BookOpen size={11} className="inline-block" />;
  return <GitBranch size={11} className="inline-block" />;
};

export function ConfidenceFooter({ confidence }: { confidence: ConfidenceData }) {
  const qualityColor = {
    strong: "text-emerald-600",
    moderate: "text-amber-600",
    limited: "text-red-600",
  }[confidence.evidenceQuality];

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-b-xl text-xs text-slate-500 border-t border-slate-100 flex-wrap">
      <span>
        Evidence:{" "}
        <span className={cn("font-medium", qualityColor)}>
          {confidence.evidenceQuality.charAt(0).toUpperCase() + confidence.evidenceQuality.slice(1)}
        </span>
      </span>
      {confidence.uncertaintyFlag && confidence.uncertaintyNote && (
        <span className="flex items-center gap-1 text-amber-600">
          <AlertTriangle size={11} />
          <span>{confidence.uncertaintyNote}</span>
        </span>
      )}
      <span className="flex items-center gap-1">
        <SourceIcon sourceType={confidence.sourceType} />
        {confidence.sourceType.charAt(0).toUpperCase() +
          confidence.sourceType.slice(1).replace("-", " ")}
      </span>
    </div>
  );
}
