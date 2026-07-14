import {
  memoKoMaxLength,
  scriptTranslationKoMaxLength,
  scriptTextMaxLength,
} from "@shared/config/practiceLimits";
import { buildBreathScript } from "@shared/lib/buildBreathScript";
import { createClaudeJsonText } from "../_lib/anthropicClient";
import { isRecord, jsonError, parseJsonText } from "../_lib/json";
import { guardAiRequest } from "../_lib/requestGuard";

type BreathSegmentDraft = {
  text: string;
  translationKo?: string | null;
  isBreathPoint: boolean;
};

type BreathScriptRequestBody = {
  memoKo: string;
  keywords: string[];
  scriptText?: string;
  scriptTranslationKo?: string;
};

const isRequestBody = (value: unknown): value is BreathScriptRequestBody => {
  if (!isRecord(value) || typeof value.memoKo !== "string") {
    return false;
  }

  const scriptText =
    typeof value.scriptText === "string" ? value.scriptText : "";
  const scriptTranslationKo =
    typeof value.scriptTranslationKo === "string"
      ? value.scriptTranslationKo
      : "";

  return (
    value.memoKo.length <= memoKoMaxLength &&
    scriptText.length <= scriptTextMaxLength &&
    scriptTranslationKo.length <= scriptTranslationKoMaxLength &&
    Array.isArray(value.keywords) &&
    value.keywords.length > 0 &&
    value.keywords.length <= 24 &&
    value.keywords.every(
      (keyword) => typeof keyword === "string" && keyword.length <= 80,
    ) &&
    (value.scriptText === undefined || typeof value.scriptText === "string") &&
    (value.scriptTranslationKo === undefined ||
      typeof value.scriptTranslationKo === "string")
  );
};

const isBreathSegmentDraft = (
  value: unknown,
): value is BreathSegmentDraft =>
  isRecord(value) &&
  typeof value.text === "string" &&
  value.text.trim().length > 0 &&
  (value.translationKo === undefined ||
    value.translationKo === null ||
    typeof value.translationKo === "string") &&
  typeof value.isBreathPoint === "boolean";

const isBreathSegmentDraftArray = (
  value: unknown,
): value is BreathSegmentDraft[] =>
  Array.isArray(value) &&
  value.length >= 1 &&
  value.length <= 250 &&
  value.every(isBreathSegmentDraft);

const buildPrompt = ({
  memoKo,
  keywords,
  scriptText = "",
}: BreathScriptRequestBody): string => `
Korean memo: ${memoKo}
Keyword route: ${keywords.join(" → ")}
User's English script: ${scriptText || "none"}

Create a Breath Script: short English phrases (5-12 words each) that follow
the keyword route. Each phrase = one natural breath unit.

Return ONLY this JSON array:
[
  {"text": "phrase here", "isBreathPoint": false},
  ...
]

Rules:
- 6 to 10 segments total
- text: natural spoken English phrase, no punctuation except commas
- isBreathPoint: true for segments where the speaker should pause briefly
  (after important statements, before transitions) — roughly every 2-3 segments
- First segment isBreathPoint: false always
- If the user script exists, preserve its wording where possible
- Reflect the actual content of the memo and follow the keyword order`;

export async function POST(request: Request): Promise<Response> {
  const guardResponse = guardAiRequest(request);

  if (guardResponse) {
    return guardResponse;
  }

  const body: unknown = await request.json().catch(() => null);

  if (!isRequestBody(body)) {
    return jsonError("Invalid request body", 400);
  }

  const fullScript = buildBreathScript(
    body.scriptText ?? "",
    body.scriptTranslationKo ?? "",
  );

  if (fullScript) {
    return Response.json({
      segments: fullScript.segments.map(({ text, translationKo, isBreathPoint }) => ({
        text,
        translationKo,
        isBreathPoint,
      })),
    });
  }

  try {
    const text = await createClaudeJsonText({
      model: "claude-haiku-4-5-20251001",
      maxTokens: 1200,
      system:
        "You are an English presentation coach. Return JSON only. No explanation.",
      prompt: buildPrompt(body),
    });
    const parsedResponse = parseJsonText(text);

    if (!isBreathSegmentDraftArray(parsedResponse)) {
      return jsonError("Invalid AI response", 500);
    }

    return Response.json({
      segments: parsedResponse.map((segment) => ({
        ...segment,
        translationKo: null,
      })),
    });
  } catch (error) {
    console.error("Breath script generation failed.", error);
    return jsonError("Breath script generation failed", 500);
  }
}
