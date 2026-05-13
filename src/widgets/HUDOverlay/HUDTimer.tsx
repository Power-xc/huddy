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
    <GlassCard className="px-4 py-3">
      <p className="text-xs uppercase text-text-secondary">elapsed</p>
      <p
        className="font-mono text-lg font-semibold"
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
