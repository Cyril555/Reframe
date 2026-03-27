"use client";
import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-2xl w-fit max-w-xs"
    >
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-slate-400 rounded-full dot-1 inline-block" />
        <span className="w-2 h-2 bg-slate-400 rounded-full dot-2 inline-block" />
        <span className="w-2 h-2 bg-slate-400 rounded-full dot-3 inline-block" />
      </div>
      <span className="text-xs text-slate-400">Reframe.ai is analysing...</span>
    </motion.div>
  );
}
