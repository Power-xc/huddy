import type { CameraSignalSnapshot } from "@features/camera";
import {
  extractSpokenKeywords,
  getRouteKeywordProgress,
} from "@features/speech";
import type {
  KeywordCard,
  PracticeSignalSummary,
  SpokenKeywordInsight,
  TranscriptTimelineItem,
} from "@shared/types";

type CreatePracticeSignalsInput = {
  transcript: string;
  keywordCards: KeywordCard[];
  transcriptTimeline: TranscriptTimelineItem[];
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
    cameraAttentionScore: cameraSnapshot.cameraAttentionScore,
    mouthMovementScore: cameraSnapshot.mouthMovementScore,
    cameraFeedback: cameraSnapshot.cameraFeedback,
    mouthFeedback: cameraSnapshot.mouthFeedback,
    soundCueEnabled,
    createdAt: new Date().toISOString(),
  };
}
