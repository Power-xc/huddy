"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PracticeSignalSummary } from "@shared/types";

type NativeBox = { x: number; y: number; width: number; height: number };
type NativeDetection = { boundingBox: DOMRectReadOnly };
type NativeDetector = { detect: (source: CanvasImageSource) => Promise<NativeDetection[]> };
type NativeDetectorCtor = new (options?: {
  fastMode?: boolean;
  maxDetectedFaces?: number;
}) => NativeDetector;

type RunningStats = {
  samples: number;
  attentionSamples: number;
  attentionHits: number;
  movementSamples: number;
  movementSum: number;
  previousMouthLight: number | null;
  usedNativeDetector: boolean;
};

export type CameraSignalSnapshot = Pick<
  PracticeSignalSummary,
  "cameraAttentionScore" | "mouthMovementScore" | "cameraFeedback" | "mouthFeedback"
> & {
  sampleCount: number;
  isAnalyzing: boolean;
  usedNativeDetector: boolean;
};

export type UseCameraSignalAnalysisResult = {
  snapshot: CameraSignalSnapshot;
  getSummary: () => CameraSignalSnapshot;
};

const emptySnapshot: CameraSignalSnapshot = {
  sampleCount: 0,
  cameraAttentionScore: null,
  mouthMovementScore: null,
  cameraFeedback: "카메라 분석 대기 중입니다.",
  mouthFeedback: "입 움직임 분석 대기 중입니다.",
  isAnalyzing: false,
  usedNativeDetector: false,
};

const clampScore = (value: number): number =>
  Math.max(0, Math.min(100, Math.round(value)));

const getNativeDetector = (): NativeDetector | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const browserWindow = window as typeof window & {
    FaceDetector?: NativeDetectorCtor;
  };

  return browserWindow.FaceDetector
    ? new browserWindow.FaceDetector({ fastMode: true, maxDetectedFaces: 1 })
    : null;
};

const getRegionLight = (
  context: CanvasRenderingContext2D,
  region: NativeBox,
): number => {
  const canvas = context.canvas;
  const x = Math.max(0, Math.min(canvas.width - 1, Math.floor(region.x)));
  const y = Math.max(0, Math.min(canvas.height - 1, Math.floor(region.y)));
  const width = Math.max(
    1,
    Math.min(canvas.width - x, Math.floor(region.width)),
  );
  const height = Math.max(
    1,
    Math.min(canvas.height - y, Math.floor(region.height)),
  );
  const image = context.getImageData(
    x,
    y,
    width,
    height,
  );
  let total = 0;

  for (let index = 0; index < image.data.length; index += 4) {
    total +=
      image.data[index] * 0.2126 +
      image.data[index + 1] * 0.7152 +
      image.data[index + 2] * 0.0722;
  }

  return total / (image.data.length / 4);
};

const createSnapshot = (
  stats: RunningStats,
  enabled: boolean,
): CameraSignalSnapshot => {
  const cameraAttentionScore =
    stats.attentionSamples > 0
      ? clampScore((stats.attentionHits / stats.attentionSamples) * 100)
      : null;
  const mouthMovementScore =
    stats.movementSamples > 0
      ? clampScore((stats.movementSum / stats.movementSamples) * 2500)
      : null;

  return {
    sampleCount: stats.samples,
    cameraAttentionScore,
    mouthMovementScore,
    cameraFeedback:
      cameraAttentionScore === null
        ? "이 브라우저에서는 시선/카메라 방향 점수가 제한됩니다."
        : cameraAttentionScore >= 70
          ? "카메라 방향 유지가 안정적입니다."
          : "발표 중 아래쪽이나 측면을 보는 시간이 길어 보입니다.",
    mouthFeedback:
      mouthMovementScore === null
        ? "입 움직임 데이터가 아직 충분하지 않습니다."
        : mouthMovementScore >= 45
          ? "입 움직임이 충분해 발화가 비교적 분명해 보입니다."
          : "입 움직임이 작게 잡힙니다. 핵심 단어를 더 크게 열어 말해보세요.",
    isAnalyzing: enabled && stats.samples > 0,
    usedNativeDetector: stats.usedNativeDetector,
  };
};

export function useCameraSignalAnalysis(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  enabled: boolean,
): UseCameraSignalAnalysisResult {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectorRef = useRef<NativeDetector | null>(null);
  const subjectBoxRef = useRef<NativeBox | null>(null);
  const statsRef = useRef<RunningStats>({
    samples: 0,
    attentionSamples: 0,
    attentionHits: 0,
    movementSamples: 0,
    movementSum: 0,
    previousMouthLight: null,
    usedNativeDetector: false,
  });
  const [snapshot, setSnapshot] = useState<CameraSignalSnapshot>(emptySnapshot);

  const sampleVideo = useCallback(async () => {
    const video = videoRef.current;
    if (!enabled || !video || video.readyState < 2) {
      return;
    }

    const canvas = canvasRef.current ?? document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 120;
    canvasRef.current = canvas;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    detectorRef.current ??= getNativeDetector();
    if (detectorRef.current && statsRef.current.samples % 4 === 0) {
      const detections = await detectorRef.current.detect(video).catch(() => []);
      const firstDetection = detections[0];
      if (firstDetection) {
        const box = firstDetection.boundingBox;
        subjectBoxRef.current = {
          x: (box.x / video.videoWidth) * canvas.width,
          y: (box.y / video.videoHeight) * canvas.height,
          width: (box.width / video.videoWidth) * canvas.width,
          height: (box.height / video.videoHeight) * canvas.height,
        };
        statsRef.current.usedNativeDetector = true;
      }
    }

    const subjectBox = subjectBoxRef.current;
    if (subjectBox) {
      const centerX = subjectBox.x + subjectBox.width / 2;
      const centerY = subjectBox.y + subjectBox.height / 2;
      const isCentered =
        Math.abs(centerX - canvas.width / 2) < canvas.width * 0.2 &&
        Math.abs(centerY - canvas.height / 2) < canvas.height * 0.24;

      statsRef.current.attentionSamples += 1;
      if (isCentered) {
        statsRef.current.attentionHits += 1;
      }
    }

    const mouthRegion = subjectBox
      ? {
          x: subjectBox.x + subjectBox.width * 0.28,
          y: subjectBox.y + subjectBox.height * 0.62,
          width: subjectBox.width * 0.44,
          height: subjectBox.height * 0.22,
        }
      : {
          x: canvas.width * 0.34,
          y: canvas.height * 0.55,
          width: canvas.width * 0.32,
          height: canvas.height * 0.18,
        };
    const mouthLight = getRegionLight(context, mouthRegion);
    const previousMouthLight = statsRef.current.previousMouthLight;

    if (previousMouthLight !== null) {
      statsRef.current.movementSamples += 1;
      statsRef.current.movementSum +=
        Math.abs(mouthLight - previousMouthLight) / 255;
    }

    statsRef.current.previousMouthLight = mouthLight;
    statsRef.current.samples += 1;
    setSnapshot(createSnapshot(statsRef.current, enabled));
  }, [enabled, videoRef]);

  useEffect(() => {
    if (!enabled) {
      setSnapshot(createSnapshot(statsRef.current, false));
      return;
    }

    const intervalId = window.setInterval(() => {
      void sampleVideo();
    }, 500);

    return () => window.clearInterval(intervalId);
  }, [enabled, sampleVideo]);

  const getSummary = useCallback(
    () => createSnapshot(statsRef.current, enabled),
    [enabled],
  );

  return { snapshot, getSummary };
}
