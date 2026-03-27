"use client";
import { useMemo } from "react";
import { ConversationTurn } from "@/types/scenario";

export function useDriftTimeline(turns: ConversationTurn[]) {
  return useMemo(
    () =>
      turns
        .filter((t) => t.driftEvent)
        .map((t, i) => ({
          turnNumber: i + 1,
          label: t.driftEvent!.label,
          type: t.driftEvent!.type,
          score: t.sycophancy.score,
        })),
    [turns]
  );
}
