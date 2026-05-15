"use client";

import type { MouthShape, UseCameraResult } from "@features/camera";
import { Button } from "@shared/ui";
import { useCallback, useEffect, useMemo, useState } from "react";

type CameraPreviewProps = {
  camera: UseCameraResult;
  className?: string;
  mouthShape?: MouthShape | null;
  mouthMovementScore?: number | null;
};

type VideoMetrics = {
  width: number;
  height: number;
  videoWidth: number;
  videoHeight: number;
};

const clamp = (value: number): number => Math.max(0, Math.min(1000, value));

const toPointString = (points: MouthShape["outer"]): string =>
  points
    .map((point) => `${Math.round(point.x * 1000)},${Math.round(point.y * 1000)}`)
    .join(" ");

const toClosedPointString = (points: MouthShape["outer"]): string => {
  const firstPoint = points[0];

  return firstPoint ? toPointString([...points, firstPoint]) : "";
};

const mapPointToObjectCover = (
  point: MouthShape["outer"][number],
  metrics: VideoMetrics,
  isMirrored: boolean,
): MouthShape["outer"][number] => {
  const scale = Math.max(
    metrics.width / metrics.videoWidth,
    metrics.height / metrics.videoHeight,
  );
  const renderedWidth = metrics.videoWidth * scale;
  const renderedHeight = metrics.videoHeight * scale;
  const offsetX = (metrics.width - renderedWidth) / 2;
  const offsetY = (metrics.height - renderedHeight) / 2;
  const mappedX =
    ((point.x * metrics.videoWidth * scale + offsetX) / metrics.width) * 1000;
  const mappedY =
    ((point.y * metrics.videoHeight * scale + offsetY) / metrics.height) *
    1000;

  return {
    x: clamp(isMirrored ? 1000 - mappedX : mappedX) / 1000,
    y: clamp(mappedY) / 1000,
  };
};

const mapMouthShape = (
  mouthShape: MouthShape,
  metrics: VideoMetrics,
  isMirrored: boolean,
): MouthShape => ({
  ...mouthShape,
  outer: mouthShape.outer.map((point) =>
    mapPointToObjectCover(point, metrics, isMirrored),
  ),
  inner: mouthShape.inner.map((point) =>
    mapPointToObjectCover(point, metrics, isMirrored),
  ),
});

const getMouthBounds = (
  mouthShape: MouthShape,
): { left: number; top: number; width: number; height: number } => {
  const points = [...mouthShape.outer, ...mouthShape.inner];
  const xs = points.map((point) => point.x * 100);
  const ys = points.map((point) => point.y * 100);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const top = Math.min(...ys);
  const bottom = Math.max(...ys);

  return {
    left,
    top,
    width: Math.max(2, right - left),
    height: Math.max(2, bottom - top),
  };
};

function MouthLineOverlay({
  mouthShape,
  isMirrored,
  videoMetrics,
}: {
  mouthShape: MouthShape | null;
  isMirrored: boolean;
  videoMetrics: VideoMetrics | null;
}) {
  const displayShape = useMemo(
    () =>
      mouthShape && videoMetrics
        ? mapMouthShape(mouthShape, videoMetrics, isMirrored)
        : null,
    [isMirrored, mouthShape, videoMetrics],
  );

  if (!displayShape) {
    return null;
  }

  const bounds = getMouthBounds(displayShape);

  return (
    <>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-85"
        preserveAspectRatio="none"
        viewBox="0 0 1000 1000"
      >
        <polyline
          fill="none"
          points={toClosedPointString(displayShape.outer)}
          stroke="rgba(0, 212, 255, 0.72)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
        />
        <polyline
          fill="none"
          points={toClosedPointString(displayShape.inner)}
          stroke="rgba(245, 158, 11, 0.6)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full border border-primary/40 bg-background-deep/45 px-2 py-0.5 font-mono text-[10px] uppercase text-primary backdrop-blur-sm"
        style={{
          left: `${Math.min(92, Math.max(2, bounds.left + bounds.width + 1))}%`,
          top: `${Math.max(2, bounds.top - 2)}%`,
        }}
      >
        lip
      </span>
    </>
  );
}

