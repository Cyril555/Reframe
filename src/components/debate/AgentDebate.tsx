"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Scale } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { AgentDebate as AgentDebateType, DebateAgent } from "@/types/debate";
import { useAgentDebate } from "@/hooks/useAgentDebate";
import { cn } from "@/lib/utils";

// ── Color maps ───────────────────────────────────────────────────────────────
const agentColors: Record<
  string,
  { bg: string; border: string; text: string; badge: string; dot: string }
> = {
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-800",
    badge: "bg-purple-100 text-purple-700",
    dot: "bg-purple-500",
  },
  teal: {
    bg: "bg-teal-50",
    border: "border-teal-200",
    text: "text-teal-800",
    badge: "bg-teal-100 text-teal-700",
    dot: "bg-teal-500",
  },
  rose: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-800",
    badge: "bg-rose-100 text-rose-700",
    dot: "bg-rose-500",
  },
};

const judgeColors = {
  bg: "bg-amber-50",
  border: "border-amber-300",
  text: "text-amber-900",
  badge: "bg-amber-100 text-amber-800",
};

function AgentPill({ agent }: { agent: DebateAgent }) {
  const c = agentColors[agent.color];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border",
        c.badge,
        c.border
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", c.dot)} />
      {agent.name}
    </span>
  );
}

interface MessageBubbleProps {
  agent: DebateAgent;
  text: string;
  streaming?: boolean;
}

function DebateMessageBubble({ agent, text, streaming }: MessageBubbleProps) {
  const c = agentColors[agent.color];
  const isRight = agent.side === "right";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-col gap-1 max-w-[80%]", isRight && "self-end items-end")}
    >
      <span className={cn("text-xs font-medium px-1 flex items-center gap-1.5", c.text)}>
        <span className={cn("w-1.5 h-1.5 rounded-full", c.dot)} />
        {agent.name}
      </span>
      <div
        className={cn(
          "rounded-xl px-4 py-3 text-sm leading-relaxed border",
          c.bg,
          c.border,
          c.text,
          isRight ? "rounded-tr-sm" : "rounded-tl-sm"
        )}
      >
        {text}
        {streaming && (
          <span className="inline-block w-1 h-3.5 bg-current opacity-60 animate-pulse ml-0.5 align-middle" />
        )}
      </div>
    </motion.div>
  );
}

function VerdictPanel({
  debate,
  text,
  streaming,
}: {
  debate: AgentDebateType;
  text: string;
  streaming: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-xl border-2 overflow-hidden", judgeColors.border)}
    >
      <div className={cn("px-4 py-3 border-b flex items-center gap-2", judgeColors.bg, judgeColors.border)}>
        <Scale size={16} className="text-amber-600" />
        <div>
          <p className={cn("text-sm font-bold", judgeColors.text)}>
            Judge — Final Determination
          </p>
          <p className="text-xs text-amber-600">Impartial analysis of all arguments</p>
        </div>
        <span className={cn("ml-auto text-xs font-semibold px-2 py-0.5 rounded-full", judgeColors.badge)}>
          {debate.verdict.confidence} confidence
        </span>
      </div>

      <div className="bg-white px-4 py-4">
        <div className="prose-clinical text-sm text-slate-700">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
        {streaming && (
          <span className="inline-block w-1 h-4 bg-amber-400 animate-pulse ml-0.5" />
        )}
      </div>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface Props {
  debate: AgentDebateType;
}

export function AgentDebate({ debate }: Props) {
  const {
    phase,
    start,
    visibleCount,
    streamingText,
    currentStreamingAgentId,
    verdictText,
  } = useAgentDebate(debate);

  useEffect(() => {
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const advocates = debate.agents.filter((a) => a.id !== "judge");
  const isActive = phase !== "idle" && phase !== "done";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-white border border-slate-200 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Bot size={16} className="text-slate-300" />
          <div>
            <p className="text-sm font-bold text-white">Agent Debate</p>
            <p className="text-xs text-slate-400">AI advocates argue each differential in real time</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isActive && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          )}
          {phase === "done" && (
            <span className="text-xs text-slate-400">Complete</span>
          )}
        </div>
      </div>

      {/* Agent pills */}
      <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap gap-2">
        {advocates.map((a) => (
          <AgentPill key={a.id} agent={a} />
        ))}
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border bg-amber-50 text-amber-800 border-amber-200">
          <Scale size={11} />
          Judge
        </span>
      </div>

      {/* Debate messages */}
      <div className="px-4 py-4 flex flex-col gap-4 min-h-[80px]">
        {debate.messages.slice(0, visibleCount).map((msg, i) => {
          const agent = debate.agents.find((a) => a.id === msg.agentId);
          if (!agent) return null;
          return <DebateMessageBubble key={i} agent={agent} text={msg.content} />;
        })}

        <AnimatePresence>
          {phase === "streaming_message" && currentStreamingAgentId && (
            <DebateMessageBubble
              key="streaming"
              agent={debate.agents.find((a) => a.id === currentStreamingAgentId)!}
              text={streamingText}
              streaming
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase === "between" && visibleCount < debate.messages.length && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 px-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dot-1" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dot-2" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dot-3" />
              <span className="text-xs text-slate-400 ml-1">
                {debate.agents.find((a) => a.id === debate.messages[visibleCount]?.agentId)?.name ?? "Agent"}{" "}
                is formulating a response...
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {(phase === "streaming_verdict" || phase === "done") && verdictText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 pb-4"
          >
            <div className="border-t border-slate-200 mb-4" />
            <VerdictPanel
              debate={debate}
              text={verdictText}
              streaming={phase === "streaming_verdict"}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
