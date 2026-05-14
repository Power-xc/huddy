import type { CameraSignalSnapshot } from "@features/camera";
import {
  extractSpokenKeywords,
  getRouteKeywordProgress,
} from "@features/speech";
import type {
  KeywordCard,
  PracticeSignalSummary,
  SpokenKeywordInsight,
} from "@shared/types";

type CreatePracticeSignalsInput = {
  transcript: string;
  keywordCards: KeywordCard[];
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
    cameraAttentionScore: cameraSnapshot.cameraAttentionScore,
    mouthMovementScore: cameraSnapshot.mouthMovementScore,
    cameraFeedback: cameraSnapshot.cameraFeedback,
    mouthFeedback: cameraSnapshot.mouthFeedback,
    soundCueEnabled,
    createdAt: new Date().toISOString(),
  };
}
