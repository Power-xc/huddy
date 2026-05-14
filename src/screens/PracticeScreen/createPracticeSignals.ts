import type { CameraSignalSnapshot } from "@features/camera";
import {
  extractSpokenKeywords,
  getRouteKeywordProgress,
} from "@features/speech";
import type {
  KeywordCard,
  KeywordRouteProgressItem,
  PracticeSignalSummary,
  SpokenKeywordInsight,
  TranscriptTimelineItem,
} from "@shared/types";

type CreatePracticeSignalsInput = {
  transcript: string;
  keywordCards: KeywordCard[];
  transcriptTimeline: TranscriptTimelineItem[];
  keywordProgress: KeywordRouteProgressItem[];
  cameraSnapshot: CameraSignalSnapshot;
  soundCueEnabled: boolean;
};

const fallbackKeywordInsights = (
  keywordCards: KeywordCard[],
): SpokenKeywordInsight[] =>
  keywordCards.slice(0, 4).map((card) => ({
    text: card.keyword,
    count: 0,
    isRouteKeyword: true,
  }));

export function createPracticeSignals({
  transcript,
  keywordCards,
  transcriptTimeline,
  keywordProgress,
  cameraSnapshot,
  soundCueEnabled,
}: CreatePracticeSignalsInput): PracticeSignalSummary {
  const cleanTranscript = transcript.trim();
  const spokenKeywords = cleanTranscript
    ? extractSpokenKeywords(cleanTranscript, keywordCards)
    : fallbackKeywordInsights(keywordCards);
  const { matchedRouteKeywords, missedRouteKeywords } =
    getRouteKeywordProgress(cleanTranscript, keywordCards);

  return {
    spokenKeywords,
    matchedRouteKeywords,
    missedRouteKeywords,
    transcriptTimeline,
    keywordProgress,
    autoDetectedKeywords: keywordProgress
      .filter((item) => item.source === "auto-detected")
      .map((item) => item.keyword),
    manuallyAdvancedKeywords: keywordProgress
      .filter((item) => item.source === "manual")
      .map((item) => item.keyword),
    cameraAttentionScore: cameraSnapshot.cameraAttentionScore,
    mouthMovementScore: cameraSnapshot.mouthMovementScore,
    cameraFeedback: cameraSnapshot.cameraFeedback,
    mouthFeedback: cameraSnapshot.mouthFeedback,
    soundCueEnabled,
    createdAt: new Date().toISOString(),
  };
}
