"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCamera, useCameraSignalAnalysis } from "@features/camera";
import { useHUDStore, useHudSoundCue, usePracticeTimer } from "@features/hud";
import { extractSpokenKeywords, useKeywordDetection, useSpeechRecognition, useTranscriptTimeline } from "@features/speech";
import type { PracticeSession } from "@shared/types";
import { storage } from "@shared/lib/storage";
import { Button, GlassCard } from "@shared/ui";
import { CameraPreview } from "@widgets/CameraPreview";
import { HUDOverlay } from "@widgets/HUDOverlay";
import { createPracticeSignals } from "./createPracticeSignals";
import { PracticeHeader } from "./PracticeHeader";
import { useKeywordProgressTracker } from "./useKeywordProgressTracker";

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
  const playedTimerCuesRef = useRef<Set<number>>(new Set());
  const playedListeningCueRef = useRef(false);
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
  const camera = useCamera();
  const cameraSignals = useCameraSignalAnalysis(
    camera.videoRef,
    camera.status === "ready",
  );
  const { isSoundEnabled, playCue, toggleSound } = useHudSoundCue();

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
  const isSessionEnded = hudState ? !hudState.isRunning && !hudState.isPaused : false;
  const currentCard = allKeywordsCompleted ? null : keywordCards[currentKeywordIndex] ?? null;
  const breathSegments = session?.breathScript?.segments ?? [];
  const detectionTranscript = interimTranscript || finalTranscript;
  const liveSpokenKeywordCount = useMemo(() => extractSpokenKeywords(
    detectionTranscript,
    keywordCards,
  ).length, [detectionTranscript, keywordCards]);
  const transcriptTimeline = useTranscriptTimeline({ elapsedSec, finalTranscript, keywordCards });
  const keywordProgress = useKeywordProgressTracker({ currentCard, elapsedSec, onNextKeyword: nextKeyword });
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

      playCue("keyword");
      keywordProgress.recordAutoDetected();
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
    onDetected: () => {
      playCue("breath");
      nextBreathCue(breathSegments.length);
    },
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
    if (isListening && !playedListeningCueRef.current) {
      playCue("milestone");
      playedListeningCueRef.current = true;
    }
  }, [isListening, playCue]);

  useEffect(() => {
    if (!session || elapsedSec <= 0) {
      return;
    }

    const targetSec = session.targetDurationMin * 60;
    [0.5, 0.8, 1].forEach((ratio) => {
      const cueSecond = Math.max(1, Math.round(targetSec * ratio));
      if (elapsedSec >= cueSecond && !playedTimerCuesRef.current.has(cueSecond)) {
        playedTimerCuesRef.current.add(cueSecond);
        playCue("milestone");
      }
    });
  }, [elapsedSec, playCue, session]);

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

    const completionTranscript = [finalTranscript, interimTranscript]
      .filter(Boolean)
      .join(" ")
      .trim();
    const practiceSignals = createPracticeSignals({
      transcript: completionTranscript,
      keywordCards,
      transcriptTimeline: transcriptTimeline.timeline,
      keywordProgress: keywordProgress.getProgress(),
      cameraSnapshot: cameraSignals.getSummary(),
      soundCueEnabled: isSoundEnabled,
    });

    storage.updateSession(session.id, {
      transcript: completionTranscript || null,
      practiceSignals,
    });

    playCue("complete");

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
      <PracticeHeader
        isListening={isListening}
        isSoundEnabled={isSoundEnabled}
        isSTTSupported={isSTTSupported}
        onComplete={handleCompletePractice}
        onToggleSound={toggleSound}
        title={session.title}
      />

      <section className="absolute inset-x-5 bottom-5 top-20 overflow-hidden rounded-2xl border border-border bg-surface">
        <CameraPreview camera={camera} className="h-full w-full" />
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
        cameraAttentionScore={cameraSignals.snapshot.cameraAttentionScore}
        mouthMovementScore={cameraSignals.snapshot.mouthMovementScore}
        onNextBreathCue={() => nextBreathCue(breathSegments.length)}
        onNextKeyword={keywordProgress.advanceManually}
        spokenKeywordCount={liveSpokenKeywordCount}
        subtitleLabel={subtitleText}
        targetDurationMin={session.targetDurationMin}
        title={session.title}
        totalKeywords={keywordCards.length}
      />
    </main>
  );
}
