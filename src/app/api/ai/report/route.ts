import type { PresentationMode, SessionMetric } from "@shared/types";
import { createClaudeJsonText } from "../_lib/anthropicClient";
import { isRecord, jsonError, parseJsonText } from "../_lib/json";

type ReportRequestBody = {
  title: string;
  category: string;
  targetDurationMin: number;
  actualDurationSec: number;
  keywordsUsedCount: number;
  totalKeywords: number;
  transcript: string | null;
  keywordRoute: string;
  spokenKeywords: string[];
  matchedRouteKeywords: string[];
  missedRouteKeywords: string[];
  cameraAttentionScore: number | null;
  mouthMovementScore: number | null;
  transcriptTimeline: ReportTimelineItem[];
};

type ReportTimelineItem = {
  elapsedSec: number;
  text: string;
  matchedKeywords: string[];
};

type ReportDraft = {
  oneLineFeedback: string;
  strengths: [string, string, string];
  improvements: [string, string];
  breathFeedback: string;
  flowFeedback: string;
  problemWords: string[];
  nextWeekMission: string;
  recommendedMode: PresentationMode;
  metrics: SessionMetric;
};

const modes: PresentationMode[] = ["script", "breath", "keyword", "no-script"];

const isMode = (value: unknown): value is PresentationMode =>
  typeof value === "string" && modes.includes(value as PresentationMode);

const isMetricValue = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= 0 &&
  value <= 100;

const isMetrics = (value: unknown): value is SessionMetric =>
  isRecord(value) &&
  isMetricValue(value.clarity) &&
  isMetricValue(value.confidence) &&
  isMetricValue(value.flow) &&
  isMetricValue(value.pronunciation) &&
  isMetricValue(value.breath);

const isStringArrayOfLength = (value: unknown, length: number): boolean =>
  Array.isArray(value) &&
  value.length === length &&
  value.every((item) => typeof item === "string" && item.trim().length > 0);

const isStrengths = (value: unknown): value is [string, string, string] =>
  isStringArrayOfLength(value, 3);

const isImprovements = (value: unknown): value is [string, string] =>
  isStringArrayOfLength(value, 2);

const isTimelineItem = (value: unknown): value is ReportTimelineItem =>
  isRecord(value) &&
  typeof value.elapsedSec === "number" &&
  typeof value.text === "string" &&
  Array.isArray(value.matchedKeywords) &&
  value.matchedKeywords.every((item) => typeof item === "string");

const isRequestBody = (value: unknown): value is ReportRequestBody =>
  isRecord(value) &&
  typeof value.title === "string" &&
  typeof value.category === "string" &&
  typeof value.targetDurationMin === "number" &&
  typeof value.actualDurationSec === "number" &&
  typeof value.keywordsUsedCount === "number" &&
  typeof value.totalKeywords === "number" &&
  (typeof value.transcript === "string" || value.transcript === null) &&
  typeof value.keywordRoute === "string" &&
  Array.isArray(value.spokenKeywords) &&
  value.spokenKeywords.every((item) => typeof item === "string") &&
  Array.isArray(value.matchedRouteKeywords) &&
  value.matchedRouteKeywords.every((item) => typeof item === "string") &&
  Array.isArray(value.missedRouteKeywords) &&
  value.missedRouteKeywords.every((item) => typeof item === "string") &&
  (typeof value.cameraAttentionScore === "number" ||
    value.cameraAttentionScore === null) &&
  (typeof value.mouthMovementScore === "number" ||
    value.mouthMovementScore === null) &&
  Array.isArray(value.transcriptTimeline) &&
  value.transcriptTimeline.every(isTimelineItem);

const isReportDraft = (value: unknown): value is ReportDraft =>
  isRecord(value) &&
  typeof value.oneLineFeedback === "string" &&
  isStrengths(value.strengths) &&
  isImprovements(value.improvements) &&
  typeof value.breathFeedback === "string" &&
  typeof value.flowFeedback === "string" &&
  Array.isArray(value.problemWords) &&
  value.problemWords.length >= 3 &&
  value.problemWords.length <= 5 &&
  value.problemWords.every((word) => typeof word === "string") &&
  typeof value.nextWeekMission === "string" &&
  isMode(value.recommendedMode) &&
  isMetrics(value.metrics);

const buildPrompt = (body: ReportRequestBody): string => `
Session: ${body.title}
Category: ${body.category}
Target: ${body.targetDurationMin} min | Actual: ${
  Math.round((body.actualDurationSec / 60) * 10) / 10
} min
Keywords used: ${body.keywordsUsedCount}/${body.totalKeywords}
Keyword route: ${body.keywordRoute}
Detected route keywords: ${body.matchedRouteKeywords.join(" / ") || "none"}
Missed route keywords: ${body.missedRouteKeywords.join(" / ") || "none"}
Frequently spoken keywords: ${body.spokenKeywords.join(" / ") || "none"}
Camera attention score: ${body.cameraAttentionScore ?? "unavailable"}
Mouth movement score: ${body.mouthMovementScore ?? "unavailable"}
Recent speech timeline:
${
  body.transcriptTimeline
    .slice(-8)
    .map(
      (item) =>
        `${item.elapsedSec}s: ${item.text} [${item.matchedKeywords.join(", ") || "no route keyword"}]`,
    )
    .join("\n") || "none"
}
${
  body.transcript
    ? `\nTranscript:\n${body.transcript.slice(0, 3000)}`
    : "\n(No transcript available)"
}

Provide honest, specific coaching feedback in Korean where noted.

Return ONLY this JSON (no markdown):
{
  "oneLineFeedback": "Korean: one sentence summary",
  "strengths": ["Korean strength 1", "Korean strength 2", "Korean strength 3"],
  "improvements": ["Korean improvement 1", "Korean improvement 2"],
  "breathFeedback": "Korean: 1-2 sentences about breathing/pacing",
  "flowFeedback": "Korean: 1-2 sentences about content flow",
  "problemWords": ["english", "words", "to", "practice"],
  "nextWeekMission": "Korean: specific practice goal for next session",
  "recommendedMode": "keyword",
  "metrics": {"clarity":75,"confidence":70,"flow":78,"pronunciation":72,"breath":68}
}`;

export async function POST(request: Request): Promise<Response> {
  const body: unknown = await request.json().catch(() => null);

  if (!isRequestBody(body)) {
    return jsonError("Invalid request body", 400);
  }

  try {
    const text = await createClaudeJsonText({
      model: "claude-sonnet-4-6",
      maxTokens: 1600,
      system:
        "You are an expert English presentation coach analyzing a practice session. Respond in JSON only. Korean is allowed in feedback fields.",
      prompt: buildPrompt(body),
    });
    const parsedResponse = parseJsonText(text);

    if (!isReportDraft(parsedResponse)) {
      return jsonError("Invalid AI response", 500);
    }

    return Response.json(parsedResponse);
  } catch (error) {
    console.error("Report generation failed.", error);
    return jsonError("Report generation failed", 500);
  }
}
