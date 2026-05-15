"use client";

import type React from "react";
import type { FaceLandmarker } from "@mediapipe/tasks-vision";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  applyFallbackSample,
  applyLandmarkSample,
  createInitialStats,
  createSnapshot,
  emptySnapshot,
  loadLandmarker,
} from "./cameraSignalAnalysisCore";
import type {
  CameraSignalSnapshot,
  RunningStats,
} from "./cameraSignalAnalysisCore";

export type {
  CameraSignalSnapshot,
  MouthShape,
} from "./cameraSignalAnalysisCore";

export type UseCameraSignalAnalysisResult = {
  snapshot: CameraSignalSnapshot;
  getSummary: () => CameraSignalSnapshot;
};

export function useCameraSignalAnalysis(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  enabled: boolean,
): UseCameraSignalAnalysisResult {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const landmarkerPromiseRef = useRef<Promise<FaceLandmarker> | null>(null);
  const statsRef = useRef<RunningStats>(createInitialStats());
  const isSamplingRef = useRef(false);
  const [snapshot, setSnapshot] = useState<CameraSignalSnapshot>(emptySnapshot);
  const [sampleIntervalMs, setSampleIntervalMs] = useState(300);

  const getLandmarker = useCallback(async () => {
    if (statsRef.current.landmarkerFailed) return null;

    if (!landmarkerPromiseRef.current) {
      landmarkerPromiseRef.current = loadLandmarker();
    }

    try {
      landmarkerRef.current = await landmarkerPromiseRef.current;
      return landmarkerRef.current;
    } catch {
      statsRef.current.landmarkerFailed = true;
      return null;
    }
  }, []);

  const sampleVideo = useCallback(async () => {
    const video = videoRef.current;
    if (
      !enabled ||
      !video ||
      video.readyState < 2 ||
      isSamplingRef.current ||
      document.visibilityState === "hidden"
    ) {
      return;
    }

    isSamplingRef.current = true;

    try {
      const landmarker = await getLandmarker();
      const didUseLandmarks = landmarker
        ? applyLandmarkSample(
            landmarker.detectForVideo(video, performance.now()),
            statsRef.current,
          )
        : false;

      if (!didUseLandmarks) {
        applyFallbackSample(video, canvasRef, statsRef.current);
      }

      statsRef.current.samples += 1;
      setSnapshot(createSnapshot(statsRef.current, enabled));
    } finally {
      isSamplingRef.current = false;
    }
  }, [enabled, getLandmarker, videoRef]);

  useEffect(() => {
    const updateInterval = () => {
      setSampleIntervalMs(
        window.matchMedia("(max-width: 640px)").matches ? 450 : 300,
      );
    };

    updateInterval();

    window.addEventListener("resize", updateInterval);

    return () => window.removeEventListener("resize", updateInterval);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setSnapshot(createSnapshot(statsRef.current, false));
      return;
    }

    const intervalId = window.setInterval(() => {
      void sampleVideo();
    }, sampleIntervalMs);

    return () => window.clearInterval(intervalId);
  }, [enabled, sampleIntervalMs, sampleVideo]);

  useEffect(
    () => () => {
      landmarkerRef.current?.close();
    },
    [],
  );

  const getSummary = useCallback(
    () => createSnapshot(statsRef.current, enabled),
    [enabled],
  );

  return { snapshot, getSummary };
}
