import type React from "react";
import type {
  FaceLandmarker,
  FaceLandmarkerResult,
  NormalizedLandmark,
} from "@mediapipe/tasks-vision";
import type { PracticeSignalSummary } from "@shared/types";

type RegionBox = { x: number; y: number; width: number; height: number };
type Point3 = { x: number; y: number; z: number };
export type MouthLandmarkPoint = { x: number; y: number };
export type MouthShape = {
  outer: MouthLandmarkPoint[];
  inner: MouthLandmarkPoint[];
  opennessScore: number;
  confidence: number;
};

export type RunningStats = {
  samples: number;
  attentionSamples: number;
  attentionHits: number;
  movementSamples: number;
  movementSum: number;
  mouthOpenSamples: number;
  mouthOpenSum: number;
  lookDownSamples: number;
  lookDownHits: number;
  headSamples: number;
  headMovementSum: number;
  previousMouthOpen: number | null;
  previousMouthLight: number | null;
  previousNose: Point3 | null;
  mouthShape: MouthShape | null;
  usedVisionLandmarks: boolean;
  landmarkerFailed: boolean;
};

export type CameraSignalSnapshot = Pick<
  PracticeSignalSummary,
  | "cameraAttentionScore" | "mouthMovementScore" | "mouthOpennessScore"
  | "headStabilityScore" | "lookDownRatio" | "readingPostureRiskScore"
  | "cameraFeedback" | "mouthFeedback" | "postureFeedback" | "readingFeedback"
> & {
  sampleCount: number; isAnalyzing: boolean;
  usedNativeDetector: boolean;
  mouthShape: MouthShape | null;
};

const modelUrl =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task";
const wasmUrl =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";

export const emptySnapshot: CameraSignalSnapshot = {
  sampleCount: 0,
  cameraAttentionScore: null,
  mouthMovementScore: null,
  mouthOpennessScore: null,
  headStabilityScore: null,
  lookDownRatio: null,
  readingPostureRiskScore: null,
  mouthShape: null,
  cameraFeedback: "카메라 분석 대기 중입니다.",
  mouthFeedback: "입 움직임 분석 대기 중입니다.",
  postureFeedback: "자세 신호 분석 대기 중입니다.",
  readingFeedback: "읽는 자세 리스크 분석 대기 중입니다.",
  isAnalyzing: false,
  usedNativeDetector: false,
};

export const createInitialStats = (): RunningStats => ({
  samples: 0, attentionSamples: 0, attentionHits: 0,
  movementSamples: 0, movementSum: 0,
  mouthOpenSamples: 0, mouthOpenSum: 0,
  lookDownSamples: 0, lookDownHits: 0,
  headSamples: 0, headMovementSum: 0,
  previousMouthOpen: null, previousMouthLight: null, previousNose: null,
  mouthShape: null,
  usedVisionLandmarks: false,
  landmarkerFailed: false,
});

const clampScore = (value: number): number => Math.max(0, Math.min(100, Math.round(value)));

const distance = (a: Point3, b: Point3): number => Math.hypot(a.x - b.x, a.y - b.y);

const landmarkAt = (landmarks: NormalizedLandmark[], index: number): NormalizedLandmark | null => landmarks[index] ?? null;

const outerMouthIndices = [
  61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37,
  39, 40, 185,
];
const innerMouthIndices = [
  78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82,
  81, 80, 191,
];

const toMouthPoints = (
  landmarks: NormalizedLandmark[],
  indices: number[],
): MouthLandmarkPoint[] =>
  indices
    .map((index) => landmarkAt(landmarks, index))
    .filter((point): point is NormalizedLandmark => point !== null)
    .map((point) => ({ x: point.x, y: point.y }));

const blendScore = (result: FaceLandmarkerResult, names: string[]): number => {
  const categories = result.faceBlendshapes[0]?.categories ?? [];

  return categories
    .filter((category) => names.includes(category.categoryName))
    .reduce((maxScore, category) => Math.max(maxScore, category.score), 0);
};

