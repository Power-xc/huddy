"use client";

import type { UseCameraResult } from "@features/camera";
import { Button } from "@shared/ui";

type CameraPreviewProps = {
  camera: UseCameraResult;
  className?: string;
};

export function CameraPreview({ camera, className }: CameraPreviewProps) {
  const {
    videoRef,
    status,
    errorMessage,
    isMirrored,
    startCamera,
    stopCamera,
    toggleMirror,
  } = camera;

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
      <div className="absolute bottom-4 right-4 flex gap-2">
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
