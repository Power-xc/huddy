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
import { WeekGrid } from "@widgets/WeekGrid";

const defaultMission = "좋아하는 주제로 3분 영어 발표를 준비하세요.";

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

export function HomePage() {
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
    () => sessions.filter((session) => session.status === "completed"),
    [sessions],
  );
  const recentCompletedSessions = useMemo(
    () =>
      [...completedSessions]
        .sort((first, second) =>
          (second.completedAt ?? "").localeCompare(first.completedAt ?? ""),
        )
        .slice(0, 3),
    [completedSessions],
  );
  const latestMission =
    recentCompletedSessions[0]?.report?.nextWeekMission ?? defaultMission;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-5 py-8 sm:px-8 lg:py-12">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <GlassCard className="flex flex-col gap-6 p-6 sm:p-8">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-primary">HUDdy</p>
            <h1 className="font-heading text-3xl font-semibold text-text sm:text-5xl">
              Your AI speaking navigator on screen.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-text-secondary">
              영어 발표 중 다음 키워드, 호흡, 속도, 흐름을 조용히 안내하는
              AI 스피킹 내비게이터
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => router.push("/session/new")}>
              새 세션 시작
            </Button>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border-strong px-5 text-base font-semibold text-text transition-colors hover:border-primary hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              href="/progress"
            >
              진행 현황 보기
            </Link>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col justify-between gap-6 p-6 sm:p-8">
          <div>
            <p className="text-sm text-text-secondary">Current week</p>
            <p className="mt-2 font-mono text-4xl font-semibold text-primary">
              Week {config.currentWeek} / 12
            </p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Completed sessions</p>
            <p className="mt-2 font-mono text-4xl font-semibold text-text">
              {completedSessions.length}
            </p>
          </div>
        </GlassCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <GlassCard className="flex flex-col gap-4 p-6">
          <div>
            <h2 className="text-xl font-semibold text-text">이번 주 미션</h2>
            <p className="mt-3 leading-7 text-text-secondary">
              {latestMission}
            </p>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-text">12주 프리뷰</h2>
            <Link className="text-sm font-medium text-primary" href="/progress">
              전체 보기
            </Link>
          </div>
          <WeekGrid currentWeek={config.currentWeek} sessions={summaries} />
        </GlassCard>
      </section>

      <GlassCard className="flex flex-col gap-4 p-6">
        <h2 className="text-xl font-semibold text-text">최근 완료 세션</h2>
        {recentCompletedSessions.length > 0 ? (
          <div className="grid gap-3">
            {recentCompletedSessions.map((session) => (
              <button
                className="rounded-lg border border-border bg-surface px-4 py-3 text-left transition-colors hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                key={session.id}
                onClick={() => router.push(`/session/${session.id}/report`)}
                type="button"
              >
                <span className="block font-medium text-text">
                  {session.title}
                </span>
                <span className="mt-1 block text-sm text-text-secondary">
                  Week {session.weekNumber}
                </span>
              </button>
            ))}
          </div>
        ) : (
          // 첫 실행 사용자가 길을 잃지 않도록 다음 행동을 분명히 보여준다.
          <p className="text-text-secondary">
            아직 완료된 세션이 없습니다. 첫 세션을 시작해보세요.
          </p>
        )}
      </GlassCard>
    </main>
  );
}

export default HomePage;
