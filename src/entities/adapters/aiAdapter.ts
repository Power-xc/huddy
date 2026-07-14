import type { AICoachAdapter } from "./aiCoachAdapter";
import { mockAiCoachAdapter } from "./mockAiCoachAdapter";
import { realAiCoachAdapter } from "./realAiCoachAdapter";

const shouldUseRealAi = process.env.NEXT_PUBLIC_AI_MODE === "real";

export const aiCoachMode = shouldUseRealAi ? "real" : "local";

const withLocalFallback = async <T>(
  realRequest: () => Promise<T>,
  localRequest: () => Promise<T>,
): Promise<T> => {
  if (!shouldUseRealAi) {
    return localRequest();
  }

  try {
    return await realRequest();
  } catch (error) {
    console.error("Real AI coach unavailable. Using local coaching.", error);
    return localRequest();
  }
};

export const aiCoachAdapter: AICoachAdapter = {
  generateKeywordCards: (memoKo, category, scriptText, targetDurationMin) =>
    withLocalFallback(
      () =>
        realAiCoachAdapter.generateKeywordCards(
          memoKo,
          category,
          scriptText,
          targetDurationMin,
        ),
      () =>
        mockAiCoachAdapter.generateKeywordCards(
          memoKo,
          category,
          scriptText,
          targetDurationMin,
        ),
    ),
  generateBreathScript: (
    memoKo,
    keywordCards,
    scriptText,
    scriptTranslationKo,
  ) =>
    withLocalFallback(
      () =>
        realAiCoachAdapter.generateBreathScript(
          memoKo,
          keywordCards,
          scriptText,
          scriptTranslationKo,
        ),
      () =>
        mockAiCoachAdapter.generateBreathScript(
          memoKo,
          keywordCards,
          scriptText,
          scriptTranslationKo,
        ),
    ),
  translateScript: (scriptText) =>
    shouldUseRealAi
      ? realAiCoachAdapter.translateScript(scriptText)
      : mockAiCoachAdapter.translateScript(scriptText),
  generateReport: (session) =>
    withLocalFallback(
      () => realAiCoachAdapter.generateReport(session),
      () => mockAiCoachAdapter.generateReport(session),
    ),
};
