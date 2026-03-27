"use client";
import { useState, useCallback, useRef } from "react";

interface StreamOptions {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export function useSimulatedStream() {
  const [displayedText, setDisplayedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startStream = useCallback(({ text, speed = 12, onComplete }: StreamOptions) => {
    setDisplayedText("");
    setIsStreaming(true);
    let index = 0;

    intervalRef.current = setInterval(() => {
      const chunkSize = Math.floor(Math.random() * 3) + 2;
      index += chunkSize;
      if (index >= text.length) {
        setDisplayedText(text);
        setIsStreaming(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        onComplete?.();
      } else {
        setDisplayedText(text.slice(0, index));
      }
    }, speed);
  }, []);

  const stopStream = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsStreaming(false);
  }, []);

  return { displayedText, isStreaming, startStream, stopStream };
}