export function CameraPreview({
  camera,
  className,
  mouthShape = null,
  mouthMovementScore = null,
}: CameraPreviewProps) {
  const {
    videoRef,
    status,
    errorMessage,
    isMirrored,
    startCamera,
    stopCamera,
    toggleMirror,
  } = camera;
  const [videoMetrics, setVideoMetrics] = useState<VideoMetrics | null>(null);

  const updateVideoMetrics = useCallback(() => {
    const video = videoRef.current;

    if (
      !video ||
      video.clientWidth === 0 ||
      video.clientHeight === 0 ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      setVideoMetrics((currentMetrics) =>
        currentMetrics === null ? currentMetrics : null,
      );
      return;
    }

    const nextMetrics = {
      width: video.clientWidth,
      height: video.clientHeight,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
    };

    setVideoMetrics((currentMetrics) =>
      currentMetrics &&
      currentMetrics.width === nextMetrics.width &&
      currentMetrics.height === nextMetrics.height &&
      currentMetrics.videoWidth === nextMetrics.videoWidth &&
      currentMetrics.videoHeight === nextMetrics.videoHeight
        ? currentMetrics
        : nextMetrics,
    );
  }, [videoRef]);

  useEffect(() => {
    if (status !== "ready") {
      return;
    }

    const video = videoRef.current;

    if (!video) {
      return;
    }

    updateVideoMetrics();
    video.addEventListener("loadedmetadata", updateVideoMetrics);
    window.addEventListener("resize", updateVideoMetrics);

    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(updateVideoMetrics);

    observer?.observe(video);

    return () => {
      observer?.disconnect();
      video.removeEventListener("loadedmetadata", updateVideoMetrics);
      window.removeEventListener("resize", updateVideoMetrics);
    };
  }, [status, updateVideoMetrics, videoRef]);

  if (status === "idle") {
    return (
      <div
        className={`flex h-full flex-col items-center justify-center gap-4 ${className ?? ""}`}
      >
        <div className="max-w-md px-6 text-center">
          <p className="text-lg font-semibold text-text-secondary">
            Camera preview area
          </p>
          <p className="mt-3 text-sm leading-6 text-text-muted">
            카메라는 브라우저에서만 켜지며, 영상은 저장되거나 업로드되지
            않습니다.
          </p>
          <p className="mt-2 text-xs uppercase tracking-wide text-primary">
            Speaking signals start after camera is on
          </p>
        </div>
        <Button onClick={() => void startCamera()} variant="secondary">
          카메라 켜기
        </Button>
      </div>
    );
  }

  if (status === "requesting") {
    return (
      <div
        className={`flex h-full items-center justify-center ${className ?? ""}`}
      >
        <p className="text-sm text-text-secondary">
          카메라 권한을 요청하는 중입니다...
        </p>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div
        className={`flex h-full flex-col items-center justify-center gap-4 ${className ?? ""}`}
      >
        <div className="max-w-md px-6 text-center">
          <p className="text-sm leading-6 text-text-secondary">
            카메라 권한이 거부되었습니다. 브라우저 설정에서 권한을
            허용해주세요.
          </p>
        </div>
        <Button onClick={() => void startCamera()} variant="secondary">
          다시 시도
        </Button>
      </div>
    );
  }

  if (status === "unavailable") {
    return (
      <div
        className={`flex h-full items-center justify-center ${className ?? ""}`}
      >
        <p className="max-w-md px-6 text-center text-sm leading-6 text-text-secondary">
          사용 가능한 카메라를 찾을 수 없습니다.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        className={`flex h-full flex-col items-center justify-center gap-4 ${className ?? ""}`}
      >
        <div className="max-w-md px-6 text-center">
          <p className="text-sm leading-6 text-text-secondary">
            {errorMessage ?? "카메라를 시작할 수 없습니다."}
          </p>
        </div>
        <Button onClick={() => void startCamera()} variant="secondary">
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full overflow-hidden ${className ?? ""}`}>
      <video
        autoPlay
        className="h-full w-full object-cover"
        muted
        playsInline
        ref={videoRef}
        style={isMirrored ? { transform: "scaleX(-1)" } : undefined}
      />
      <div className="pointer-events-none absolute inset-4 rounded-3xl border border-primary/20">
        <span className="absolute -left-px -top-px h-10 w-10 rounded-tl-3xl border-l border-t border-primary/70" />
        <span className="absolute -right-px -top-px h-10 w-10 rounded-tr-3xl border-r border-t border-primary/70" />
        <span className="absolute -bottom-px -left-px h-10 w-10 rounded-bl-3xl border-b border-l border-primary/70" />
        <span className="absolute -bottom-px -right-px h-10 w-10 rounded-br-3xl border-b border-r border-primary/70" />
      </div>
      <MouthLineOverlay
        isMirrored={isMirrored}
        mouthShape={mouthShape}
        videoMetrics={videoMetrics}
      />
      <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-border bg-surface/80 px-3 py-2 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span
            className={[
              "h-2 w-2 rounded-full",
              mouthShape ? "animate-pulse bg-primary" : "bg-text-muted",
            ].join(" ")}
          />
          <span className="font-mono text-xs uppercase text-primary">
            {mouthShape ? "Lip line tracking" : "Speaking signals active"}
          </span>
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 flex flex-wrap gap-2">
        {[
          "CAM",
          `MOUTH ${typeof mouthMovementScore === "number" ? `${mouthMovementScore}%` : "--"}`,
          mouthShape ? "LIP ON" : "LIP WAIT",
          "HEAD",
        ].map((label) => (
          <span
            className="rounded-full border border-border bg-surface/75 px-2 py-1 font-mono text-xs text-text-secondary backdrop-blur-md"
            key={label}
          >
            {label}
          </span>
        ))}
      </div>
      <div className="absolute inset-x-3 bottom-3 flex justify-end gap-2 sm:inset-x-auto sm:bottom-4 sm:right-4">
        <Button onClick={stopCamera} size="sm" variant="ghost">
          카메라 끄기
        </Button>
        <Button onClick={toggleMirror} size="sm" variant="ghost">
          좌우 반전
        </Button>
      </div>
    </div>
  );
}

export default CameraPreview;
