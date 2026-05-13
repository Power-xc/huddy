"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { mockAiCoachAdapter } from "@entities/adapters";
import type { BreathScript, KeywordCard, PracticeSession } from "@shared/types";
import { storage } from "@shared/lib/storage";
import { Button, GlassCard } from "@shared/ui";
import { BreathScriptView } from "@widgets/BreathScriptView";
import { KeywordCardList } from "@widgets/KeywordCardList";

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
  const [keywordCards, setKeywordCards] = useState<KeywordCard[]>([]);
  const [breathScript, setBreathScript] = useState<BreathScript | null>(null);
  const [loading, setLoading] = useState<LoadingAction>(null);

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
    if (!session || memoKo.trim().length === 0) {
      return;
    }

    setLoading("keywords");

    try {
      // 한국어 메모로 생각을 먼저 정리한 뒤 영어 키워드로 압축해야 발표 중 인지 부담이 줄어든다.
      const generatedCards = await mockAiCoachAdapter.generateKeywordCards(
        memoKo,
        session.category,
      );
      const updatedSession = storage.updateSession(session.id, {
        memoKo,
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
      // 전체 대본 대신 키워드 루트를 쓰면 발표자가 화면을 읽지 않고 흐름만 따라갈 수 있다.
      const generatedBreathScript =
        await mockAiCoachAdapter.generateBreathScript(memoKo, keywordCards);
      const updatedSession = storage.updateSession(session.id, {
        memoKo,
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
          <h1 className="font-heading text-4xl font-semibold text-text">
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
              먼저 한국어로 오늘 말하고 싶은 내용을 적어주세요.
            </p>
          </div>
          <label className="grid gap-2">
            <textarea
              className="min-h-52 resize-y rounded-lg border border-border bg-surface px-4 py-3 text-text outline-none transition-colors placeholder:text-text-muted focus:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              maxLength={500}
              onChange={(event) => setMemoKo(event.target.value)}
              placeholder="오늘 발표할 내용을 한국어로 자유롭게 적어주세요"
              value={memoKo}
            />
            <span className="text-right font-mono text-sm text-text-secondary">
              {memoKo.length} / 500
            </span>
          </label>
          <div className="flex justify-end">
            <Button
              disabled={memoKo.trim().length === 0}
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
    </main>
  );
}

export default PrepareScreen;
