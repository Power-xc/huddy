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
  isBreathPoint: boolean;
};

type BreathScriptResponse = {
  segments: BreathSegmentDraft[];
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
  typeof value.isBreathPoint === "boolean";

const isBreathScriptResponse = (
  value: unknown,
): value is BreathScriptResponse =>
  isRecord(value) &&
  Array.isArray(value.segments) &&
  value.segments.every(isBreathSegmentDraft);

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
  ): Promise<KeywordCard[]> {
    const data = await postJson(
      "/api/ai/keywords",
      { memoKo, category },
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
  ): Promise<BreathScript> {
    const data = await postJson(
      "/api/ai/breath-script",
      { memoKo, keywords: keywordCards.map((card) => card.keyword) },
      isBreathScriptResponse,
      "breath script generation failed",
    );
    const segments = data.segments.map((segment) => ({
      id: crypto.randomUUID(),
      text: segment.text,
      isBreathPoint: segment.isBreathPoint,
    }));

    return {
      segments,
      fullText: segments.map((segment) => segment.text).join(" / "),
    };
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
        cameraAttentionScore:
          session.practiceSignals?.cameraAttentionScore ?? null,
        mouthMovementScore: session.practiceSignals?.mouthMovementScore ?? null,
      },
      isReportResponse,
      "report generation failed",
    );

    return {
      ...data,
      actualDurationSec,
      keywordsUsedCount: 0,
      createdAt: new Date().toISOString(),
    };
  }
}

export const realAiCoachAdapter: AICoachAdapter = new RealAiCoachAdapter();
