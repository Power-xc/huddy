"use client";

import { useEffect, useRef, useState } from "react";
import type { KeywordCard, TranscriptTimelineItem } from "@shared/types";
import { detectKeyword } from "./detectKeyword";

export type UseTranscriptTimelineOptions = {
  finalTranscript: string;
  elapsedSec: number;
  keywordCards: KeywordCard[];
};

export type UseTranscriptTimelineResult = {
  timeline: TranscriptTimelineItem[];
  resetTimeline: () => void;
};

const findMatchedKeywords = (
  text: string,
  keywordCards: KeywordCard[],
): string[] =>
  keywordCards
    .filter((card) => detectKeyword(text, card.keyword))
    .map((card) => card.keyword);

export function useTranscriptTimeline({
  finalTranscript,
  elapsedSec,
  keywordCards,
}: UseTranscriptTimelineOptions): UseTranscriptTimelineResult {
  const previousTranscriptRef = useRef("");
  const [timeline, setTimeline] = useState<TranscriptTimelineItem[]>([]);

  useEffect(() => {
    const transcript = finalTranscript.trim();
    const previousTranscript = previousTranscriptRef.current;

    if (!transcript) {
      return;
    }

    const nextText = transcript.startsWith(previousTranscript)
      ? transcript.slice(previousTranscript.length).trim()
      : transcript;

    previousTranscriptRef.current = transcript;

    if (!nextText) {
      return;
    }

    setTimeline((items) => [
      ...items,
      {
        id: crypto.randomUUID(),
        text: nextText,
        elapsedSec,
        matchedKeywords: findMatchedKeywords(nextText, keywordCards),
      },
    ]);
  }, [elapsedSec, finalTranscript, keywordCards]);

  const resetTimeline = () => {
    previousTranscriptRef.current = "";
    setTimeline([]);
  };

  return { timeline, resetTimeline };
}
