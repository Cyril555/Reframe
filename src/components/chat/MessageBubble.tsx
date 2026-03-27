"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { ConversationTurn } from "@/types/scenario";
import { ScoreBadge } from "@/components/sycophancy/ScoreBadge";
import { SycophancyFlag } from "@/components/sycophancy/SycophancyFlag";
import { SteelmanPanel } from "@/components/sycophancy/SteelmanPanel";
import { ChallengeMode } from "@/components/sycophancy/ChallengeMode";
import { AgentDebate } from "@/components/debate/AgentDebate";
import { ConfidenceFooter } from "@/components/meta/ConfidenceFooter";
import { useSimulatedStream } from "@/hooks/useSimulatedStream";
import { getScoreBand } from "@/lib/design";
import { getDebate } from "@/data/debates/index";
import { Bot } from "lucide-react";

interface UserBubbleProps {
  message: string;
}

export function UserBubble({ message }: UserBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-end"
    >
      <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[70%] text-sm leading-relaxed">
        {message}
      </div>
    </motion.div>
  );
}

interface AssistantBubbleProps {
  turn: ConversationTurn;
  streamedText: string;
  isStreaming: boolean;
  showMeta: boolean;
}

export function AssistantBubble({
  turn,
  streamedText,
  isStreaming,
  showMeta,
}: AssistantBubbleProps) {
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [challengeActive, setChallengeActive] = useState(false);
  const [debateActive, setDebateActive] = useState(false);
  const { displayedText: challengeText, isStreaming: challengeStreaming, startStream: startChallenge } =
    useSimulatedStream();

  const debate = getDebate(turn.id);

  const band = getScoreBand(turn.sycophancy.score);
  const autoShowAlternatives = band === "red" && !isStreaming;

  useEffect(() => {
    if (autoShowAlternatives) setShowAlternatives(true);
  }, [autoShowAlternatives]);

  const handleChallenge = () => {
    if (!turn.challengeResponse) return;
    setChallengeActive(true);
    startChallenge({ text: turn.challengeResponse.content, speed: 8 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-2 max-w-[85%]"
    >
      <span className="text-xs text-slate-400 pl-1">Reframe.ai</span>
      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm overflow-hidden">
        <div className="px-4 pt-4 pb-3">
          {showMeta && !isStreaming && (
            <div className="flex justify-end mb-2">
              <ScoreBadge score={turn.sycophancy.score} />
            </div>
          )}
          <div className="prose-clinical text-sm">
            <ReactMarkdown>{streamedText}</ReactMarkdown>
          </div>
          {isStreaming && (
            <span className="inline-block w-1 h-4 bg-slate-400 animate-pulse ml-0.5" />
          )}
        </div>
        {showMeta && !isStreaming && (
          <ConfidenceFooter confidence={turn.confidence} />
        )}
      </div>

      {showMeta && !isStreaming && turn.sycophancy.score >= 40 && (
        <SycophancyFlag
          sycophancy={turn.sycophancy}
          hasAlternatives={!!turn.alternatives?.length}
          hasChallengeResponse={!!turn.challengeResponse}
          onViewAlternatives={() => setShowAlternatives((v) => !v)}
          onChallengeClick={handleChallenge}
        />
      )}

      {showMeta && !isStreaming && showAlternatives && turn.alternatives && (
        <SteelmanPanel alternatives={turn.alternatives} />
      )}

      {challengeActive && turn.challengeResponse && (
        <ChallengeMode
          challengeResponse={turn.challengeResponse}
          streamedContent={challengeText}
          isStreaming={challengeStreaming}
        />
      )}

      {/* Agent Debate button — always visible when a debate exists */}
      {showMeta && !isStreaming && debate && !debateActive && (
        <button
          onClick={() => setDebateActive(true)}
          className="flex items-center gap-2 w-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors"
        >
          <Bot size={15} />
          <span>Watch Agents Debate</span>
          <span className="ml-auto text-xs text-slate-400 font-normal">
            {debate.agents.filter(a => a.id !== "judge").length} advocates · impartial judge
          </span>
        </button>
      )}

      {debateActive && debate && <AgentDebate debate={debate} />}
    </motion.div>
  );
}
