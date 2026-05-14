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

const getPauseRhythm = (
  timeline: TranscriptTimelineItem[],
): Pick<PracticeSignalSummary, "pauseRhythmScore" | "pauseFeedback"> => {
  const gaps = timeline
    .map((item, index) =>
      index === 0 ? null : item.elapsedSec - timeline[index - 1].elapsedSec,
    )
    .filter((gap): gap is number => typeof gap === "number" && gap > 0);

  if (gaps.length < 2) {
    return {
      pauseRhythmScore: null,
      pauseFeedback: "pause 리듬을 계산할 만큼 발화 구간이 충분하지 않습니다.",
    };
  }

  const stableGaps = gaps.filter((gap) => gap >= 2 && gap <= 8).length;
  const pauseRhythmScore = Math.round((stableGaps / gaps.length) * 100);

  return {
    pauseRhythmScore,
    pauseFeedback:
      pauseRhythmScore >= 65
        ? "문장 사이 pause 리듬이 비교적 안정적입니다."
        : "문장 사이 pause가 너무 짧거나 길게 흔들립니다. route cue마다 한 박자 쉬어보세요.",
  };
};

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
  const pauseRhythm = getPauseRhythm(transcriptTimeline);

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
    mouthOpennessScore: cameraSnapshot.mouthOpennessScore,
    headStabilityScore: cameraSnapshot.headStabilityScore,
    lookDownRatio: cameraSnapshot.lookDownRatio,
    readingPostureRiskScore: cameraSnapshot.readingPostureRiskScore,
    pauseRhythmScore: pauseRhythm.pauseRhythmScore,
    cameraFeedback: cameraSnapshot.cameraFeedback,
    mouthFeedback: cameraSnapshot.mouthFeedback,
    postureFeedback: cameraSnapshot.postureFeedback,
    pauseFeedback: pauseRhythm.pauseFeedback,
    readingFeedback: cameraSnapshot.readingFeedback,
    soundCueEnabled,
    createdAt: new Date().toISOString(),
  };
}
