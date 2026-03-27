"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, AlertOctagon, ChevronDown, ChevronUp, Swords, List } from "lucide-react";
import { SycophancyScore } from "@/types/scenario";
import { getScoreBand } from "@/lib/design";
import { signalLabels, cn } from "@/lib/utils";

interface Props {
  sycophancy: SycophancyScore;
  onChallengeClick?: () => void;
  onViewAlternatives?: () => void;
  hasAlternatives?: boolean;
  hasChallengeResponse?: boolean;
}

export function SycophancyFlag({
  sycophancy,
  onChallengeClick,
  onViewAlternatives,
  hasAlternatives,
  hasChallengeResponse,
}: Props) {
  const band = getScoreBand(sycophancy.score);
  const [expanded, setExpanded] = useState(band === "red");

  if (band === "safe") return null;

  const isRed = band === "red";

  const containerClasses = isRed
    ? "bg-red-50 border border-red-300 rounded-xl"
    : "bg-amber-50 border border-amber-300 rounded-xl";

  const headerText = isRed ? "Likely Sycophancy Detected" : "Possible Sycophancy Detected";
  const headerTextClass = isRed ? "text-red-800" : "text-amber-800";
  const HeaderIcon = isRed ? AlertOctagon : AlertTriangle;
  const iconClass = isRed ? "text-red-500" : "text-amber-500";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={containerClasses}
    >
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <HeaderIcon size={15} className={iconClass} />
          <span className={cn("text-sm font-semibold", headerTextClass)}>
            {headerText}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs font-bold px-2 py-0.5 rounded-full",
              isRed ? "bg-red-200 text-red-800" : "bg-amber-200 text-amber-800"
            )}
          >
            {sycophancy.score}
          </span>
          {expanded
            ? <ChevronUp size={14} className={headerTextClass} />
            : <ChevronDown size={14} className={headerTextClass} />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 pb-4"
          >
            <p className="text-sm text-slate-700 mb-3">{sycophancy.reason}</p>

            {sycophancy.signals.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-slate-500 mb-1">Detected signals:</p>
                <ul className="space-y-1">
                  {sycophancy.signals.map((s) => (
                    <li key={s} className="text-xs text-slate-600 flex items-start gap-1.5">
                      <span className="mt-0.5 w-1 h-1 rounded-full bg-slate-400 flex-shrink-0 mt-1.5" />
                      <span>{signalLabels[s] ?? s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2 flex-wrap mt-2">
              {hasAlternatives && (
                <button
                  onClick={onViewAlternatives}
                  className="text-xs border border-slate-300 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                >
                  <List size={11} />
                  View Alternative Diagnoses
                </button>
              )}
              {hasChallengeResponse && (
                <button
                  onClick={onChallengeClick}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5",
                    isRed
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "border border-amber-400 text-amber-800 hover:bg-amber-100"
                  )}
                >
                  <Swords size={11} />
                  Challenge Mode
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
