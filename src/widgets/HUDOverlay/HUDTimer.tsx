import { formatTime } from "@shared/lib/formatTime";
import { GlassCard } from "@shared/ui";

export type HUDTimerProps = {
  elapsedSec: number;
  targetDurationMin?: number;
};

export function HUDTimer({ elapsedSec, targetDurationMin }: HUDTimerProps) {
  const hasExceededTarget =
    targetDurationMin !== undefined && elapsedSec > targetDurationMin * 60;

  return (
    <GlassCard className="px-3 py-2 sm:px-4 sm:py-3">
      <p className="text-[10px] uppercase text-text-secondary sm:text-xs">
        elapsed
      </p>
      <p
        className="font-mono text-base font-semibold sm:text-lg"
        style={{
          color: hasExceededTarget
            ? "var(--color-warning)"
            : "var(--color-text)",
        }}
      >
        {formatTime(elapsedSec)}
      </p>
    </GlassCard>
  );
}
