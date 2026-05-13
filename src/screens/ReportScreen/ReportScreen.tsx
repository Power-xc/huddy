"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { mockAiCoachAdapter } from "@entities/adapters";
import { useHUDStore } from "@features/hud";
import { formatTime } from "@shared/lib/formatTime";
import { storage } from "@shared/lib/storage";
import type { PracticeSession } from "@shared/types";
import { Button, GlassCard } from "@shared/ui";
import { ReportFeedbackList } from "@widgets/ReportFeedbackList";
import { ReportSummary } from "@widgets/ReportSummary";

type ReportLoadState = "loading" | "generating" | "ready" | "error";

const getSessionId = (id: string | string[] | undefined): string =>
  Array.isArray(id) ? id[0] ?? "" : id ?? "";

export function ReportScreen() {
  const params = useParams();
  const router = useRouter();
  const practiceSessionId = useMemo(() => getSessionId(params.id), [params.id]);
  const hudState = useHUDStore((state) => state.hudState);
  const hudKeywordCards = useHUDStore((state) => state.keywordCards);
  const allKeywordsCompleted = useHUDStore((state) => state.allKeywordsCompleted);
  const [practiceSession, setPracticeSession] =
    useState<PracticeSession | null>(null);
  const [loadState, setLoadState] = useState<ReportLoadState>("loading");

  useEffect(() => {
    let isActive = true;

    const loadReport = async () => {
      setLoadState("loading");

      const storedPracticeSession = storage.getSession(practiceSessionId);

      if (!storedPracticeSession) {
        setPracticeSession(null);
        setLoadState("ready");
        return;
      }

      if (storedPracticeSession.report) {
        // 이미 저장된 리포트는 연습 기록이라 재생성하지 않고 읽기 전용으로 다시 보여준다.
        setPracticeSession(storedPracticeSession);
        setLoadState("ready");
        return;
      }

      setPracticeSession(storedPracticeSession);
      setLoadState("generating");

      try {
        // 발표 중에는 말하기에 집중하고, 리포트 생성은 종료 뒤에 처리해 HUD 부담을 늘리지 않는다.
        const generatedReport =
          await mockAiCoachAdapter.generateReport(storedPracticeSession);

        if (!isActive) {
          return;
        }

        const actualDurationSec =
          hudState?.sessionId === practiceSessionId ? hudState.elapsedSec : 0;
        const isForThisSession =
          hudState?.sessionId === practiceSessionId &&
          hudKeywordCards.length > 0;
        // isUsed 플래그는 P0에서 갱신되지 않으므로 HUD 런타임 값으로 계산한다.
        const keywordsUsedCount = isForThisSession
          ? allKeywordsCompleted
            ? hudKeywordCards.length
            : Math.max(
                0,
                Math.min(
                  (hudState?.currentKeywordIndex ?? 0) + 1,
                  hudKeywordCards.length,
                ),
              )
          : 0;

        const completedAt = new Date().toISOString();
        const report = {
          ...generatedReport,
          actualDurationSec,
          keywordsUsedCount,
        };
        const updatedPracticeSession = storage.updateSession(
          storedPracticeSession.id,
          {
            report,
            status: "completed",
            completedAt,
            updatedAt: completedAt,
          },
        );

        setPracticeSession(
          updatedPracticeSession ?? {
            ...storedPracticeSession,
            report,
            status: "completed",
            completedAt,
            updatedAt: completedAt,
          },
        );
        setLoadState("ready");
      } catch (error) {
        console.error("Failed to generate HUDdy report.", error);

        if (isActive) {
          setLoadState("error");
        }
      }
    };

    void loadReport();

    return () => {
      isActive = false;
    };
    // hudState/hudKeywordCards/allKeywordsCompleted are intentionally excluded:
    // the effect must run once per session, capturing HUD values at generation
    // time. Including them would re-run generation when Zustand resets on reopen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practiceSessionId]);

  if (loadState === "loading" || loadState === "generating") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-5">
        <GlassCard className="w-full p-6">
          <p className="text-text-secondary">
            {loadState === "generating"
              ? "발표 리포트를 생성하는 중입니다."
              : "리포트를 불러오는 중입니다."}
          </p>
        </GlassCard>
      </main>
    );
  }

  if (!practiceSession) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-5">
        <GlassCard className="grid w-full gap-5 p-6">
          <div>
            <h1 className="font-heading text-3xl font-semibold text-text">
              세션을 찾을 수 없습니다
            </h1>
            <p className="mt-2 text-text-secondary">
              저장된 발표 세션을 다시 확인해주세요.
            </p>
          </div>
          <div>
            <Button onClick={() => router.push("/")}>홈으로 돌아가기</Button>
          </div>
        </GlassCard>
      </main>
    );
  }

  const report = practiceSession.report;
  const totalKeywordsInSession = practiceSession.keywordCards.length;
  const hasKeywordProgress =
    (report?.keywordsUsedCount ?? 0) > 0 && totalKeywordsInSession > 0;

  if (!report || loadState === "error") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-5">
        <GlassCard className="grid w-full gap-5 p-6">
          <div>
            <h1 className="font-heading text-3xl font-semibold text-text">
              리포트를 만들 수 없습니다
            </h1>
            <p className="mt-2 text-text-secondary">
              잠시 뒤 다시 시도해주세요.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => router.push("/")}>홈으로</Button>
            <Button
              onClick={() =>
                router.push(`/session/${practiceSession.id}/prepare`)
              }
              variant="ghost"
            >
              다시 연습
            </Button>
          </div>
        </GlassCard>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-5 py-8 sm:px-8 lg:py-12">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Report</p>
          <h1 className="mt-2 font-heading text-4xl font-semibold text-text">
            발표 리포트
          </h1>
          <p className="mt-3 text-text-secondary">{practiceSession.title}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={() => router.push("/")}>홈으로</Button>
          <Button onClick={() => router.push("/progress")} variant="secondary">
            진행 현황 보기
          </Button>
          <Button
            onClick={() => router.push(`/session/${practiceSession.id}/prepare`)}
            variant="ghost"
          >
            다시 연습
          </Button>
        </div>
      </header>

      <ReportSummary session={practiceSession} />

      <GlassCard className="grid gap-3 p-6">
        <p className="text-sm font-medium text-primary">Next route</p>
        <h2 className="text-xl font-semibold text-text">다음 주 미션</h2>
        <p className="leading-7 text-text-secondary">
          {report.nextWeekMission}
        </p>
      </GlassCard>

      <GlassCard className="grid gap-5 p-6">
        <div>
          <h2 className="text-xl font-semibold text-text">한 줄 피드백</h2>
          <p className="mt-3 leading-7 text-text-secondary">
            {report.oneLineFeedback}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm text-text-secondary">실제 발표 시간</p>
            <p className="mt-2 font-mono text-2xl font-semibold text-primary">
              {formatTime(report.actualDurationSec)}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">추천 다음 모드</p>
            <p className="mt-2 font-semibold text-text">
              {report.recommendedMode}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">키워드 진행</p>
            {hasKeywordProgress ? (
              <p className="mt-2 font-mono text-2xl font-semibold text-text">
                {report.keywordsUsedCount}
                <span className="ml-1 font-mono text-base font-normal text-text-secondary">
                  / {totalKeywordsInSession}
                </span>
              </p>
            ) : (
              <p className="mt-2 text-sm font-medium text-text-muted">
                키워드 진행 기록 없음
              </p>
            )}
          </div>
          <div>
            <p className="text-sm text-text-secondary">리포트 생성</p>
            <p className="mt-2 text-sm font-medium text-text">
              {new Date(report.createdAt).toLocaleDateString("ko-KR")}
            </p>
          </div>
        </div>
      </GlassCard>

      <section className="grid gap-5 lg:grid-cols-2">
        <ReportFeedbackList
          items={report.strengths}
          title="잘한 점"
          tone="strength"
        />
        <ReportFeedbackList
          items={report.improvements}
          title="개선하면 좋은 점"
          tone="improvement"
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <GlassCard className="grid gap-3 p-6">
          <h2 className="text-xl font-semibold text-text">호흡 피드백</h2>
          <p className="leading-7 text-text-secondary">
            {report.breathFeedback}
          </p>
        </GlassCard>
        <GlassCard className="grid gap-3 p-6">
          <h2 className="text-xl font-semibold text-text">흐름 피드백</h2>
          <p className="leading-7 text-text-secondary">
            {report.flowFeedback}
          </p>
        </GlassCard>
      </section>

      <GlassCard className="grid gap-5 p-6">
        <div>
          <h2 className="text-xl font-semibold text-text">주의할 단어</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {report.problemWords.map((word) => (
              <span
                className="rounded-full border border-border px-3 py-1 font-mono text-sm text-text-secondary"
                key={word}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </GlassCard>
    </main>
  );
}

export default ReportScreen;
