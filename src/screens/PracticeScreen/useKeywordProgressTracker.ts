"use client";

import { useCallback, useRef } from "react";
import type { KeywordCard, KeywordRouteProgressItem } from "@shared/types";

type UseKeywordProgressTrackerOptions = {
  currentCard: KeywordCard | null;
  elapsedSec: number;
  onNextKeyword: () => void;
};

type UseKeywordProgressTrackerResult = {
  getProgress: () => KeywordRouteProgressItem[];
  recordAutoDetected: () => void;
  advanceManually: () => void;
};

export function useKeywordProgressTracker({
  currentCard,
  elapsedSec,
  onNextKeyword,
}: UseKeywordProgressTrackerOptions): UseKeywordProgressTrackerResult {
  const progressRef = useRef<KeywordRouteProgressItem[]>([]);

  const recordProgress = useCallback(
    (source: KeywordRouteProgressItem["source"]) => {
      if (!currentCard) {
        return;
      }

      const hasExistingRecord = progressRef.current.some(
        (item) => item.keyword === currentCard.keyword,
      );

      if (hasExistingRecord) {
        return;
      }

      progressRef.current = [
        ...progressRef.current,
        {
          keyword: currentCard.keyword,
          source,
          elapsedSec,
        },
      ];
    },
    [currentCard, elapsedSec],
  );

  const recordAutoDetected = useCallback(
    () => recordProgress("auto-detected"),
    [recordProgress],
  );

  const advanceManually = useCallback(() => {
    recordProgress("manual");
    onNextKeyword();
  }, [onNextKeyword, recordProgress]);

  const getProgress = useCallback(() => [...progressRef.current], []);

  return { getProgress, recordAutoDetected, advanceManually };
}
