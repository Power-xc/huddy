"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { aiCoachAdapter, aiCoachMode } from "@entities/adapters";
import { analyzePracticeScript } from "@features/speech";
import {
  memoKoMaxLength,
  scriptTranslationKoMaxLength,
  scriptTextMaxLength,
} from "@shared/config/practiceLimits";
import type { BreathScript, KeywordCard, PracticeSession } from "@shared/types";
import { storage } from "@shared/lib/storage";
import { Button, GlassCard } from "@shared/ui";
import { BreathScriptView } from "@widgets/BreathScriptView";
import { KeywordCardList } from "@widgets/KeywordCardList";
import { ScriptInsightPanel } from "@widgets/ScriptInsightPanel";

type PrepareStep = 1 | 2 | 3;
type LoadingAction = "translate" | "keywords" | "breath" | "start" | null;

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
  const [scriptTranslationKo, setScriptTranslationKo] = useState("");
  const [keywordCards, setKeywordCards] = useState<KeywordCard[]>([]);
  const [breathScript, setBreathScript] = useState<BreathScript | null>(null);
  const [loading, setLoading] = useState<LoadingAction>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
      setScriptTranslationKo(storedSession?.scriptTranslationKo ?? "");
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

  const handleTranslateScript = async () => {
    if (!session || !scriptText.trim()) {
      return;
    }

    setErrorMessage(null);
    setLoading("translate");
    storage.updateSession(session.id, {
      memoKo,
      scriptText,
      scriptTranslationKo,
      scriptAnalysis,
    });

    try {
      const translationKo = await aiCoachAdapter.translateScript(scriptText);
      const updatedSession = storage.updateSession(session.id, {
        scriptTranslationKo: translationKo,
      });

      setScriptTranslationKo(translationKo);
      setSession(updatedSession);
    } catch (error) {
      console.error("Failed to translate script.", error);
      setErrorMessage(
        "AI 번역 모델이 연결되지 않았습니다. 아래 한국어 해석 칸에 직접 입력하면 발표 HUD에 함께 표시됩니다.",
      );
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateKeywords = async () => {
    if (!session || !hasPracticeSource) {
      return;
    }

    setErrorMessage(null);
    setLoading("keywords");
    storage.updateSession(session.id, {
      memoKo,
      scriptText,
      scriptTranslationKo,
      scriptAnalysis,
    });

    try {
      // 메모와 실제 스크립트를 같은 키워드 루트로 압축해야 발표 중 인지 부담이 줄어든다.
      const generatedCards = await aiCoachAdapter.generateKeywordCards(
        memoKo,
        session.category,
        scriptText,
        session.targetDurationMin,
      );
      const updatedSession = storage.updateSession(session.id, {
        memoKo,
        scriptText,
        scriptTranslationKo,
        scriptAnalysis,
        keywordCards: generatedCards,
      });

      setKeywordCards(generatedCards);
      setSession(updatedSession);
      setStep(2);
    } catch (error) {
      console.error("Failed to generate keyword cards.", error);
      setErrorMessage(
        "키워드 카드를 만들지 못했습니다. 입력은 저장했으니 다시 시도해주세요.",
      );
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateBreathScript = async () => {
    if (!session || keywordCards.length === 0) {
      return;
    }

    setErrorMessage(null);
    setLoading("breath");

    try {
      // 스크립트가 있어도 연습 화면에서는 호흡 단위만 보여 읽기 부담을 낮춘다.
      const generatedBreathScript =
        await aiCoachAdapter.generateBreathScript(
          memoKo,
          keywordCards,
          scriptText,
          scriptTranslationKo,
        );
      const updatedSession = storage.updateSession(session.id, {
        memoKo,
        scriptText,
        scriptTranslationKo,
        scriptAnalysis,
        keywordCards,
        breathScript: generatedBreathScript,
      });

      setBreathScript(generatedBreathScript);
      setSession(updatedSession);
      setStep(3);
    } catch (error) {
      console.error("Failed to generate breath script.", error);
      setErrorMessage(
        "호흡 스크립트를 만들지 못했습니다. 키워드는 저장했으니 다시 시도해주세요.",
      );
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
      scriptTranslationKo,
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

      {errorMessage && (
        <div
          className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm leading-6 text-text"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

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
          <div className="grid gap-2">
            <span className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-medium text-text-secondary">
                한국어 해석
              </span>
              <Button
                disabled={!scriptText.trim() || aiCoachMode !== "real"}
                loading={loading === "translate"}
                onClick={() => void handleTranslateScript()}
                size="sm"
                variant="secondary"
              >
                AI로 전체 해석
              </Button>
            </span>
            <textarea
              aria-label="한국어 해석"
              className="min-h-64 resize-y rounded-lg border border-border bg-surface px-4 py-3 text-text outline-none transition-colors placeholder:text-text-muted focus:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              maxLength={scriptTranslationKoMaxLength}
              onChange={(event) => setScriptTranslationKo(event.target.value)}
              placeholder="영어 스크립트의 한국어 해석을 붙여넣거나 직접 입력하세요"
              value={scriptTranslationKo}
            />
            <span className="text-right font-mono text-sm text-text-secondary">
              {scriptTranslationKo.length} / {scriptTranslationKoMaxLength}
            </span>
            <span className="text-sm leading-6 text-text-muted">
              {aiCoachMode === "real"
                ? "AI가 전체 원문을 빠뜨리지 않고 해석합니다. 결과는 직접 수정할 수 있습니다."
                : "현재 로컬 코칭 모드입니다. 직접 입력한 해석도 영어 문장 아래와 발표 HUD에 표시됩니다."}
            </span>
          </div>
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
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button
              onClick={() => {
                setErrorMessage(null);
                setStep(1);
              }}
              variant="secondary"
            >
              내용 수정
            </Button>
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
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button
              onClick={() => {
                setErrorMessage(null);
                setStep(2);
              }}
              variant="secondary"
            >
              키워드 수정
            </Button>
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
