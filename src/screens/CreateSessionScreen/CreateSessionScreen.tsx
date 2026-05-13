"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import type {
  FocusArea,
  PracticeSession,
  PracticeSessionCategory,
  PresentationMode,
} from "@shared/types";
import { Button, GlassCard } from "@shared/ui";
import { createPracticeSession } from "@shared/lib/createPracticeSession";
import { storage } from "@shared/lib/storage";

type Option<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

type TargetDurationMin = PracticeSession["targetDurationMin"];

const categoryOptions: Array<Option<PracticeSessionCategory>> = [
  { value: "work", label: "work", description: "업무 발표" },
  { value: "study", label: "study", description: "학습 발표" },
  { value: "life", label: "life", description: "일상 주제" },
  { value: "custom", label: "custom", description: "직접 구성" },
];

const modeOptions: Array<Option<PresentationMode>> = [
  { value: "script", label: "script" },
  { value: "breath", label: "breath" },
  { value: "keyword", label: "keyword" },
  { value: "no-script", label: "no-script" },
];

const focusOptions: Array<Option<FocusArea>> = [
  { value: "breathing", label: "breathing" },
  { value: "confidence", label: "confidence" },
  { value: "pronunciation", label: "pronunciation" },
  { value: "flow", label: "flow" },
  { value: "eye-contact", label: "eye-contact" },
];

const durationOptions: TargetDurationMin[] = [1, 3, 5, 10];

const joinClassNames = (
  ...classNames: Array<string | false | null | undefined>
) => classNames.filter(Boolean).join(" ");

const optionClassName = (isSelected: boolean) =>
  joinClassNames(
    "rounded-lg border px-4 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
    isSelected
      ? "border-primary bg-surface-hover text-text"
      : "border-border bg-surface text-text-secondary hover:border-primary hover:text-text",
  );

export function CreateSessionScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<PracticeSessionCategory>("work");
  const [mode, setMode] = useState<PresentationMode>("keyword");
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>(["flow"]);
  const [targetDurationMin, setTargetDurationMin] =
    useState<TargetDurationMin>(3);
  const isSubmitDisabled = title.trim().length === 0;

  const toggleFocusArea = (focusArea: FocusArea) => {
    setFocusAreas((currentFocusAreas) =>
      currentFocusAreas.includes(focusArea)
        ? currentFocusAreas.filter((item) => item !== focusArea)
        : [...currentFocusAreas, focusArea],
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitDisabled) {
      return;
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const config = storage.getConfig();
    // Prepare 단계에서 메모와 AI 초안을 채우기 위해 여기서는 발표 세션의 기본 구조만 저장한다.
    const practiceSession = createPracticeSession({
      id,
      title,
      category,
      mode,
      focusAreas,
      targetDurationMin,
      weekNumber: config.currentWeek,
      createdAt: now,
      updatedAt: now,
    });

    storage.saveSession(practiceSession);
    router.push(`/session/${id}/prepare`);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-5 py-8 sm:px-8 lg:py-12">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-medium text-primary">Create Session</p>
        <h1 className="font-heading text-4xl font-semibold text-text">
          새 발표 세션
        </h1>
        <p className="text-text-secondary">
          오늘 연습할 주제를 고르고, 영어 발표 루트를 준비합니다.
        </p>
      </header>

      <form className="grid gap-6" onSubmit={handleSubmit}>
        <GlassCard className="grid gap-5 p-6">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-text-secondary">
              Session title
            </span>
            <input
              className="min-h-12 rounded-lg border border-border bg-surface px-4 text-text outline-none transition-colors placeholder:text-text-muted focus:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="오늘 발표 토픽을 입력하세요"
              type="text"
              value={title}
            />
          </label>
        </GlassCard>

        <GlassCard className="grid gap-5 p-6">
          <div>
            <h2 className="text-xl font-semibold text-text">Category</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {categoryOptions.map((option) => (
                <button
                  className={optionClassName(option.value === category)}
                  key={option.value}
                  onClick={() => setCategory(option.value)}
                  type="button"
                >
                  <span className="block font-semibold">{option.label}</span>
                  <span className="mt-1 block text-sm text-text-secondary">
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-text">
              Presentation mode
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {modeOptions.map((option) => (
                <button
                  className={optionClassName(option.value === mode)}
                  key={option.value}
                  onClick={() => setMode(option.value)}
                  type="button"
                >
                  <span className="font-semibold">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="grid gap-5 p-6">
          <div>
            <h2 className="text-xl font-semibold text-text">Focus areas</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {focusOptions.map((option) => (
                <button
                  className={optionClassName(focusAreas.includes(option.value))}
                  key={option.value}
                  onClick={() => toggleFocusArea(option.value)}
                  type="button"
                >
                  <span className="font-semibold">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-text">Target duration</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              {durationOptions.map((durationMin) => (
                <button
                  className={optionClassName(
                    targetDurationMin === durationMin,
                  )}
                  key={durationMin}
                  onClick={() => setTargetDurationMin(durationMin)}
                  type="button"
                >
                  <span className="font-mono text-lg font-semibold">
                    {durationMin}
                  </span>
                  <span className="ml-1 text-sm text-text-secondary">min</span>
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        <div className="flex justify-end">
          <Button disabled={isSubmitDisabled} size="lg" type="submit">
            준비하기
          </Button>
        </div>
      </form>
    </main>
  );
}

export default CreateSessionScreen;
