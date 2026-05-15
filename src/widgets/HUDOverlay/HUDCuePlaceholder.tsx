import { GlassCard } from "@shared/ui";

export type HUDCuePlaceholderProps = {
  cameraAttentionScore?: number | null;
  mouthMovementScore?: number | null;
  headStabilityScore?: number | null;
  lookDownRatio?: number | null;
  spokenKeywordCount?: number;
  scriptCoverageScore?: number | null;
  pronunciationScore?: number | null;
};

const formatScore = (score: number | null | undefined): string =>
  typeof score === "number" ? `${score}%` : "--";

export function HUDCuePlaceholder({
  cameraAttentionScore,
  mouthMovementScore,
  headStabilityScore,
  lookDownRatio,
  spokenKeywordCount = 0,
  scriptCoverageScore,
  pronunciationScore,
}: HUDCuePlaceholderProps) {
  const cueLabels = [
    `WORDS ${spokenKeywordCount}`,
    `READ ${formatScore(scriptCoverageScore)}`,
    `PRON ${formatScore(pronunciationScore)}`,
    `CAM ${formatScore(cameraAttentionScore)}`,
    `MOUTH ${formatScore(mouthMovementScore)}`,
    `HEAD ${formatScore(headStabilityScore)}`,
    `DOWN ${formatScore(lookDownRatio)}`,
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
