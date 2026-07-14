import type { PracticeSignalSummary } from "@shared/types";
import { formatTime } from "@shared/lib/formatTime";
import { GlassCard } from "@shared/ui";

export type PracticeSignalReportProps = {
  signals: PracticeSignalSummary | null;
};

const formatScore = (score: number | null): string =>
  typeof score === "number" ? `${score}%` : "분석 제한";
const formatOptionalScore = (score: number | null | undefined): string =>
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

  const timeline = signals.transcriptTimeline ?? [];
  const autoDetectedKeywords = signals.autoDetectedKeywords ?? [];
  const manuallyAdvancedKeywords = signals.manuallyAdvancedKeywords ?? [];
  const scriptAssessment = signals.scriptAssessment;

  return (
    <GlassCard className="grid gap-5 p-6">
      <div>
        <p className="text-sm font-medium text-primary">Practice signals</p>
        <h2 className="mt-2 text-xl font-semibold text-text">실전 신호 분석</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <p className="text-sm text-text-secondary">스크립트 매칭</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-primary">
            {formatOptionalScore(scriptAssessment?.coverageScore)}
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {scriptAssessment?.feedbackKo ?? "스크립트 낭독 기록이 없습니다."}
          </p>
        </div>
        <div>
          <p className="text-sm text-text-secondary">음성 인식 신뢰도</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-primary">
            {formatOptionalScore(
              signals.speechRecognitionConfidence ??
                scriptAssessment?.recognitionConfidence,
            )}
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {signals.speechRecognitionError ??
              "브라우저가 받아쓴 영어 음성의 평균 신뢰도입니다."}
          </p>
        </div>
        <div>
          <p className="text-sm text-text-secondary">발음 명료도 추정</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-primary">
            {formatOptionalScore(scriptAssessment?.pronunciationScore)}
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {(scriptAssessment?.unclearWords.length ?? 0) > 0
              ? scriptAssessment?.unclearWords.join(" / ")
              : "다시 확인할 발음 단어가 없습니다."}
          </p>
        </div>
      </div>
      <p className="text-xs leading-5 text-text-muted">
        발음 명료도는 음성 인식 신뢰도, 원문 매칭, 핵심 단어 인식을 합친
        연습용 추정치이며 정밀 음소 분석 결과는 아닙니다.
      </p>
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
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <p className="text-sm text-text-secondary">입 열림</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-primary">
            {formatOptionalScore(signals.mouthOpennessScore)}
          </p>
        </div>
        <div>
          <p className="text-sm text-text-secondary">고개 안정성</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-primary">
            {formatOptionalScore(signals.headStabilityScore)}
          </p>
        </div>
        <div>
          <p className="text-sm text-text-secondary">아래보기 비율</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-text">
            {formatOptionalScore(signals.lookDownRatio)}
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm text-text-secondary">읽는 자세 리스크</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-text">
            {formatOptionalScore(signals.readingPostureRiskScore)}
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {signals.readingFeedback ?? "읽는 자세 리스크 기록이 없습니다."}
          </p>
        </div>
        <div>
          <p className="text-sm text-text-secondary">pause 리듬</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-text">
            {formatOptionalScore(signals.pauseRhythmScore)}
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {signals.pauseFeedback ?? "pause 리듬 기록이 없습니다."}
          </p>
        </div>
      </div>
      <p className="text-sm leading-6 text-text-secondary">
        {signals.postureFeedback ?? "자세 신호 기록이 없습니다."}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm text-text-secondary">자동 감지 route</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-primary">
            {autoDetectedKeywords.length}
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {autoDetectedKeywords.length > 0
              ? autoDetectedKeywords.join(" / ")
              : "STT로 자동 통과된 키워드가 없습니다."}
          </p>
        </div>
        <div>
          <p className="text-sm text-text-secondary">수동 전환 route</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-text">
            {manuallyAdvancedKeywords.length}
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {manuallyAdvancedKeywords.length > 0
              ? manuallyAdvancedKeywords.join(" / ")
              : "수동으로 넘긴 키워드가 없습니다."}
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
      <div className="border-t border-border pt-5">
        <p className="text-sm text-text-secondary">발표 리플레이</p>
        {timeline.length > 0 ? (
          <div className="mt-3 grid gap-3">
            {timeline.slice(-6).map((item) => (
              <div
                className="rounded-xl border border-border bg-surface/60 p-3"
                key={item.id}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-text-muted">
                    {formatTime(item.elapsedSec)}
                  </span>
                  <div className="flex flex-wrap justify-end gap-1">
                    {item.matchedKeywords.map((keyword) => (
                      <span
                        className="rounded-full border border-primary/40 px-2 py-0.5 text-xs text-primary"
                        key={keyword}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            저장된 발표 문장 흐름이 없습니다.
          </p>
        )}
      </div>
    </GlassCard>
  );
}
