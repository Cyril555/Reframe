"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { Alternative } from "@/types/scenario";
import { cn } from "@/lib/utils";

interface Props {
  alternatives: Alternative[];
}

function getProbabilityColor(prob: string): string {
  const match = prob.match(/(\d+)/);
  if (!match) return "bg-slate-100 text-slate-600";
  const num = parseInt(match[1]);
  if (num < 10) return "bg-emerald-100 text-emerald-700";
  if (num <= 25) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

export function SteelmanPanel({ alternatives }: Props) {
  const [visible, setVisible] = useState(true);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setVisible((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200"
      >
        <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Search size={14} className="text-slate-500" />
          Alternative Diagnoses to Consider
        </span>
        {visible ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
      </button>

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 space-y-3"
          >
            {alternatives.map((alt, i) => (
              <motion.div
                key={alt.diagnosis}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="border border-slate-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2 gap-2">
                  <h4 className="text-sm font-semibold text-slate-800">{alt.diagnosis}</h4>
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap",
                      getProbabilityColor(alt.preTestProbability)
                    )}
                  >
                    Pre-test: {alt.preTestProbability}
                  </span>
                </div>
                <div className="mb-2">
                  <p className="text-xs font-medium text-slate-500 mb-1">Supporting features:</p>
                  <ul className="space-y-0.5">
                    {alt.supportingFeatures.map((f, j) => (
                      <li key={j} className="text-xs text-slate-600 flex items-start gap-1">
                        <span className="mt-0.5 text-slate-400">·</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-blue-50 rounded-md px-3 py-2">
                  <span className="text-xs font-medium text-blue-700">Key investigation: </span>
                  <span className="text-xs text-blue-600">{alt.keyInvestigation}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
