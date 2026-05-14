import { GlassCard } from "@shared/ui";

export type HUDCuePlaceholderProps = {
  cameraAttentionScore?: number | null;
  mouthMovementScore?: number | null;
  spokenKeywordCount?: number;
};

const formatScore = (score: number | null | undefined): string =>
  typeof score === "number" ? `${score}%` : "--";

export function HUDCuePlaceholder({
  cameraAttentionScore,
  mouthMovementScore,
  spokenKeywordCount = 0,
}: HUDCuePlaceholderProps) {
  const cueLabels = [
    `WORDS ${spokenKeywordCount}`,
    `CAM ${formatScore(cameraAttentionScore)}`,
    `MOUTH ${formatScore(mouthMovementScore)}`,
  ];

  return (
    <GlassCard className="min-w-44 px-4 py-3">
      <p className="text-xs uppercase text-text-muted">live signals</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {cueLabels.map((label) => (
          <span
            className="rounded-full border border-border px-2 py-1 font-mono text-xs text-text-secondary"
            key={label}
          >
            {label}
          </span>
        ))}
      </div>
    </GlassCard>
  );
}
