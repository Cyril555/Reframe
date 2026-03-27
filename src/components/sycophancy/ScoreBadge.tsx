"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getScoreBand } from "@/lib/design";

interface Props {
  score: number;
}

export function ScoreBadge({ score }: Props) {
  const band = getScoreBand(score);
  const colorMap = {
    safe: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-800",
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.3 }}
      className={cn(
        "inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full",
        colorMap[band]
      )}
      title="Sycophancy likelihood score (0-100)"
    >
      Sycophancy: {score}
    </motion.span>
  );
}
