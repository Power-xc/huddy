import type { BreathSegment } from "@shared/types";
import { Button, GlassCard } from "@shared/ui";

export type HUDBreathCueProps = {
  segments: BreathSegment[];
  currentIndex: number;
  allCompleted: boolean;
  onNext: () => void;
};

export function HUDBreathCue({
  segments,
  currentIndex,
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
        <div className="mx-auto mt-2 flex w-40 items-center justify-center gap-1">
          {Array.from({ length: totalCount }, (_, i) => (
            <span
              className={[
                "h-1 rounded-full transition-colors",
                i === currentIndex ? "w-8 bg-primary" : "w-4 bg-border",
              ].join(" ")}
              key={i}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 font-mono text-xs uppercase text-text-secondary">
          NOW
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <p className="font-heading text-xl font-semibold text-primary leading-snug">
            {currentSegment.text}
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
      </div>

      {nextSegment && (
        <div>
          <p className="mb-1 font-mono text-xs uppercase text-text-secondary">
            NEXT
          </p>
          <p className="truncate text-sm text-text-secondary">
            {nextSegment.text}
          </p>
        </div>
      )}

      <div className="flex justify-center">
        <Button onClick={onNext} size="sm" variant="secondary">
          {isLastCue ? "cue 완료" : "다음 cue"}
        </Button>
      </div>
    </GlassCard>
  );
}