const getRegionLight = (
  context: CanvasRenderingContext2D,
  region: RegionBox,
): number => {
  const canvas = context.canvas;
  const x = Math.max(0, Math.min(canvas.width - 1, Math.floor(region.x)));
  const y = Math.max(0, Math.min(canvas.height - 1, Math.floor(region.y)));
  const width = Math.max(1, Math.min(canvas.width - x, Math.floor(region.width)));
  const height = Math.max(
    1,
    Math.min(canvas.height - y, Math.floor(region.height)),
  );
  const image = context.getImageData(x, y, width, height);
  let total = 0;

  for (let index = 0; index < image.data.length; index += 4) {
    total +=
      image.data[index] * 0.2126 +
      image.data[index + 1] * 0.7152 +
      image.data[index + 2] * 0.0722;
  }

  return total / (image.data.length / 4);
};

export const createSnapshot = (
  stats: RunningStats,
  enabled: boolean,
): CameraSignalSnapshot => {
  const cameraAttentionScore =
    stats.attentionSamples > 0
      ? clampScore((stats.attentionHits / stats.attentionSamples) * 100)
      : null;
  const mouthMovementScore =
    stats.movementSamples > 0
      ? clampScore((stats.movementSum / stats.movementSamples) * 100)
      : null;
  const mouthOpennessScore =
    stats.mouthOpenSamples > 0
      ? clampScore((stats.mouthOpenSum / stats.mouthOpenSamples) * 100)
      : null;
  const headStabilityScore =
    stats.headSamples > 0
      ? clampScore(100 - (stats.headMovementSum / stats.headSamples) * 1200)
      : null;
  const lookDownRatio =
    stats.lookDownSamples > 0
      ? clampScore((stats.lookDownHits / stats.lookDownSamples) * 100)
      : null;
  const readingPostureRiskScore =
    cameraAttentionScore === null || lookDownRatio === null
      ? null
      : clampScore(lookDownRatio * 0.55 + (100 - cameraAttentionScore) * 0.3 +
          (headStabilityScore ?? 50) * 0.15);

  return {
    sampleCount: stats.samples,
    cameraAttentionScore,
    mouthMovementScore,
    mouthOpennessScore,
    headStabilityScore,
    lookDownRatio,
    readingPostureRiskScore,
    mouthShape: stats.mouthShape,
    cameraFeedback:
      cameraAttentionScore === null
        ? "영상 신호가 아직 충분하지 않습니다."
        : cameraAttentionScore >= 70
          ? "카메라 방향과 발표 자세가 안정적입니다."
          : "화면 아래나 측면을 보는 시간이 길게 잡힙니다.",
    mouthFeedback:
      mouthMovementScore === null
        ? "입 움직임 데이터가 아직 충분하지 않습니다."
        : mouthMovementScore >= 35
          ? "입 움직임이 충분해 발화가 비교적 분명해 보입니다."
          : "입 움직임이 작게 잡힙니다. 핵심 단어를 더 크게 열어 말해보세요.",
    postureFeedback:
      headStabilityScore === null || lookDownRatio === null
        ? "자세 신호가 아직 충분하지 않습니다."
        : lookDownRatio >= 35
          ? "아래를 보는 시간이 길게 잡힙니다. route cue를 본 뒤 다시 카메라 쪽으로 돌아오세요."
          : headStabilityScore >= 70
            ? "고개 움직임과 화면 중심 유지가 안정적입니다."
            : "고개 움직임이 크게 잡힙니다. 문장 사이에 중심을 다시 잡아보세요.",
    readingFeedback:
      readingPostureRiskScore === null
        ? "읽는 자세 리스크를 아직 계산할 수 없습니다."
        : readingPostureRiskScore >= 60
          ? "대본이나 화면 아래를 오래 보는 패턴이 의심됩니다. 다음 회차는 키워드만 보고 말해보세요."
          : "읽는 자세 리스크가 낮게 잡힙니다.",
    isAnalyzing: enabled && stats.samples > 0,
    usedNativeDetector: stats.usedVisionLandmarks,
  };
};

