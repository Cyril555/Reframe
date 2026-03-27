"use client";
import { useState, useCallback, useRef } from "react";
import { AgentDebate } from "@/types/debate";

export type DebatePhase =
  | "idle"
  | "streaming_message"
  | "between"
  | "streaming_verdict"
  | "done";

export function useAgentDebate(debate: AgentDebate) {
  const [phase, setPhase] = useState<DebatePhase>("idle");
  const [visibleCount, setVisibleCount] = useState(0); // fully shown messages
  const [streamingText, setStreamingText] = useState("");
  const [verdictText, setVerdictText] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const runRef = useRef<(index: number) => void>();

  const streamString = useCallback(
    (
      text: string,
      speed: number,
      setter: (s: string) => void,
      onDone: () => void
    ) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setter("");
      let idx = 0;
      intervalRef.current = setInterval(() => {
        idx += Math.floor(Math.random() * 3) + 2;
        if (idx >= text.length) {
          setter(text);
          clearInterval(intervalRef.current!);
          onDone();
        } else {
          setter(text.slice(0, idx));
        }
      }, speed);
    },
    []
  );

  const startVerdict = useCallback(() => {
    setPhase("streaming_verdict");
    const fullVerdict =
      debate.verdict.reasoning +
      "\n\n**Recommendation:** " +
      debate.verdict.recommendation +
      "\n\n**Immediate action:** " +
      debate.verdict.immediateAction;
    streamString(fullVerdict, 8, setVerdictText, () => {
      setPhase("done");
    });
  }, [debate, streamString]);

  // Define runMessage using a ref so it can call itself recursively
  const runMessage = useCallback(
    (index: number) => {
      if (index >= debate.messages.length) {
        setPhase("between");
        setTimeout(startVerdict, 900);
        return;
      }
      setPhase("streaming_message");
      setStreamingText("");
      streamString(
        debate.messages[index].content,
        14,
        setStreamingText,
        () => {
          setVisibleCount(index + 1);
          setPhase("between");
          setTimeout(() => {
            runRef.current!(index + 1);
          }, 550);
        }
      );
    },
    [debate, streamString, startVerdict]
  );

  runRef.current = runMessage;

  const start = useCallback(() => {
    if (phase !== "idle") return;
    setTimeout(() => runRef.current!(0), 300);
  }, [phase]);

  const currentStreamingAgentId =
    phase === "streaming_message" && visibleCount < debate.messages.length
      ? debate.messages[visibleCount]?.agentId
      : null;

  return {
    phase,
    start,
    visibleCount,
    streamingText,
    currentStreamingAgentId,
    verdictText,
  };
}
