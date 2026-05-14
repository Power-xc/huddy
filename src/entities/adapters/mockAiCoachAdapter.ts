import type {
  BreathScript,
  KeywordCard,
  PracticeSession,
  PracticeSessionCategory,
  SessionReport,
} from "@shared/types";
import type { AICoachAdapter } from "./aiCoachAdapter";

type KeywordSeed = {
  keyword: string;
  hintKo: string;
};

const wait = (durationMs: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });

const keywordSeeds: Record<PracticeSessionCategory, KeywordSeed[]> = {
  work: [
    { keyword: "Problem", hintKo: "해결하려는 업무 문제" },
    { keyword: "Evidence", hintKo: "근거가 되는 숫자나 사례" },
    { keyword: "Option", hintKo: "검토한 선택지" },
    { keyword: "Decision", hintKo: "추천하는 결정" },
    { keyword: "Impact", hintKo: "기대되는 효과" },
    { keyword: "Next step", hintKo: "회의 뒤 실행할 일" },
  ],
  study: [
    { keyword: "Topic", hintKo: "오늘 설명할 핵심 주제" },
    { keyword: "Definition", hintKo: "짧은 개념 정의" },
    { keyword: "Example", hintKo: "이해를 돕는 예시" },
    { keyword: "Comparison", hintKo: "비슷한 개념과 차이" },
    { keyword: "Insight", hintKo: "내가 얻은 배움" },
    { keyword: "Question", hintKo: "청중에게 남길 질문" },
  ],
  life: [
    { keyword: "Moment", hintKo: "이야기가 시작된 장면" },
    { keyword: "Feeling", hintKo: "그때의 감정" },
    { keyword: "Change", hintKo: "달라진 점" },
    { keyword: "Lesson", hintKo: "배운 점" },
    { keyword: "Today", hintKo: "지금의 나와 연결" },
    { keyword: "Message", hintKo: "마지막으로 전할 말" },
  ],
  custom: [
    { keyword: "Opening", hintKo: "첫 문장으로 잡을 관심" },
    { keyword: "Context", hintKo: "청중에게 필요한 배경" },
    { keyword: "Point", hintKo: "가장 중요한 주장" },
    { keyword: "Story", hintKo: "짧게 붙일 사례" },
    { keyword: "Takeaway", hintKo: "청중이 기억할 문장" },
    { keyword: "Closing", hintKo: "마무리 메시지" },
  ],
};

export class MockAiCoachAdapter implements AICoachAdapter {
  async generateKeywordCards(
    memoKo: string,
    category: PracticeSessionCategory,
  ): Promise<KeywordCard[]> {
    await wait(300);

    const hasMemo = memoKo.trim().length > 0;

    return keywordSeeds[category].map((seed, index) => ({
      id: crypto.randomUUID(),
      order: index + 1,
      keyword: seed.keyword,
      hintKo: hasMemo ? seed.hintKo : `${seed.hintKo}를 간단히 적어보세요.`,
      isUsed: false,
    }));
  }

  async generateBreathScript(
    memoKo: string,
    keywordCards: KeywordCard[],
  ): Promise<BreathScript> {
    await wait(300);

    const fallbackText =
      keywordCards.length > 0
        ? keywordCards
            .slice(0, 4)
            .map((card) => card.keyword)
            .join(" / ")
        : "Opening / Main point / Closing";
    const sourceText = memoKo.trim().length > 0 ? memoKo.trim() : fallbackText;
    const fullText = sourceText.includes("/")
      ? sourceText
      : `${sourceText} / Key point / Closing`;
    const segments = fullText.split(" / ").map((text, index) => ({
      id: crypto.randomUUID(),
      text,
      isBreathPoint: index > 0,
    }));

    return {
      segments,
      fullText,
    };
  }

  async generateReport(session: PracticeSession): Promise<SessionReport> {
    await wait(300);
    const spokenWords =
      session.practiceSignals?.spokenKeywords
        .slice(0, 3)
        .map((keyword) => keyword.text.toLowerCase()) ?? [];
    const missedRoute = session.practiceSignals?.missedRouteKeywords ?? [];
    const manualRoute =
      session.practiceSignals?.manuallyAdvancedKeywords ?? [];

    return {
      oneLineFeedback: "핵심 흐름을 유지하며 끝까지 발표를 완주했습니다.",
      strengths: [
        "첫 문장이 분명해 청중이 주제를 빠르게 이해할 수 있었습니다.",
        "중간 키워드 전환이 자연스러웠습니다.",
        "마무리에서 다음 행동을 명확히 제시했습니다.",
      ],
      improvements: [
        manualRoute.length > 0
          ? `${manualRoute[0]} 키워드는 다음 연습에서 말로 직접 통과해보세요.`
          : "중요한 문장 앞에서 한 박자 쉬면 전달력이 더 좋아집니다.",
        "예시를 하나만 더 구체화하면 설득력이 높아집니다.",
      ],
      breathFeedback: "긴 문장은 두 덩어리로 나누면 호흡이 더 안정됩니다.",
      flowFeedback:
        missedRoute.length > 0
          ? `다음 연습에서는 ${missedRoute.slice(0, 2).join(", ")} 키워드를 흐름 안에 더 분명히 넣어보세요.`
          : "도입, 근거, 결론의 순서가 잘 유지되었습니다.",
      problemWords:
        spokenWords.length > 0
          ? spokenWords
          : ["strategy", "priority", "evidence"],
      nextWeekMission: "같은 주제로 1분 더 짧게 발표하며 핵심만 남겨보세요.",
      recommendedMode: session.mode,
      metrics: {
        clarity: 82,
        confidence: 78,
        flow: 80,
        pronunciation: 76,
        breath: 74,
      },
      actualDurationSec:
        session.recording?.durationSec ?? session.targetDurationMin * 60,
      keywordsUsedCount: session.keywordCards.filter((card) => card.isUsed)
        .length,
      createdAt: new Date().toISOString(),
    };
  }
}

// P0에서는 실제 모델 호출 전에 화면 흐름과 데이터 계약을 고정하기 위해 mock-first 어댑터를 사용한다.
export const mockAiCoachAdapter: AICoachAdapter = new MockAiCoachAdapter();
