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
  currentCard?: KeywordCard | null;
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
  currentCard,
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
            onNext={onNextBreathCue ?? (() => undefined)}
            segments={activeBreathSegments}
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
        className="absolute"
        style={{
          bottom: "var(--hud-safe-bottom)",
          left: "var(--hud-safe-x)",
        }}
      >
        {elapsedSec === undefined ? (
          <GlassCard className="px-4 py-3">
            <p className="font-mono text-lg font-semibold text-text">
              {elapsedLabel}
            </p>
          </GlassCard>
        ) : (
          <HUDTimer
            elapsedSec={elapsedSec}
            targetDurationMin={targetDurationMin}
          />
        )}
      </div>

      <div
        className="absolute"
        style={{
          bottom: "var(--hud-safe-bottom)",
          right: "var(--hud-safe-x)",
        }}
      >
        <HUDCuePlaceholder
          cameraAttentionScore={cameraAttentionScore}
          headStabilityScore={headStabilityScore}
          lookDownRatio={lookDownRatio}
          mouthMovementScore={mouthMovementScore}
          spokenKeywordCount={spokenKeywordCount}
        />
      </div>

      <div
        className="absolute left-1/2 w-[min(560px,calc(100vw-(var(--hud-safe-x)*2)))] -translate-x-1/2"
        style={{ bottom: "calc(var(--hud-safe-bottom) + 8px)" }}
      >
        <HUDSubtitle label={subtitleLabel} />
      </div>
    </div>
  );
}
