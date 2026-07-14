import { scriptTextMaxLength } from "@shared/config/practiceLimits";
import { createClaudeJsonText } from "../_lib/anthropicClient";
import { isRecord, jsonError, parseJsonText } from "../_lib/json";
import { guardAiRequest } from "../_lib/requestGuard";

type TranslationRequestBody = {
  scriptText: string;
};

const isRequestBody = (value: unknown): value is TranslationRequestBody =>
  isRecord(value) &&
  typeof value.scriptText === "string" &&
  value.scriptText.trim().length > 0 &&
  value.scriptText.length <= scriptTextMaxLength;

const isTranslationResponse = (
  value: unknown,
): value is { translationKo: string } =>
  isRecord(value) &&
  typeof value.translationKo === "string" &&
  value.translationKo.trim().length > 0;

export async function POST(request: Request): Promise<Response> {
  const guardResponse = guardAiRequest(request);

  if (guardResponse) {
    return guardResponse;
  }

  const body: unknown = await request.json().catch(() => null);

  if (!isRequestBody(body)) {
    return jsonError("Invalid request body", 400);
  }

  try {
    const text = await createClaudeJsonText({
      model: "claude-haiku-4-5-20251001",
      maxTokens: 6000,
      system:
        "You translate English presentation scripts into natural Korean. Return JSON only.",
      prompt: `Translate the full English presentation script into natural Korean.
Preserve every sentence, paragraph order, names, numbers, and technical terms.
Do not summarize or omit anything.

Return ONLY this JSON object:
{"translationKo":"full Korean translation"}

English script:
${body.scriptText}`,
    });
    const parsedResponse = parseJsonText(text);

    if (!isTranslationResponse(parsedResponse)) {
      return jsonError("Invalid AI response", 500);
    }

    return Response.json(parsedResponse);
  } catch (error) {
    console.error("Script translation failed.", error);
    return jsonError("Script translation failed", 500);
  }
}
