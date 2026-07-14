import { describe, expect, it } from "vitest";
import { createPracticeSession } from "@shared/lib/createPracticeSession";
import { formatTime } from "@shared/lib/formatTime";
import type { PracticeSession, SessionReport } from "@shared/types";
import { buildReportMarkdown } from "./buildReportMarkdown";

const baseSession = createPracticeSession({
  id: "s1",
  title: "My Demo Talk",
  category: "work",
  mode: "script",
  focusAreas: ["breathing"],
  targetDurationMin: 5,
  weekNumber: 2,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

const report: SessionReport = {
  oneLineFeedback: "Solid delivery overall.",
  strengths: ["Clear intro", "Good pace", "Confident tone"],
  improvements: ["Slow down endings", "More eye contact"],
  breathFeedback: "Breathing was steady.",
  flowFeedback: "Transitions were smooth.",
  problemWords: [],
  nextWeekMission: "Practice the closing twice.",
  recommendedMode: "keyword",
  metrics: { clarity: 80, confidence: 75, flow: 82, pronunciation: 70, breath: 78 },
  actualDurationSec: 315,
  keywordsUsedCount: 4,
  createdAt: "2026-01-01T00:05:00.000Z",
};

describe("buildReportMarkdown", () => {
  it("renders a placeholder when no report is saved", () => {
    const markdown = buildReportMarkdown({ ...baseSession, report: null });

    expect(markdown).toContain("# My Demo Talk");
    expect(markdown).toContain("아직 저장된 리포트가 없습니다.");
  });

  it("renders the report headline, lists and formatted duration", () => {
    const session: PracticeSession = { ...baseSession, report };
    const markdown = buildReportMarkdown(session);

    expect(markdown).toContain("# My Demo Talk");
    expect(markdown).toContain("## 한 줄 피드백");
    expect(markdown).toContain("Solid delivery overall.");
    expect(markdown).toContain("- Clear intro");
    expect(markdown).toContain("- Slow down endings");
    expect(markdown).toContain("Practice the closing twice.");
    expect(markdown).toContain(`- Actual: ${formatTime(315)}`);
  });

  it("falls back to placeholders for unrecorded signal sections", () => {
    const session: PracticeSession = { ...baseSession, report };

    expect(buildReportMarkdown(session)).toContain("기록 없음");
  });
});
