import { GlassCard } from "@shared/ui";

export type HUDCuePlaceholderProps = {
  cameraAttentionScore?: number | null;
  mouthMovementScore?: number | null;
  headStabilityScore?: number | null;
  lookDownRatio?: number | null;
  spokenKeywordCount?: number;
  scriptCoverageScore?: number | null;
  pronunciationScore?: number | null;
  recognitionConfidence?: number | null;
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
  recognitionConfidence,
}: HUDCuePlaceholderProps) {
  const cueLabels = [
    `WORDS ${spokenKeywordCount}`,
    `MATCH ${formatScore(scriptCoverageScore)}`,
    `VOICE ${formatScore(recognitionConfidence)}`,
    `CLEAR ${formatScore(pronunciationScore)}`,
    `CAM ${formatScore(cameraAttentionScore)}`,
    `MOUTH ${formatScore(mouthMovementScore)}`,
    `HEAD ${formatScore(headStabilityScore)}`,
    `DOWN ${formatScore(lookDownRatio)}`,
  ];

  return (
    <GlassCard className="max-w-[min(58vw,20rem)] px-3 py-2 sm:min-w-44 sm:px-4 sm:py-3">
      <p className="text-[10px] uppercase text-text-muted sm:text-xs">
        live signals
      </p>
      <div className="mt-1 flex max-h-16 flex-wrap justify-end gap-1 overflow-hidden sm:mt-2 sm:max-h-none sm:gap-2">
        {cueLabels.map((label) => (
          <span
            className="rounded-full border border-border px-1.5 py-0.5 font-mono text-[10px] text-text-secondary sm:px-2 sm:py-1 sm:text-xs"
            key={label}
          >
            {label}
          </span>
        ))}
      </div>
    </GlassCard>
  );
}
