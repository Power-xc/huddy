import { createClaudeJsonText } from "../_lib/anthropicClient";
import { isRecord, jsonError, parseJsonText } from "../_lib/json";

type BreathSegmentDraft = {
  text: string;
  isBreathPoint: boolean;
};

type BreathScriptRequestBody = {
  memoKo: string;
  keywords: string[];
};

const isRequestBody = (value: unknown): value is BreathScriptRequestBody =>
  isRecord(value) &&
  typeof value.memoKo === "string" &&
  Array.isArray(value.keywords) &&
  value.keywords.every((keyword) => typeof keyword === "string");

const isBreathSegmentDraft = (
  value: unknown,
): value is BreathSegmentDraft =>
  isRecord(value) &&
  typeof value.text === "string" &&
  value.text.trim().length > 0 &&
  typeof value.isBreathPoint === "boolean";

const isBreathSegmentDraftArray = (
  value: unknown,
): value is BreathSegmentDraft[] =>
  Array.isArray(value) &&
  value.length >= 4 &&
  value.length <= 12 &&
  value.every(isBreathSegmentDraft);

const buildPrompt = ({ memoKo, keywords }: BreathScriptRequestBody): string => `
Korean memo: ${memoKo}
Keyword route: ${keywords.join(" → ")}

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
- Reflect the actual content of the memo and follow the keyword order`;

export async function POST(request: Request): Promise<Response> {
  const body: unknown = await request.json().catch(() => null);

  if (!isRequestBody(body)) {
    return jsonError("Invalid request body", 400);
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

    return Response.json({ segments: parsedResponse });
  } catch (error) {
    console.error("Breath script generation failed.", error);
    return jsonError("Breath script generation failed", 500);
  }
}
