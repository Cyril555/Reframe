"use client";
import { motion } from "framer-motion";
import { Swords } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ChallengeResponse } from "@/types/scenario";

interface Props {
  challengeResponse: ChallengeResponse;
  streamedContent: string;
  isStreaming: boolean;
}

export function ChallengeMode({ challengeResponse, streamedContent, isStreaming }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: [0, -2, 2, -1, 1, 0] }}
      transition={{ duration: 0.4, x: { duration: 0.3, delay: 0.1 } }}
      className="bg-slate-800 border-t-4 border-red-500 rounded-xl overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-slate-700">
        <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <Swords size={12} />
          Adversarial Review
        </p>
        <p className="text-sm text-slate-300">
          Assuming the working diagnosis is incorrect: {challengeResponse.title}
        </p>
      </div>
      <div className="px-5 py-4">
        <div className="prose-challenge text-sm">
          <ReactMarkdown>{streamedContent}</ReactMarkdown>
        </div>
        {isStreaming && (
          <span className="inline-block w-1 h-4 bg-slate-400 animate-pulse ml-0.5" />
        )}
      </div>
      <div className="px-5 py-3 border-t border-slate-700">
        <p className="text-xs text-slate-500">
          This is a structured counter-argument, not primary clinical guidance. Treat as a sceptical second opinion.
        </p>
      </div>
    </motion.div>
  );
}
