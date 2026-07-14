import type { BreathSegment, KeywordCard } from "@shared/types";
import { getPhraseRecognitionProgress } from "@features/speech";
import { Button, GlassCard } from "@shared/ui";

export type HUDBreathCueProps = {
  segments: BreathSegment[];
  currentIndex: number;
  currentKeywordIndex: number;
  keywordCards: KeywordCard[];
  spokenText: string;
  allCompleted: boolean;
  onNext: () => void;
};

export function HUDBreathCue({
  segments,
  currentIndex,
  currentKeywordIndex,
  keywordCards,
  spokenText,
  allCompleted,
  onNext,
}: HUDBreathCueProps) {
  const totalCount = segments.length;
  const currentSegment = allCompleted ? null : (segments[currentIndex] ?? null);
  const nextSegment =
    !allCompleted && currentIndex + 1 < totalCount
      ? (segments[currentIndex + 1] ?? null)
      : null;
  const isLastCue = currentIndex >= totalCount - 1;
  const progress = totalCount > 0 ? ((currentIndex + 1) / totalCount) * 100 : 0;
  const activeKeyword = keywordCards[currentKeywordIndex] ?? null;
  const keywordPageSize = 5;
  const keywordPageStart =
    Math.floor(currentKeywordIndex / keywordPageSize) * keywordPageSize;
  const visibleKeywordCards = keywordCards.slice(
    keywordPageStart,
    keywordPageStart + keywordPageSize,
  );
  const recognitionProgress = currentSegment
    ? getPhraseRecognitionProgress(spokenText, currentSegment.text)
    : null;
  const matchedWordIndexes = new Set(
    recognitionProgress?.matchedWordIndexes ?? [],
  );
  const recentSpokenText = spokenText
    .trim()
    .split(/\s+/)
    .slice(-16)
    .join(" ");

  if (allCompleted || !currentSegment) {
    return (
      <GlassCard className="px-5 py-4 text-center">
        <p className="text-base font-semibold text-text">모든 호흡 cue 완료</p>
        <p className="mt-1 text-sm text-text-secondary">
          발표를 마무리하고 완료 버튼을 눌러주세요.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="grid gap-3 px-5 py-4 text-center">
      <div>
        <p className="font-mono text-xs uppercase text-text-secondary">
          Cue {currentIndex + 1} / {totalCount}
        </p>
        <div className="mx-auto mt-2 h-1 w-48 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {keywordCards.length > 0 && (
        <div className="rounded-lg border border-border bg-background/30 px-3 py-2">
          <p className="font-mono text-[10px] uppercase text-text-muted">
            keyword route {currentKeywordIndex + 1} / {keywordCards.length}
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-1.5">
            {visibleKeywordCards.map((card, index) => {
              const absoluteIndex = keywordPageStart + index;

              return (
                <span
                  className={[
                    "rounded-full border px-2 py-0.5 text-xs transition-colors",
                    absoluteIndex === currentKeywordIndex
                      ? "border-primary bg-primary/10 text-primary"
                      : absoluteIndex < currentKeywordIndex
                        ? "border-border text-text-muted"
                        : "border-border text-text-secondary",
                  ].join(" ")}
                  key={card.id}
                >
                  {card.keyword}
                </span>
              );
            })}
          </div>
          {activeKeyword && (
            <p className="mt-2 text-xs leading-5 text-text-secondary">
              <span className="font-semibold text-primary">
                {activeKeyword.keyword}
              </span>
              <span className="mx-1 text-text-muted">·</span>
              {activeKeyword.hintKo}
            </p>
          )}
        </div>
      )}

      <div>
        <p className="mb-1 font-mono text-xs uppercase text-text-secondary">
          LIVE {recognitionProgress?.matchedWordCount ?? 0} /{" "}
          {recognitionProgress?.totalWordCount ?? 0}
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <p className="font-heading text-xl font-semibold leading-snug">
            {currentSegment.text.split(/\s+/).map((word, index) => (
              <span
                className={
                  matchedWordIndexes.has(index)
                    ? "text-primary"
                    : "text-text-secondary"
                }
                key={`${word}-${index}`}
              >
                {word}{" "}
              </span>
            ))}
          </p>
          {currentSegment.isBreathPoint && (
            <span
              className="rounded-full border border-border-strong px-2 py-0.5 font-mono text-xs"
              style={{ color: "var(--color-accent)" }}
            >
              pause
            </span>
          )}
        </div>
        {currentSegment.translationKo && (
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">
            {currentSegment.translationKo}
          </p>
        )}
        <div className="mx-auto mt-3 max-w-md rounded-lg border border-primary/25 bg-primary/5 px-3 py-2">
          <p className="font-mono text-[10px] uppercase text-primary">
            my voice
          </p>
          <p
            className={[
              "mt-1 truncate text-sm",
              recentSpokenText ? "text-text" : "text-text-muted",
            ].join(" ")}
          >
            {recentSpokenText || "말하면 여기에 실시간으로 표시됩니다."}
          </p>
        </div>
      </div>

      {nextSegment && (
        <div>
          <p className="mb-1 font-mono text-xs uppercase text-text-secondary">
            NEXT
          </p>
          <p className="truncate text-sm text-text-secondary">
            {nextSegment.text}
          </p>
          {nextSegment.translationKo && (
            <p className="mt-1 truncate text-xs text-text-muted">
              {nextSegment.translationKo}
            </p>
          )}
        </div>
      )}

      <div className="flex justify-center">
        <Button onClick={onNext} size="sm" variant="secondary">
          {isLastCue ? "인식 안 되면 cue 완료" : "인식 안 되면 다음 cue"}
        </Button>
      </div>
      <p className="text-[11px] leading-5 text-text-muted">
        문장을 끝까지 말하면 자동 이동 · Space로 직접 이동
      </p>
    </GlassCard>
  );
}
