import { formatTime } from "@shared/lib/formatTime";
import type { PracticeSession } from "@shared/types";

const list = (items: string[]): string =>
  items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "- 없음";

const formatKeywordProgress = (session: PracticeSession): string => {
  const signals = session.practiceSignals;

  if (!signals) {
    return "기록 없음";
  }

  return [
    `자동 감지: ${signals.autoDetectedKeywords?.join(" / ") || "없음"}`,
    `수동 전환: ${signals.manuallyAdvancedKeywords?.join(" / ") || "없음"}`,
    `누락 키워드: ${signals.missedRouteKeywords.join(" / ") || "없음"}`,
  ].join("\n");
};

const formatMotionSignals = (session: PracticeSession): string => {
  const signals = session.practiceSignals;

  if (!signals) {
    return "기록 없음";
  }

  return [
    `카메라 방향: ${signals.cameraAttentionScore ?? "분석 제한"}%`,
    `입 움직임: ${signals.mouthMovementScore ?? "분석 제한"}%`,
    `입 열림: ${signals.mouthOpennessScore ?? "분석 제한"}%`,
    `고개 안정성: ${signals.headStabilityScore ?? "분석 제한"}%`,
    `아래보기 비율: ${signals.lookDownRatio ?? "분석 제한"}%`,
    `읽는 자세 리스크: ${signals.readingPostureRiskScore ?? "분석 제한"}%`,
    `pause 리듬: ${signals.pauseRhythmScore ?? "분석 제한"}%`,
  ].join("\n");
};

export function buildReportMarkdown(session: PracticeSession): string {
  const report = session.report;

  if (!report) {
    return `# ${session.title}\n\n아직 저장된 리포트가 없습니다.\n`;
  }

  const timeline = session.practiceSignals?.transcriptTimeline ?? [];
  const replay = timeline
    .slice(-8)
    .map(
      (item) =>
        `- ${formatTime(item.elapsedSec)} ${item.text}${
          item.matchedKeywords.length > 0
            ? ` [${item.matchedKeywords.join(", ")}]`
            : ""
        }`,
    )
    .join("\n");

  return [
    `# ${session.title}`,
    "",
    `- Week: ${session.weekNumber}`,
    `- Mode: ${session.mode}`,
    `- Focus: ${session.focusAreas.join(" / ") || "none"}`,
    `- Target: ${session.targetDurationMin} min`,
    `- Actual: ${formatTime(report.actualDurationSec)}`,
    "",
    "## 한 줄 피드백",
    report.oneLineFeedback,
    "",
    "## 잘한 점",
    list(report.strengths),
    "",
    "## 개선하면 좋은 점",
    list(report.improvements),
    "",
    "## 호흡",
    report.breathFeedback,
    "",
    "## 흐름",
    report.flowFeedback,
    "",
    "## 키워드 진행",
    formatKeywordProgress(session),
    "",
    "## 발표 동작 신호",
    formatMotionSignals(session),
    "",
    "## 발표 리플레이",
    replay || "기록 없음",
    "",
    "## 다음 주 미션",
    report.nextWeekMission,
    "",
  ].join("\n");
}