export const loadLandmarker = async (): Promise<FaceLandmarker> => {
  const vision = await import("@mediapipe/tasks-vision");
  const fileset = await vision.FilesetResolver.forVisionTasks(wasmUrl);

  return vision.FaceLandmarker.createFromOptions(fileset, {
    baseOptions: {
      modelAssetPath: modelUrl,
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numFaces: 1,
    outputFaceBlendshapes: true,
  });
};

export const applyLandmarkSample = (
  result: FaceLandmarkerResult,
  stats: RunningStats,
): boolean => {
  const landmarks = result.faceLandmarks[0];
  if (!landmarks) return false;

  const nose = landmarkAt(landmarks, 1);
  const leftEye = landmarkAt(landmarks, 33);
  const rightEye = landmarkAt(landmarks, 263);
  const upperLip = landmarkAt(landmarks, 13);
  const lowerLip = landmarkAt(landmarks, 14);
  const leftMouth = landmarkAt(landmarks, 61);
  const rightMouth = landmarkAt(landmarks, 291);

  if (nose && leftEye && rightEye) {
    const eyeCenterX = (leftEye.x + rightEye.x) / 2;
    const eyeCenterY = (leftEye.y + rightEye.y) / 2;
    const downScore = blendScore(result, ["eyeLookDownLeft", "eyeLookDownRight"]);
    const sideScore = blendScore(result, [
      "eyeLookInLeft",
      "eyeLookInRight",
      "eyeLookOutLeft",
      "eyeLookOutRight",
    ]);
    const isCentered =
      Math.abs(nose.x - 0.5) < 0.22 &&
      Math.abs(nose.y - 0.5) < 0.28 &&
      Math.abs(nose.x - eyeCenterX) < 0.08 &&
      Math.abs(nose.y - eyeCenterY) < 0.18;

    stats.attentionSamples += 1;
    stats.lookDownSamples += 1;
    if (isCentered && downScore < 0.42 && sideScore < 0.55) {
      stats.attentionHits += 1;
    }
    if (downScore >= 0.42 || nose.y - eyeCenterY > 0.16) {
      stats.lookDownHits += 1;
    }
    if (stats.previousNose) {
      stats.headSamples += 1;
      stats.headMovementSum += distance(nose, stats.previousNose);
    }
    stats.previousNose = { x: nose.x, y: nose.y, z: nose.z };
  }

  if (upperLip && lowerLip && leftMouth && rightMouth) {
    const mouthWidth = Math.max(0.01, distance(leftMouth, rightMouth));
    const mouthOpenRatio = distance(upperLip, lowerLip) / mouthWidth;
    const outer = toMouthPoints(landmarks, outerMouthIndices);
    const inner = toMouthPoints(landmarks, innerMouthIndices);

    stats.mouthOpenSamples += 1;
    stats.mouthOpenSum += Math.min(1, mouthOpenRatio * 4);
    stats.movementSamples += 1;
    stats.movementSum +=
      stats.previousMouthOpen === null
        ? Math.min(1, mouthOpenRatio * 4)
        : Math.min(1, Math.abs(mouthOpenRatio - stats.previousMouthOpen) * 12);
    stats.previousMouthOpen = mouthOpenRatio;

    if (
      outer.length === outerMouthIndices.length &&
      inner.length === innerMouthIndices.length
    ) {
      stats.mouthShape = {
        outer,
        inner,
        opennessScore: clampScore(mouthOpenRatio * 400),
        confidence: 100,
      };
    }
  }

  stats.usedVisionLandmarks = true;
  return true;
};

export const applyFallbackSample = (
  video: HTMLVideoElement,
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
  stats: RunningStats,
): void => {
  const canvas = canvasRef.current ?? document.createElement("canvas");
  canvas.width = 160;
  canvas.height = 120;
  canvasRef.current = canvas;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return;

  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const centerLight = getRegionLight(context, {
    x: canvas.width * 0.28,
    y: canvas.height * 0.18,
    width: canvas.width * 0.44,
    height: canvas.height * 0.46,
  });
  const mouthLight = getRegionLight(context, {
    x: canvas.width * 0.34,
    y: canvas.height * 0.55,
    width: canvas.width * 0.32,
    height: canvas.height * 0.18,
  });

  stats.attentionSamples += 1;
  if (centerLight > 24) stats.attentionHits += 1;
  stats.mouthShape = null;

  if (stats.previousMouthLight !== null) {
    stats.movementSamples += 1;
    stats.movementSum += Math.min(
      1,
      (Math.abs(mouthLight - stats.previousMouthLight) / 255) * 10,
    );
  }

  stats.previousMouthLight = mouthLight;
};
