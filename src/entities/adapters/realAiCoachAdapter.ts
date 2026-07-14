import type {
  BreathScript,
  KeywordCard,
  PracticeSession,
  PracticeSessionCategory,
  PresentationMode,
  SessionReport,
} from "@shared/types";
import type { AICoachAdapter } from "./aiCoachAdapter";

type KeywordCardDraft = {
  keyword: string;
  hintKo: string;
};

type KeywordResponse = {
  cards: KeywordCardDraft[];
};

type BreathSegmentDraft = {
  text: string;
  translationKo?: string | null;
  isBreathPoint: boolean;
};

type BreathScriptResponse = {
  segments: BreathSegmentDraft[];
};

type TranslationResponse = {
  translationKo: string;
};

type ReportResponse = Omit<
  SessionReport,
  "actualDurationSec" | "keywordsUsedCount" | "createdAt"
>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isKeywordCardDraft = (value: unknown): value is KeywordCardDraft =>
  isRecord(value) &&
  typeof value.keyword === "string" &&
  typeof value.hintKo === "string";

const isKeywordResponse = (value: unknown): value is KeywordResponse =>
  isRecord(value) &&
  Array.isArray(value.cards) &&
  value.cards.every(isKeywordCardDraft);

const isBreathSegmentDraft = (value: unknown): value is BreathSegmentDraft =>
  isRecord(value) &&
  typeof value.text === "string" &&
  (value.translationKo === undefined ||
    value.translationKo === null ||
    typeof value.translationKo === "string") &&
  typeof value.isBreathPoint === "boolean";

const isBreathScriptResponse = (
  value: unknown,
): value is BreathScriptResponse =>
  isRecord(value) &&
  Array.isArray(value.segments) &&
  value.segments.every(isBreathSegmentDraft);

const isTranslationResponse = (value: unknown): value is TranslationResponse =>
  isRecord(value) && typeof value.translationKo === "string";

const modes: PresentationMode[] = ["script", "breath", "keyword", "no-script"];

const isMode = (value: unknown): value is PresentationMode =>
  typeof value === "string" && modes.includes(value as PresentationMode);

const isMetricValue = (value: unknown): value is number =>
  typeof value === "number" && value >= 0 && value <= 100;

const isReportResponse = (value: unknown): value is ReportResponse =>
  isRecord(value) &&
  typeof value.oneLineFeedback === "string" &&
  Array.isArray(value.strengths) &&
  Array.isArray(value.improvements) &&
  typeof value.breathFeedback === "string" &&
  typeof value.flowFeedback === "string" &&
  Array.isArray(value.problemWords) &&
  typeof value.nextWeekMission === "string" &&
  isMode(value.recommendedMode) &&
  isRecord(value.metrics) &&
  isMetricValue(value.metrics.clarity) &&
  isMetricValue(value.metrics.confidence) &&
  isMetricValue(value.metrics.flow) &&
  isMetricValue(value.metrics.pronunciation) &&
  isMetricValue(value.metrics.breath);

const postJson = async <T>(
  path: string,
  body: Record<string, unknown>,
  isValid: (value: unknown) => value is T,
  errorMessage: string,
): Promise<T> => {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => null);

  if (!response?.ok) {
    throw new Error(errorMessage);
  }

  const data: unknown = await response.json().catch(() => null);

  if (!isValid(data)) {
    throw new Error(errorMessage);
  }

  return data;
};

export class RealAiCoachAdapter implements AICoachAdapter {
  async generateKeywordCards(
    memoKo: string,
    category: PracticeSessionCategory,
    scriptText = "",
    targetDurationMin = 3,
  ): Promise<KeywordCard[]> {
    const data = await postJson(
      "/api/ai/keywords",
      { memoKo, category, scriptText, targetDurationMin },
      isKeywordResponse,
      "keyword generation failed",
    );

    return data.cards.map((card, index) => ({
      id: crypto.randomUUID(),
      order: index + 1,
      keyword: card.keyword,
      hintKo: card.hintKo,
      isUsed: false,
    }));
  }

