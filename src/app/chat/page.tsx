"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { InputBar } from "@/components/chat/InputBar";
import { useScenario } from "@/hooks/useScenario";
import { scenarios, getScenario } from "@/data/index";

function ChatPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const scenarioId = searchParams.get("scenario");

  const {
    activeScenario,
    loadScenario,
    visibleTurns,
    phase,
    pendingTurn,
    advanceTurn,
    completeStream,
    currentTurnIndex,
    hasNextTurn,
  } = useScenario();

  useEffect(() => {
    if (!scenarioId) {
      router.push("/");
      return;
    }
    const scenario = getScenario(scenarioId);
    if (!scenario) {
      router.push("/");
      return;
    }
    loadScenario(scenario);
  }, [scenarioId, loadScenario, router]);

  const nextTurn =
    activeScenario && currentTurnIndex + 1 < activeScenario.turns.length
      ? activeScenario.turns[currentTurnIndex + 1]
      : null;

  return (
    <div className="h-screen flex flex-col">
      <Header scenarioTitle={activeScenario?.title} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          scenarios={scenarios}
          activeScenarioId={activeScenario?.id}
          visibleTurns={visibleTurns}
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          <ChatWindow
            visibleTurns={visibleTurns}
            pendingTurn={pendingTurn}
            phase={phase}
            onStreamComplete={completeStream}
          />
          <InputBar
            nextMessage={nextTurn?.userMessage}
            phase={phase}
            onSend={advanceTurn}
          />
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center text-slate-400">Loading...</div>}>
      <ChatPageInner />
    </Suspense>
  );
}
