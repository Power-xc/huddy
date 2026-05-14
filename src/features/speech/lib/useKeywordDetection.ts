"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { detectKeyword } from "./detectKeyword";

export type UseKeywordDetectionOptions = {
  transcript: string;
  keyword: string | null;
  onDetected: () => void;
};

export function useKeywordDetection({
  transcript,
  keyword,
  onDetected,
}: UseKeywordDetectionOptions): void {
  const hasDetectedRef = useRef(false);
  const prevKeywordRef = useRef<string | null>(null);
  const onDetectedRef = useRef(onDetected);

  useLayoutEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  useEffect(() => {
    if (prevKeywordRef.current !== keyword) {
      prevKeywordRef.current = keyword;
      hasDetectedRef.current = false;
    }

    if (!keyword || hasDetectedRef.current) {
      return;
    }

    if (!detectKeyword(transcript, keyword)) {
      return;
    }

    hasDetectedRef.current = true;
    onDetectedRef.current();
  }, [transcript, keyword]);
}
