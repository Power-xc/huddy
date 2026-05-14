"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type {
  AppConfig,
  PracticeSession,
  PracticeSessionSummary,
} from "@shared/types";
import { Button, GlassCard } from "@shared/ui";
import { storage } from "@shared/lib/storage";
import { ProgressKeywordInsights } from "@widgets/ProgressKeywordInsights";
import { WeekGrid } from "@widgets/WeekGrid";

const initialConfig: AppConfig = {
  programStartDate: "",
  currentWeek: 1,
  totalSessionsCompleted: 0,
};

const toSummary = (session: PracticeSession): PracticeSessionSummary => ({
  id: session.id,
  title: session.title,
  category: session.category,
  mode: session.mode,
  focusAreas: session.focusAreas,
  status: session.status,
  weekNumber: session.weekNumber,
  completedAt: session.completedAt,
});

export function ProgressPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [config, setConfig] = useState<AppConfig>(initialConfig);

  useEffect(() => {
    let isActive = true;

    const loadStoredProgress = async () => {
      await Promise.resolve();

      if (!isActive) {
        return;
      }

      // localStorage는 클라이언트 전용이라 마운트 이후에 읽어 hydration 차이를 피한다.
      setSessions(storage.getSessions());
      setConfig(storage.getConfig());
    };

    void loadStoredProgress();

    return () => {
      isActive = false;
    };
  }, []);

  const summaries = useMemo(() => sessions.map(toSummary), [sessions]);
  const completedSessions = useMemo(
    () =>
      sessions
        .filter((session) => session.status === "completed")
        .sort((first, second) =>
          first.weekNumber === second.weekNumber
            ? (second.completedAt ?? "").localeCompare(first.completedAt ?? "")
            : first.weekNumber - second.weekNumber,
        ),
    [sessions],
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-5 py-8 sm:px-8 lg:py-12">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Progress</p>
          <h1 className="mt-2 font-heading text-4xl font-semibold text-text">
            12주 진행 현황
          </h1>
          <p className="mt-3 text-text-secondary">
            매주 하나의 주제로 발표 route를 완주합니다.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border-strong px-5 text-base font-semibold text-text transition-colors hover:border-primary hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            href="/"
          >
            홈으로
          </Link>
          <Button onClick={() => router.push("/session/new")}>
            새 세션 시작
          </Button>
        </div>
      </header>

      <GlassCard className="flex flex-col gap-5 p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-text">12-week route</h2>
          <p className="font-mono text-sm text-text-secondary">
            Week {config.currentWeek} / 12
          </p>
        </div>
        <WeekGrid currentWeek={config.currentWeek} sessions={summaries} />
      </GlassCard>

      <ProgressKeywordInsights sessions={sessions} />

      <GlassCard className="flex flex-col gap-4 p-6">
        <h2 className="text-xl font-semibold text-text">완료된 route</h2>
        {completedSessions.length > 0 ? (
          <div className="grid gap-3">
            {completedSessions.map((session) => (
              <button
                className="grid gap-1 rounded-lg border border-border bg-surface px-4 py-3 text-left transition-colors hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                key={session.id}
                onClick={() => router.push(`/session/${session.id}/report`)}
                type="button"
              >
                <span className="font-medium text-text">{session.title}</span>
                <span className="text-sm text-text-secondary">
                  Route completed · Week {session.weekNumber}
                </span>
              </button>
            ))}
          </div>
        ) : (
          // 첫 실행 개인 MVP에서도 진행 페이지의 목적을 유지하기 위한 빈 상태다.
          <p className="text-text-secondary">아직 완료된 발표가 없습니다.</p>
        )}
      </GlassCard>
    </main>
  );
}

export default ProgressPage;
