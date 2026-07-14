"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { detectKeyword, detectPhraseCompletion } from "./detectKeyword";

export type UseKeywordDetectionOptions = {
  transcript: string;
  keyword: string | null;
  detectionKey?: string | null;
  matchMode?: "keyword" | "phrase";
  onDetected: () => void;
};

export function useKeywordDetection({
  transcript,
  keyword,
  detectionKey,
  matchMode = "keyword",
  onDetected,
}: UseKeywordDetectionOptions): void {
  const hasDetectedRef = useRef(false);
  const previousDetectionKeyRef = useRef<string | null>(null);
  const transcriptBaselineRef = useRef("");
  const onDetectedRef = useRef(onDetected);

  useLayoutEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  useEffect(() => {
    const currentDetectionKey = detectionKey ?? keyword;

    if (previousDetectionKeyRef.current !== currentDetectionKey) {
      previousDetectionKeyRef.current = currentDetectionKey;
      hasDetectedRef.current = false;
      transcriptBaselineRef.current = transcript;
    }

    if (!keyword || hasDetectedRef.current) {
      return;
    }

    const baseline = transcriptBaselineRef.current;
    const currentTranscript = transcript.startsWith(baseline)
      ? transcript.slice(baseline.length)
      : transcript;
    const isDetected =
      matchMode === "phrase"
        ? detectPhraseCompletion(currentTranscript, keyword)
        : detectKeyword(currentTranscript, keyword);

    if (!isDetected) {
      return;
    }

    hasDetectedRef.current = true;
    onDetectedRef.current();
  }, [detectionKey, matchMode, transcript, keyword]);
}
