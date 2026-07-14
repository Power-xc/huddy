import type {
  BreathScript,
  KeywordCard,
  PracticeSession,
  PracticeSessionCategory,
  SessionReport,
} from "@shared/types";

export interface AICoachAdapter {
  generateKeywordCards(
    memoKo: string,
    category: PracticeSessionCategory,
    scriptText?: string,
    targetDurationMin?: number,
  ): Promise<KeywordCard[]>;
  generateBreathScript(
    memoKo: string,
    keywordCards: KeywordCard[],
    scriptText?: string,
    scriptTranslationKo?: string,
  ): Promise<BreathScript>;
  translateScript(scriptText: string): Promise<string>;
  generateReport(session: PracticeSession): Promise<SessionReport>;
}
