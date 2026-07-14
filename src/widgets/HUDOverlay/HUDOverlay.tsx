import type { BreathSegment, KeywordCard } from "@shared/types";
import { GlassCard } from "@shared/ui";
import { HUDBreathCue } from "./HUDBreathCue";
import { HUDCuePlaceholder } from "./HUDCuePlaceholder";
import { HUDKeywordCard } from "./HUDKeywordCard";
import { HUDSubtitle } from "./HUDSubtitle";
import { HUDTimer } from "./HUDTimer";

export type HUDOverlayProps = {
  title?: string;
  currentKeywordLabel?: string;
  elapsedLabel?: string;
  elapsedSec?: number;
  targetDurationMin?: number;
  subtitleLabel?: string;
  spokenText?: string;
  currentCard?: KeywordCard | null;
  keywordCards?: KeywordCard[];
  currentKeywordIndex?: number;
  totalKeywords?: number;
  onNextKeyword?: () => void;
  allKeywordsCompleted?: boolean;
  isKeywordDetecting?: boolean;
  cameraAttentionScore?: number | null;
  mouthMovementScore?: number | null;
  headStabilityScore?: number | null;
  lookDownRatio?: number | null;
  spokenKeywordCount?: number;
  scriptCoverageScore?: number | null;
  pronunciationScore?: number | null;
  recognitionConfidence?: number | null;
  hudMode?: "keyword" | "breath";
  breathSegments?: BreathSegment[];
  currentBreathCueIndex?: number;
  allBreathCuesCompleted?: boolean;
  onNextBreathCue?: () => void;
};

export function HUDOverlay({
  title,
  currentKeywordLabel = "Current keyword",
  elapsedLabel = "00:00",
  elapsedSec,
  targetDurationMin,
  subtitleLabel = "subtitle placeholder",
  spokenText = "",
  currentCard,
  keywordCards,
  currentKeywordIndex = 0,
  totalKeywords,
  onNextKeyword,
  allKeywordsCompleted = false,
  isKeywordDetecting = false,
  cameraAttentionScore,
  mouthMovementScore,
  headStabilityScore,
  lookDownRatio,
  spokenKeywordCount,
  scriptCoverageScore,
  pronunciationScore,
  recognitionConfidence,
  hudMode,
  breathSegments,
  currentBreathCueIndex = 0,
  allBreathCuesCompleted = false,
  onNextBreathCue,
}: HUDOverlayProps) {
  const shouldRenderKeywordCard =
    Boolean(onNextKeyword) ||
    currentCard !== undefined ||
    totalKeywords !== undefined ||
    allKeywordsCompleted;
  const totalCount = totalKeywords ?? (currentCard ? 1 : 0);
  const cardForDisplay = allKeywordsCompleted ? null : currentCard ?? null;
  const indexForDisplay = allKeywordsCompleted
    ? totalCount
    : currentKeywordIndex;

  const activeBreathSegments = breathSegments ?? [];
  const showBreathMode =
    hudMode === "breath" && activeBreathSegments.length > 0;

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* 컨테이너는 클릭을 통과시키고, 실제 조작이 필요한 HUD 패널만 pointer-events를 되살린다. */}
      <div
        className="pointer-events-auto absolute left-1/2 w-[min(520px,calc(100vw-(var(--hud-safe-x)*2)))] -translate-x-1/2"
        style={{ top: "var(--hud-safe-top)" }}
      >
        {showBreathMode ? (
          <HUDBreathCue
            allCompleted={allBreathCuesCompleted}
            currentIndex={currentBreathCueIndex}
            currentKeywordIndex={currentKeywordIndex}
            keywordCards={keywordCards ?? []}
            onNext={onNextBreathCue ?? (() => undefined)}
            segments={activeBreathSegments}
            spokenText={spokenText}
          />
        ) : shouldRenderKeywordCard ? (
          <HUDKeywordCard
            currentCard={cardForDisplay}
            currentIndex={indexForDisplay}
            isDetecting={isKeywordDetecting}
            onNext={onNextKeyword ?? (() => undefined)}
            totalCount={totalCount}
          />
        ) : (
          <GlassCard className="px-5 py-3 text-center">
            {title && (
              <p className="truncate text-xs text-text-secondary">{title}</p>
            )}
            <p className="truncate text-sm font-semibold text-primary">
              {currentKeywordLabel}
            </p>
          </GlassCard>
        )}
      </div>

      <div
        className="absolute grid gap-2"
        style={{
          bottom: "var(--hud-safe-bottom)",
          left: "var(--hud-safe-x)",
          right: "var(--hud-safe-x)",
        }}
      >
        {!showBreathMode && (
          <div className="mx-auto w-[min(560px,100%)]">
            <HUDSubtitle label={subtitleLabel} />
          </div>
        )}
        <div className="flex items-end justify-between gap-2">
          {elapsedSec === undefined ? (
            <GlassCard className="px-3 py-2 sm:px-4 sm:py-3">
              <p className="font-mono text-base font-semibold text-text sm:text-lg">
                {elapsedLabel}
              </p>
            </GlassCard>
          ) : (
            <HUDTimer
              elapsedSec={elapsedSec}
              targetDurationMin={targetDurationMin}
            />
          )}
          <HUDCuePlaceholder
            cameraAttentionScore={cameraAttentionScore}
            headStabilityScore={headStabilityScore}
            lookDownRatio={lookDownRatio}
            mouthMovementScore={mouthMovementScore}
            pronunciationScore={pronunciationScore}
            recognitionConfidence={recognitionConfidence}
            scriptCoverageScore={scriptCoverageScore}
            spokenKeywordCount={spokenKeywordCount}
          />
        </div>
      </div>
    </div>
  );
}
