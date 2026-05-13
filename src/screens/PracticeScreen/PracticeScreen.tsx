"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useHUDStore, usePracticeTimer } from "@features/hud";
import type { PracticeSession } from "@shared/types";
import { storage } from "@shared/lib/storage";
import { Button, GlassCard } from "@shared/ui";
import { HUDOverlay } from "@widgets/HUDOverlay";

const getSessionId = (id: string | string[] | undefined): string =>
  Array.isArray(id) ? id[0] ?? "" : id ?? "";

export function PracticeScreen() {
  const params = useParams();
  const router = useRouter();
  const sessionId = useMemo(() => getSessionId(params.id), [params.id]);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const hudState = useHUDStore((state) => state.hudState);
  const keywordCards = useHUDStore((state) => state.keywordCards);
  const allKeywordsCompleted = useHUDStore(
    (state) => state.allKeywordsCompleted,
  );
  const startSession = useHUDStore((state) => state.startSession);
  const nextKeyword = useHUDStore((state) => state.nextKeyword);
  const endSession = useHUDStore((state) => state.endSession);
  const resetHUD = useHUDStore((state) => state.reset);

  usePracticeTimer();

  useEffect(() => {
    let isActive = true;

    const loadStoredSession = async () => {
      await Promise.resolve();

      if (!isActive) {
        return;
      }

      const storedSession = storage.getSession(sessionId);

      setSession(storedSession);

      if (storedSession) {
        startSession(storedSession.id, storedSession.keywordCards);
      } else {
        resetHUD();
      }

      setIsLoaded(true);
    };

    void loadStoredSession();

    return () => {
      isActive = false;
    };
  }, [resetHUD, sessionId, startSession]);

  if (!isLoaded) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-5">
        <GlassCard className="w-full p-6">
          <p className="text-text-secondary">세션을 불러오는 중입니다.</p>
        </GlassCard>
      </main>
    );
  }

  if (!session) {
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

  const currentKeywordIndex = hudState?.currentKeywordIndex ?? 0;
  const elapsedSec = hudState?.elapsedSec ?? 0;
  const isSessionEnded = hudState
    ? !hudState.isRunning && !hudState.isPaused
    : false;
  const currentCard = allKeywordsCompleted
    ? null
    : keywordCards[currentKeywordIndex] ?? null;

  const handleCompletePractice = () => {
    if (!isSessionEnded) {
      endSession();
    }

    router.push(`/session/${session.id}/report`);
  };

  return (
    <main
      className="relative min-h-screen w-screen overflow-hidden"
      style={{
        background: "var(--color-background)",
        color: "var(--color-text)",
      }}
    >
      <header className="absolute left-0 right-0 top-0 z-20 grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-4">
        <div className="justify-self-start">
          <Button
            onClick={() => router.push(`/session/${session.id}/prepare`)}
            variant="ghost"
          >
            Prepare
          </Button>
        </div>
        <h1 className="max-w-lg truncate text-center font-heading text-lg font-semibold text-text">
          {session.title}
        </h1>
        <div className="justify-self-end">
          <Button onClick={handleCompletePractice} variant="ghost">
            완료
          </Button>
        </div>
      </header>

      <section className="absolute inset-x-5 bottom-5 top-20 rounded-2xl border border-border bg-surface">
        <div className="flex h-full items-center justify-center">
          {/* P0에서는 실제 카메라 연결 전에 HUD 배치와 안전 영역을 먼저 검증한다. */}
          <div className="max-w-md px-6 text-center">
            <p className="text-lg font-semibold text-text">
              Camera preview will appear here
            </p>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              P0에서는 카메라 연결 전 HUD 구조를 먼저 검증합니다.
            </p>
          </div>
        </div>
      </section>

      <HUDOverlay
        allKeywordsCompleted={allKeywordsCompleted}
        cueLabel="pace · breath"
        currentCard={currentCard}
        currentKeywordIndex={currentKeywordIndex}
        elapsedSec={elapsedSec}
        onNextKeyword={nextKeyword}
        subtitleLabel="..."
        targetDurationMin={session.targetDurationMin}
        title={session.title}
        totalKeywords={keywordCards.length}
      />
    </main>
  );
}

export default PracticeScreen;
