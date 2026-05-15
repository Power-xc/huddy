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
  ): Promise<KeywordCard[]>;
  generateBreathScript(
    memoKo: string,
    keywordCards: KeywordCard[],
    scriptText?: string,
  ): Promise<BreathScript>;
  generateReport(session: PracticeSession): Promise<SessionReport>;
}