  async generateBreathScript(
    memoKo: string,
    keywordCards: KeywordCard[],
    scriptText = "",
    scriptTranslationKo = "",
  ): Promise<BreathScript> {
    const data = await postJson(
      "/api/ai/breath-script",
      {
        memoKo,
        keywords: keywordCards.map((card) => card.keyword),
        scriptText,
        scriptTranslationKo,
      },
      isBreathScriptResponse,
      "breath script generation failed",
    );
    const segments = data.segments.map((segment) => ({
      id: crypto.randomUUID(),
      text: segment.text,
      translationKo: segment.translationKo?.trim() || null,
      isBreathPoint: segment.isBreathPoint,
    }));

    return {
      segments,
      fullText: segments.map((segment) => segment.text).join(" / "),
    };
  }

  async translateScript(scriptText: string): Promise<string> {
    const data = await postJson(
      "/api/ai/translate",
      { scriptText },
      isTranslationResponse,
      "script translation failed",
    );

    return data.translationKo;
  }

  async generateReport(session: PracticeSession): Promise<SessionReport> {
    const actualDurationSec =
      session.recording?.durationSec ?? session.targetDurationMin * 60;

    const data = await postJson(
      "/api/ai/report",
      {
        title: session.title,
        category: session.category,
        targetDurationMin: session.targetDurationMin,
        actualDurationSec,
        keywordsUsedCount: session.keywordCards.filter((card) => card.isUsed)
          .length,
        totalKeywords: session.keywordCards.length,
        scriptText: session.scriptText || null,
        scriptKeywords:
          session.scriptAnalysis?.keywords.map((keyword) => keyword.term) ?? [],
        scriptVocabulary:
          session.scriptAnalysis?.vocabulary.map((item) => item.word) ?? [],
        scriptReadabilityScore:
          session.scriptAnalysis?.readability.score ?? null,
        scriptCoverageScore:
          session.practiceSignals?.scriptAssessment?.coverageScore ?? null,
        scriptPronunciationScore:
          session.practiceSignals?.scriptAssessment?.pronunciationScore ?? null,
        scriptMissedWords:
          session.practiceSignals?.scriptAssessment?.missedWords ?? [],
        scriptProblemWords:
          session.practiceSignals?.scriptAssessment?.unclearWords ?? [],
        scriptFeedback:
          session.practiceSignals?.scriptAssessment?.feedbackKo ?? null,
        transcript: session.transcript ?? null,
        keywordRoute: session.keywordCards
          .map((card) => card.keyword)
          .join(" → "),
        spokenKeywords:
          session.practiceSignals?.spokenKeywords.map((keyword) => keyword.text) ??
          [],
        matchedRouteKeywords:
          session.practiceSignals?.matchedRouteKeywords ?? [],
        missedRouteKeywords: session.practiceSignals?.missedRouteKeywords ?? [],
        autoDetectedKeywords:
          session.practiceSignals?.autoDetectedKeywords ?? [],
        manuallyAdvancedKeywords:
          session.practiceSignals?.manuallyAdvancedKeywords ?? [],
        cameraAttentionScore:
          session.practiceSignals?.cameraAttentionScore ?? null,
        mouthMovementScore: session.practiceSignals?.mouthMovementScore ?? null,
        mouthOpennessScore:
          session.practiceSignals?.mouthOpennessScore ?? null,
        headStabilityScore:
          session.practiceSignals?.headStabilityScore ?? null,
        lookDownRatio: session.practiceSignals?.lookDownRatio ?? null,
        readingPostureRiskScore:
          session.practiceSignals?.readingPostureRiskScore ?? null,
        pauseRhythmScore: session.practiceSignals?.pauseRhythmScore ?? null,
        transcriptTimeline:
          session.practiceSignals?.transcriptTimeline.slice(-8).map((item) => ({
            elapsedSec: item.elapsedSec,
            text: item.text,
            matchedKeywords: item.matchedKeywords,
          })) ?? [],
      },
      isReportResponse,
      "report generation failed",
    );

    return {
      ...data,
      actualDurationSec,
      keywordsUsedCount: session.keywordCards.filter((card) => card.isUsed)
        .length,
      createdAt: new Date().toISOString(),
    };
  }
}

export const realAiCoachAdapter: AICoachAdapter = new RealAiCoachAdapter();
