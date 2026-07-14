import { describe, expect, it } from "vitest";
import {
  createInitialStats,
  createSnapshot,
  type RunningStats,
} from "./cameraSignalAnalysisCore";

describe("createInitialStats", () => {
  it("starts every counter at zero", () => {
    const stats = createInitialStats();

    expect(stats.samples).toBe(0);
    expect(stats.attentionSamples).toBe(0);
    expect(stats.usedVisionLandmarks).toBe(false);
    expect(stats.previousNose).toBeNull();
  });
});

describe("createSnapshot", () => {
  it("returns null scores and a waiting message with no samples", () => {
    const snapshot = createSnapshot(createInitialStats(), false);

    expect(snapshot.cameraAttentionScore).toBeNull();
    expect(snapshot.mouthMovementScore).toBeNull();
    expect(snapshot.readingPostureRiskScore).toBeNull();
    expect(snapshot.isAnalyzing).toBe(false);
    expect(snapshot.usedNativeDetector).toBe(false);
    expect(snapshot.cameraFeedback).toBe("영상 신호가 아직 충분하지 않습니다.");
  });

  it("derives clamped scores from accumulated stats", () => {
    const stats: RunningStats = {
      ...createInitialStats(),
      samples: 10,
      attentionSamples: 10,
      attentionHits: 8,
      movementSamples: 10,
      movementSum: 5,
      mouthOpenSamples: 10,
      mouthOpenSum: 4,
      lookDownSamples: 10,
      lookDownHits: 3,
      headSamples: 10,
      headMovementSum: 0.05,
      usedVisionLandmarks: true,
    };

    const snapshot = createSnapshot(stats, true);

    expect(snapshot.cameraAttentionScore).toBe(80);
    expect(snapshot.mouthMovementScore).toBe(50);
    expect(snapshot.mouthOpennessScore).toBe(40);
    expect(snapshot.headStabilityScore).toBe(94);
    expect(snapshot.lookDownRatio).toBe(30);
    expect(snapshot.readingPostureRiskScore).toBe(37);
    expect(snapshot.isAnalyzing).toBe(true);
    expect(snapshot.usedNativeDetector).toBe(true);
    expect(snapshot.cameraFeedback).toBe(
      "카메라 방향과 발표 자세가 안정적입니다.",
    );
  });
});
