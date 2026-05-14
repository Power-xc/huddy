import type { PracticeSignalSummary } from "@shared/types";
import { GlassCard } from "@shared/ui";

export type PracticeSignalReportProps = {
  signals: PracticeSignalSummary | null;
};

const formatScore = (score: number | null): string =>
  typeof score === "number" ? `${score}%` : "분석 제한";

export function PracticeSignalReport({ signals }: PracticeSignalReportProps) {
  if (!signals) {
    return (
      <GlassCard className="grid gap-3 p-6">
        <h2 className="text-xl font-semibold text-text">실전 신호 분석</h2>
        <p className="leading-7 text-text-secondary">
          이번 세션에는 STT/카메라 신호 기록이 없습니다.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="grid gap-5 p-6">
      <div>
        <p className="text-sm font-medium text-primary">Practice signals</p>
        <h2 className="mt-2 text-xl font-semibold text-text">실전 신호 분석</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm text-text-secondary">시선/카메라 방향</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-primary">
            {formatScore(signals.cameraAttentionScore)}
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {signals.cameraFeedback}
          </p>
        </div>
        <div>
          <p className="text-sm text-text-secondary">입 움직임</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-primary">
            {formatScore(signals.mouthMovementScore)}
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {signals.mouthFeedback}
          </p>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="text-sm text-text-secondary">실제 자주 말한 키워드</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {signals.spokenKeywords.map((keyword) => (
              <span
                className="rounded-full border border-border px-3 py-1 font-mono text-sm text-text-secondary"
                key={keyword.text}
              >
                {keyword.text}
                <span className="ml-1 text-text-muted">x{keyword.count}</span>
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm text-text-secondary">빠진 route 키워드</p>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            {signals.missedRouteKeywords.length > 0
              ? signals.missedRouteKeywords.join(" / ")
              : "준비한 route 키워드를 모두 언급했습니다."}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
