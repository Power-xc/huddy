import type { PracticeSession } from "@shared/types";
import { GlassCard } from "@shared/ui";

export type ProgressKeywordInsightsProps = {
  sessions: PracticeSession[];
};

type KeywordCount = {
  keyword: string;
  count: number;
};

const countKeywords = (keywords: string[]): KeywordCount[] => {
  const counts = new Map<string, number>();

  keywords.forEach((keyword) => {
    counts.set(keyword, (counts.get(keyword) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((first, second) => second.count - first.count || first.keyword.localeCompare(second.keyword))
    .slice(0, 6);
};

const averageScore = (scores: Array<number | null | undefined>): number | null => {
  const validScores = scores.filter((score): score is number => typeof score === "number");

  if (validScores.length === 0) {
    return null;
  }

  return Math.round(
    validScores.reduce((total, score) => total + score, 0) / validScores.length,
  );
};

export function ProgressKeywordInsights({
  sessions,
}: ProgressKeywordInsightsProps) {
  const completedSessions = sessions.filter(
    (session) => session.status === "completed",
  );
  const autoDetectedKeywords = completedSessions.flatMap(
    (session) => session.practiceSignals?.autoDetectedKeywords ?? [],
  );
  const manuallyAdvancedKeywords = completedSessions.flatMap(
    (session) => session.practiceSignals?.manuallyAdvancedKeywords ?? [],
  );
  const missedKeywords = completedSessions.flatMap(
    (session) => session.practiceSignals?.missedRouteKeywords ?? [],
  );
  const trackedKeywordCount =
    autoDetectedKeywords.length + manuallyAdvancedKeywords.length;
  const autoRate =
    trackedKeywordCount > 0
      ? Math.round((autoDetectedKeywords.length / trackedKeywordCount) * 100)
      : null;
  const missedKeywordCounts = countKeywords(missedKeywords);
  const averageReadingRisk = averageScore(
    completedSessions.map(
      (session) => session.practiceSignals?.readingPostureRiskScore,
    ),
  );
  const averageMouthOpenness = averageScore(
    completedSessions.map((session) => session.practiceSignals?.mouthOpennessScore),
  );

  return (
    <GlassCard className="grid gap-5 p-6">
      <div>
        <p className="text-sm font-medium text-primary">Route intelligence</p>
        <h2 className="mt-2 text-xl font-semibold text-text">
          키워드 감지 흐름
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        <div>
          <p className="text-sm text-text-secondary">자동 감지율</p>
          <p className="mt-2 font-mono text-3xl font-semibold text-primary">
            {autoRate === null ? "--" : `${autoRate}%`}
          </p>
        </div>
        <div>
          <p className="text-sm text-text-secondary">자동 통과</p>
          <p className="mt-2 font-mono text-3xl font-semibold text-text">
            {autoDetectedKeywords.length}
          </p>
        </div>
        <div>
          <p className="text-sm text-text-secondary">수동 전환</p>
          <p className="mt-2 font-mono text-3xl font-semibold text-text">
            {manuallyAdvancedKeywords.length}
          </p>
        </div>
        <div>
          <p className="text-sm text-text-secondary">읽는 자세 리스크</p>
          <p className="mt-2 font-mono text-3xl font-semibold text-text">
            {averageReadingRisk === null ? "--" : `${averageReadingRisk}%`}
          </p>
        </div>
        <div>
          <p className="text-sm text-text-secondary">평균 입 열림</p>
          <p className="mt-2 font-mono text-3xl font-semibold text-text">
            {averageMouthOpenness === null ? "--" : `${averageMouthOpenness}%`}
          </p>
        </div>
      </div>
      <div>
        <p className="text-sm text-text-secondary">반복 누락 route 키워드</p>
        {missedKeywordCounts.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {missedKeywordCounts.map((item) => (
              <span
                className="rounded-full border border-border px-3 py-1 font-mono text-sm text-text-secondary"
                key={item.keyword}
              >
                {item.keyword}
                <span className="ml-1 text-text-muted">x{item.count}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            완료된 route에서 반복적으로 빠진 키워드가 아직 없습니다.
          </p>
        )}
      </div>
    </GlassCard>
  );
}
