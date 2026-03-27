"use client";
import { useState, useCallback } from "react";
import { Scenario, ConversationTurn } from "@/types/scenario";

export type Phase = "idle" | "user_sent" | "thinking" | "streaming" | "complete";

export function useScenario() {
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(-1);
  const [visibleTurns, setVisibleTurns] = useState<ConversationTurn[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [pendingTurn, setPendingTurn] = useState<ConversationTurn | null>(null);

  const loadScenario = useCallback((scenario: Scenario) => {
    setActiveScenario(scenario);
    setCurrentTurnIndex(-1);
    setVisibleTurns([]);
    setPhase("idle");
    setPendingTurn(null);
  }, []);

  const advanceTurn = useCallback(() => {
    if (!activeScenario) return;
    const nextIndex = currentTurnIndex + 1;
    if (nextIndex >= activeScenario.turns.length) return;

    const turn = activeScenario.turns[nextIndex];
    setCurrentTurnIndex(nextIndex);
    setPendingTurn(turn);
    setPhase("user_sent");

    setTimeout(() => setPhase("thinking"), 800);
    setTimeout(() => {
      setPhase("streaming");
    }, 800 + 1500 + Math.random() * 500);
  }, [activeScenario, currentTurnIndex]);

  const completeStream = useCallback(() => {
    if (!pendingTurn) return;
    setVisibleTurns((prev) => [...prev, pendingTurn]);
    setPendingTurn(null);
    setPhase("complete");
  }, [pendingTurn]);

  const hasNextTurn = activeScenario
    ? currentTurnIndex + 1 < activeScenario.turns.length
    : false;

  return {
    activeScenario,
    loadScenario,
    visibleTurns,
    phase,
    pendingTurn,
    advanceTurn,
    completeStream,
    currentTurnIndex,
    hasNextTurn,
  };
}
