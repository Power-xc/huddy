"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useHUDStore, usePracticeTimer } from "@features/hud";
import { useKeywordDetection, useSpeechRecognition } from "@features/speech";
import type { PracticeSession } from "@shared/types";
import { storage } from "@shared/lib/storage";
import { Button, GlassCard } from "@shared/ui";
import { CameraPreview } from "@widgets/CameraPreview";
import { HUDOverlay } from "@widgets/HUDOverlay";

const getSessionId = (id: string | string[] | undefined): string =>
  Array.isArray(id) ? id[0] ?? "" : id ?? "";

export function PracticeScreen() {
  const params = useParams();
  const router = useRouter();
  const sessionId = useMemo(() => getSessionId(params.id), [params.id]);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isKeywordDetecting, setIsKeywordDetecting] = useState(false);
  const [keywordDetectingCardId, setKeywordDetectingCardId] = useState<
    string | null
  >(null);
  const keywordFlashTimeoutRef = useRef<number | null>(null);
  const hudState = useHUDStore((state) => state.hudState);
  const keywordCards = useHUDStore((state) => state.keywordCards);
  const allKeywordsCompleted = useHUDStore(
    (state) => state.allKeywordsCompleted,
  );
  const hudMode = useHUDStore((state) => state.hudMode);
  const currentBreathCueIndex = useHUDStore(
    (state) => state.currentBreathCueIndex,
  );
  const allBreathCuesCompleted = useHUDStore(
    (state) => state.allBreathCuesCompleted,
  );
  const startSession = useHUDStore((state) => state.startSession);
  const nextKeyword = useHUDStore((state) => state.nextKeyword);
  const nextBreathCue = useHUDStore((state) => state.nextBreathCue);
  const setHudMode = useHUDStore((state) => state.setHudMode);
  const endSession = useHUDStore((state) => state.endSession);
  const resetHUD = useHUDStore((state) => state.reset);

  usePracticeTimer();

  const {
    interimTranscript,
    finalTranscript,
    isListening,
    isSupported: isSTTSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition();

  const currentKeywordIndex = hudState?.currentKeywordIndex ?? 0;
  const elapsedSec = hudState?.elapsedSec ?? 0;
  const isSessionEnded = hudState
    ? !hudState.isRunning && !hudState.isPaused
    : false;
  const currentCard = allKeywordsCompleted
    ? null
    : keywordCards[currentKeywordIndex] ?? null;
  const breathSegments = session?.breathScript?.segments ?? [];
  const detectionTranscript = interimTranscript || finalTranscript;
  const detectionKeyword =
    hudMode === "keyword" && !allKeywordsCompleted
      ? (currentCard?.keyword ?? null)
      : null;
  const isCurrentCardDetecting =
    isKeywordDetecting && keywordDetectingCardId === currentCard?.id;

  useKeywordDetection({
    transcript: detectionTranscript,
    keyword: detectionKeyword,
    onDetected: () => {
      if (keywordFlashTimeoutRef.current !== null) {
        window.clearTimeout(keywordFlashTimeoutRef.current);
      }

      setIsKeywordDetecting(true);
      setKeywordDetectingCardId(currentCard?.id ?? null);
      keywordFlashTimeoutRef.current = window.setTimeout(() => {
        setIsKeywordDetecting(false);
        setKeywordDetectingCardId(null);
        nextKeyword();
        keywordFlashTimeoutRef.current = null;
      }, 400);
    },
  });

  const currentBreathSegment =
    hudMode === "breath" && !allBreathCuesCompleted
      ? (breathSegments[currentBreathCueIndex] ?? null)
      : null;

  useKeywordDetection({
    transcript: detectionTranscript,
    keyword: currentBreathSegment?.text ?? null,
    onDetected: () => nextBreathCue(breathSegments.length),
  });

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
        const hasBreathScript =
          (storedSession.breathScript?.segments.length ?? 0) > 0;
        setHudMode(hasBreathScript ? "breath" : "keyword");
      } else {
        resetHUD();
      }

      setIsLoaded(true);
    };

    void loadStoredSession();

    return () => {
      isActive = false;
    };
  }, [resetHUD, sessionId, setHudMode, startSession]);

  useEffect(() => {
    if (!isLoaded || !session || !isSTTSupported) return;
    startListening();
    return () => stopListening();
  }, [isLoaded, isSTTSupported, session, startListening, stopListening]);

  useEffect(() => {
    return () => {
      if (keywordFlashTimeoutRef.current !== null) {
        window.clearTimeout(keywordFlashTimeoutRef.current);
      }
    };
  }, []);

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

  const recentFinal = finalTranscript
    ? finalTranscript.split(" ").slice(-8).join(" ")
    : "";
  const subtitleText = interimTranscript || recentFinal || "...";

  const handleCompletePractice = () => {
    if (!isSessionEnded) {
      endSession();
    }

    if (finalTranscript.trim().length > 0) {
      storage.updateSession(session.id, { transcript: finalTranscript.trim() });
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
        <div className="flex items-center gap-2 justify-self-start">
          <p className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-primary">
            Practice
          </p>
          {isSTTSupported && (
            <span
              className={[
                "h-2 w-2 rounded-full transition-colors",
                isListening ? "bg-primary" : "bg-border",
              ].join(" ")}
              title={isListening ? "마이크 인식 중" : "마이크 대기"}
            />
          )}
        </div>
        <h1 className="max-w-lg truncate text-center font-heading text-lg font-semibold text-text">
          {session.title}
        </h1>
        <div className="justify-self-end">
          <Button onClick={handleCompletePractice} variant="secondary">
            완료하고 리포트
          </Button>
        </div>
      </header>

      <section className="absolute inset-x-5 bottom-5 top-20 overflow-hidden rounded-2xl border border-border bg-surface">
        <CameraPreview className="h-full w-full" />
      </section>

      <HUDOverlay
        allBreathCuesCompleted={allBreathCuesCompleted}
        allKeywordsCompleted={allKeywordsCompleted}
        breathSegments={breathSegments}
        currentBreathCueIndex={currentBreathCueIndex}
        currentCard={currentCard}
        currentKeywordIndex={currentKeywordIndex}
        elapsedSec={elapsedSec}
        hudMode={hudMode}
        isKeywordDetecting={isCurrentCardDetecting}
        onNextBreathCue={() => nextBreathCue(breathSegments.length)}
        onNextKeyword={nextKeyword}
        subtitleLabel={subtitleText}
        targetDurationMin={session.targetDurationMin}
        title={session.title}
        totalKeywords={keywordCards.length}
      />
    </main>
  );
}

export default PracticeScreen;
