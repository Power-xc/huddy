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
  ): Promise<KeywordCard[]>;
  generateBreathScript(
    memoKo: string,
    keywordCards: KeywordCard[],
  ): Promise<BreathScript>;
  generateReport(session: PracticeSession): Promise<SessionReport>;
}
