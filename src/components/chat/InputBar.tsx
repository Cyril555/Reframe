"use client";
import { motion } from "framer-motion";
import { Phase } from "@/hooks/useScenario";

interface Props {
  nextMessage?: string;
  phase: Phase;
  onSend: () => void;
}

export function InputBar({ nextMessage, phase, onSend }: Props) {
  const disabled = phase === "thinking" || phase === "streaming" || phase === "user_sent";

  return (
    <div className="bg-white border-t border-slate-200 px-4 py-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-xs text-slate-400 mb-2 text-center">
          Demo Mode — select a prompt below
        </div>
        <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 bg-slate-50">
          <div className="flex-1 text-sm text-slate-500 truncate">
            {nextMessage ? (
              <span className="text-slate-700">{nextMessage}</span>
            ) : (
              <span className="text-slate-400 italic">No more turns in this scenario</span>
            )}
          </div>
          {nextMessage && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSend}
              disabled={disabled}
              className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
              {disabled ? (
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </span>
              ) : (
                "Send →"
              )}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
