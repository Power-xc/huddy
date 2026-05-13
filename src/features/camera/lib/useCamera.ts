"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CameraErrorReason, CameraStatus } from "../model/cameraTypes";

export type UseCameraResult = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: CameraStatus;
  errorReason: CameraErrorReason | null;
  errorMessage: string | null;
  isMirrored: boolean;
  isSupported: boolean;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  toggleMirror: () => void;
};

export function useCamera(): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // MediaStream은 렌더링과 무관한 브라우저 리소스라 ref로 보관한다.
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<CameraStatus>("idle");
  const [errorReason, setErrorReason] = useState<CameraErrorReason | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMirrored, setIsMirrored] = useState(true);

  const isSupported =
    typeof navigator !== "undefined" &&
    typeof navigator.mediaDevices !== "undefined" &&
    typeof navigator.mediaDevices.getUserMedia === "function";

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus("idle");
    setErrorReason(null);
    setErrorMessage(null);
  }, []);

  const startCamera = useCallback(async () => {
    if (!isSupported) {
      setStatus("unavailable");
      setErrorReason("not-supported");
      setErrorMessage("이 브라우저는 카메라를 지원하지 않습니다.");
      return;
    }

    setStatus("requesting");
    setErrorReason(null);
    setErrorMessage(null);

    try {
      // 영상만 요청한다 — 오디오 캡처는 P0 범위 밖이다.
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch {
          // autoPlay 속성으로 처리되므로 play() 실패는 무시한다.
        }
      }

      setStatus("ready");
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const name = error.name;

      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setStatus("denied");
        setErrorReason("permission-denied");
        setErrorMessage("카메라 권한이 거부되었습니다.");
      } else if (
        name === "NotFoundError" ||
        name === "DevicesNotFoundError" ||
        name === "OverconstrainedError"
      ) {
        setStatus("unavailable");
        setErrorReason("not-found");
        setErrorMessage("사용 가능한 카메라를 찾을 수 없습니다.");
      } else {
        setStatus("error");
        setErrorReason("unknown");
        setErrorMessage(error.message || "카메라를 시작할 수 없습니다.");
      }
    }
  }, [isSupported]);

  const toggleMirror = useCallback(() => {
    setIsMirrored((prev) => !prev);
  }, []);

  // 언마운트 시 스트림을 반드시 정리해 브라우저 카메라 점유를 해제한다.
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return {
    videoRef,
    status,
    errorReason,
    errorMessage,
    isMirrored,
    isSupported,
    startCamera,
    stopCamera,
    toggleMirror,
  };
}
