import type { PracticeSessionCategory } from "@shared/types";
import { createClaudeJsonText } from "../_lib/anthropicClient";
import { isRecord, jsonError, parseJsonText } from "../_lib/json";
import { guardAiRequest } from "../_lib/requestGuard";

type KeywordCardDraft = {
  keyword: string;
  hintKo: string;
};

type KeywordRequestBody = {
  memoKo: string;
  category: PracticeSessionCategory;
  scriptText?: string;
};

const categories: PracticeSessionCategory[] = [
  "work",
  "study",
  "life",
  "custom",
];

const isCategory = (value: unknown): value is PracticeSessionCategory =>
  typeof value === "string" &&
  categories.includes(value as PracticeSessionCategory);

const isRequestBody = (value: unknown): value is KeywordRequestBody => {
  if (!isRecord(value) || typeof value.memoKo !== "string") {
    return false;
  }

  const scriptText =
    typeof value.scriptText === "string" ? value.scriptText : "";

  return (
    value.memoKo.length <= 1000 &&
    scriptText.length <= 4000 &&
    (value.memoKo.trim().length > 0 || scriptText.trim().length > 0) &&
    isCategory(value.category) &&
    (value.scriptText === undefined || typeof value.scriptText === "string")
  );
};

const isKeywordDraft = (value: unknown): value is KeywordCardDraft =>
  isRecord(value) &&
  typeof value.keyword === "string" &&
  value.keyword.trim().length > 0 &&
  typeof value.hintKo === "string" &&
  value.hintKo.trim().length > 0;

const isKeywordDraftArray = (value: unknown): value is KeywordCardDraft[] =>
  Array.isArray(value) && value.length === 6 && value.every(isKeywordDraft);

const buildPrompt = ({
  memoKo,
  category,
  scriptText = "",
}: KeywordRequestBody): string => `
Korean memo: ${memoKo}
User's English script: ${scriptText || "none"}
Category: ${category}

Generate exactly 6 English keyword cards for a ${category} presentation based
on the memo and the user's actual English script.

Return ONLY this JSON array (no markdown, no explanation):
[
  {"keyword": "OneOrTwoWords", "hintKo": "Korean hint under 20 chars"},
  ...
]

Rules:
- keyword: 1-3 English words, title case, no punctuation
- hintKo: Korean description under 20 chars of what to say at this point
- Cover opening → body → closing arc
- Prefer important terms that appear in the actual script when script exists
- Reflect the actual content of the memo and script`;

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
      maxTokens: 900,
      system:
        "You are an English presentation coach. Return JSON only. No explanation.",
      prompt: buildPrompt(body),
    });
    const parsedResponse = parseJsonText(text);

    if (!isKeywordDraftArray(parsedResponse)) {
      return jsonError("Invalid AI response", 500);
    }

    return Response.json({ cards: parsedResponse });
  } catch (error) {
    console.error("Keyword generation failed.", error);
    return jsonError("Keyword generation failed", 500);
  }
}
