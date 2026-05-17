"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { aiCoachAdapter } from "@entities/adapters";
import { analyzePracticeScript } from "@features/speech";
import {
  memoKoMaxLength,
  scriptTextMaxLength,
} from "@shared/config/practiceLimits";
import type { BreathScript, KeywordCard, PracticeSession } from "@shared/types";
import { storage } from "@shared/lib/storage";
import { Button, GlassCard } from "@shared/ui";
import { BreathScriptView } from "@widgets/BreathScriptView";
import { KeywordCardList } from "@widgets/KeywordCardList";
import { ScriptInsightPanel } from "@widgets/ScriptInsightPanel";

type PrepareStep = 1 | 2 | 3;
type LoadingAction = "keywords" | "breath" | "start" | null;

const stepItems: Array<{ step: PrepareStep; label: string }> = [
  { step: 1, label: "생각 정리" },
  { step: 2, label: "키워드 루트" },
  { step: 3, label: "호흡 포인트" },
];

const getSessionId = (id: string | string[] | undefined): string =>
  Array.isArray(id) ? id[0] ?? "" : id ?? "";

const stepClassName = (isActive: boolean) =>
  [
    "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
    isActive
      ? "border-primary text-primary"
      : "border-border text-text-secondary",
  ].join(" ");

export function PrepareScreen() {
  const params = useParams();
  const router = useRouter();
  const sessionId = useMemo(() => getSessionId(params.id), [params.id]);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [step, setStep] = useState<PrepareStep>(1);
  const [memoKo, setMemoKo] = useState("");
  const [scriptText, setScriptText] = useState("");
  const [keywordCards, setKeywordCards] = useState<KeywordCard[]>([]);
  const [breathScript, setBreathScript] = useState<BreathScript | null>(null);
  const [loading, setLoading] = useState<LoadingAction>(null);
  const scriptAnalysis = useMemo(
    () => analyzePracticeScript(scriptText),
    [scriptText],
  );
  const hasPracticeSource =
    memoKo.trim().length > 0 || scriptText.trim().length > 0;

  useEffect(() => {
    let isActive = true;

    const loadStoredSession = async () => {
      await Promise.resolve();

      if (!isActive) {
        return;
      }

      const storedSession = storage.getSession(sessionId);

      setSession(storedSession);
      setMemoKo(storedSession?.memoKo ?? "");
      setScriptText(storedSession?.scriptText ?? "");
      setKeywordCards(storedSession?.keywordCards ?? []);
      setBreathScript(storedSession?.breathScript ?? null);
      setStep(
        storedSession?.breathScript
          ? 3
          : storedSession?.keywordCards.length
            ? 2
            : 1,
      );
      setIsLoaded(true);
    };

    void loadStoredSession();

    return () => {
      isActive = false;
    };
  }, [sessionId]);

  const handleGenerateKeywords = async () => {
    if (!session || !hasPracticeSource) {
      return;
    }

    setLoading("keywords");

    try {
      // 메모와 실제 스크립트를 같은 키워드 루트로 압축해야 발표 중 인지 부담이 줄어든다.
      const generatedCards = await aiCoachAdapter.generateKeywordCards(
        memoKo,
        session.category,
        scriptText,
      );
      const updatedSession = storage.updateSession(session.id, {
        memoKo,
        scriptText,
        scriptAnalysis,
        keywordCards: generatedCards,
      });

      setKeywordCards(generatedCards);
      setSession(updatedSession);
      setStep(2);
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateBreathScript = async () => {
    if (!session || keywordCards.length === 0) {
      return;
    }

    setLoading("breath");

    try {
      // 스크립트가 있어도 연습 화면에서는 호흡 단위만 보여 읽기 부담을 낮춘다.
      const generatedBreathScript =
        await aiCoachAdapter.generateBreathScript(
          memoKo,
          keywordCards,
          scriptText,
        );
      const updatedSession = storage.updateSession(session.id, {
        memoKo,
        scriptText,
        scriptAnalysis,
        keywordCards,
        breathScript: generatedBreathScript,
      });

      setBreathScript(generatedBreathScript);
      setSession(updatedSession);
      setStep(3);
    } finally {
      setLoading(null);
    }
  };

  const handleStartPractice = () => {
    if (!session || !breathScript) {
      return;
    }

    setLoading("start");
    // Practice Room 진입 전에는 호흡 위치를 검토만 하고, 실제 진행 제어는 다음 화면에서 맡는다.
    storage.updateSession(session.id, {
      memoKo,
      scriptText,
      scriptAnalysis,
      keywordCards,
      breathScript,
      status: "prepared",
    });
    router.push(`/session/${session.id}/practice`);
  };

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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-5 py-8 sm:px-8 lg:py-12">
      <header className="flex flex-col gap-4">
        <p className="text-sm font-medium text-primary">Prepare</p>
        <div>
          <h1 className="font-heading text-3xl font-semibold text-text sm:text-4xl">
            {session.title}
          </h1>
          <p className="mt-2 text-text-secondary">
            발표 전에 생각, 키워드, 호흡 포인트를 차례로 정리합니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {stepItems.map((item) => (
            <span
              className={stepClassName(item.step === step)}
              key={item.step}
            >
              Step {item.step} / 3 · {item.label}
            </span>
          ))}
        </div>
      </header>

      {step === 1 && (
        <GlassCard className="grid gap-5 p-6">
          <div>
            <h2 className="text-2xl font-semibold text-text">생각 정리</h2>
            <p className="mt-2 text-text-secondary">
              한국어 메모나 실제로 읽을 영어 스크립트를 적어주세요.
            </p>
          </div>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-text-secondary">
              Korean memo
            </span>
            <textarea
              className="min-h-52 resize-y rounded-lg border border-border bg-surface px-4 py-3 text-text outline-none transition-colors placeholder:text-text-muted focus:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              maxLength={memoKoMaxLength}
              onChange={(event) => setMemoKo(event.target.value)}
              placeholder="오늘 발표할 내용을 한국어로 자유롭게 적어주세요"
              value={memoKo}
            />
            <span className="text-right font-mono text-sm text-text-secondary">
              {memoKo.length} / {memoKoMaxLength}
            </span>
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-text-secondary">
              English script
            </span>
            <textarea
              className="min-h-64 resize-y rounded-lg border border-border bg-surface px-4 py-3 text-text outline-none transition-colors placeholder:text-text-muted focus:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              maxLength={scriptTextMaxLength}
              onChange={(event) => setScriptText(event.target.value)}
              placeholder="실제로 읽고 싶은 영어 발표 스크립트를 붙여넣으세요"
              value={scriptText}
            />
            <span className="text-right font-mono text-sm text-text-secondary">
              {scriptText.length} / {scriptTextMaxLength}
            </span>
          </label>
          <div className="rounded-lg border border-border bg-surface/60 px-4 py-3 text-sm leading-6 text-text-secondary">
            카메라 영상과 원본 오디오는 저장하지 않습니다. 마이크 자막은
            브라우저 음성 인식 결과만 세션 리포트에 남깁니다.
          </div>
          <div className="flex justify-end">
            <Button
              disabled={!hasPracticeSource}
              loading={loading === "keywords"}
              onClick={handleGenerateKeywords}
            >
              키워드 카드 생성
            </Button>
          </div>
        </GlassCard>
      )}

      {step === 2 && (
        <GlassCard className="grid gap-5 p-6">
          <div>
            <h2 className="text-2xl font-semibold text-text">
              키워드 루트 확인
            </h2>
            <p className="mt-2 text-text-secondary">
              대본 대신 이 키워드들을 따라 발표합니다.
            </p>
          </div>
          <KeywordCardList cards={keywordCards} onChange={setKeywordCards} />
          <div className="flex justify-end">
            <Button
              disabled={keywordCards.length === 0}
              loading={loading === "breath"}
              onClick={handleGenerateBreathScript}
            >
              Breath Script 보기
            </Button>
          </div>
        </GlassCard>
      )}

      {step === 3 && (
        <GlassCard className="grid gap-5 p-6">
          <div>
            <h2 className="text-2xl font-semibold text-text">
              호흡 포인트 확인
            </h2>
            <p className="mt-2 text-text-secondary">
              슬래시 위치에서 짧게 쉬면서 발표 흐름을 잡습니다.
            </p>
          </div>
          {breathScript ? (
            <BreathScriptView breathScript={breathScript} />
          ) : (
            <p className="text-text-secondary">
              아직 생성된 Breath Script가 없습니다.
            </p>
          )}
          <div className="flex justify-end">
            <Button
              disabled={!breathScript}
              loading={loading === "start"}
              onClick={handleStartPractice}
            >
              발표 시작
            </Button>
          </div>
        </GlassCard>
      )}

      {scriptAnalysis && <ScriptInsightPanel analysis={scriptAnalysis} />}
    </main>
  );
}

export default PrepareScreen;
