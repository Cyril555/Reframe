"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { ConversationTurn } from "@/types/scenario";
import { UserBubble, AssistantBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { Phase } from "@/hooks/useScenario";
import { useSimulatedStream } from "@/hooks/useSimulatedStream";

interface Props {
  visibleTurns: ConversationTurn[];
  pendingTurn: ConversationTurn | null;
  phase: Phase;
  onStreamComplete: () => void;
}

export function ChatWindow({ visibleTurns, pendingTurn, phase, onStreamComplete }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { displayedText, isStreaming, startStream } = useSimulatedStream();

  useEffect(() => {
    if (phase === "streaming" && pendingTurn) {
      startStream({
        text: pendingTurn.assistantResponse,
        speed: 10,
        onComplete: onStreamComplete,
      });
    }
  }, [phase, pendingTurn, startStream, onStreamComplete]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleTurns, phase, displayedText]);

  const isEmpty = visibleTurns.length === 0 && phase === "idle";

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {isEmpty && (
          <div className="text-center text-slate-400 text-sm mt-20">
            <div className="flex justify-center mb-4">
              <MessageSquare size={36} className="text-slate-300" />
            </div>
            <p>Click &quot;Send&quot; below to start the scenario</p>
          </div>
        )}

        {visibleTurns.map((turn) => (
          <div key={turn.id} className="space-y-4">
            <UserBubble message={turn.userMessage} />
            <AssistantBubble
              turn={turn}
              streamedText={turn.assistantResponse}
              isStreaming={false}
              showMeta={true}
            />
          </div>
        ))}

        {(phase === "user_sent" || phase === "thinking" || phase === "streaming") &&
          pendingTurn && (
            <div className="space-y-4">
              <UserBubble message={pendingTurn.userMessage} />
              {phase === "thinking" && <TypingIndicator />}
              {phase === "streaming" && (
                <AssistantBubble
                  turn={pendingTurn}
                  streamedText={displayedText}
                  isStreaming={isStreaming}
                  showMeta={false}
                />
              )}
            </div>
          )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
