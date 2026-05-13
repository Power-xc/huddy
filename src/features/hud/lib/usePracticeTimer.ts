"use client";

import { useEffect } from "react";
import { useHUDStore } from "../model/useHUDStore";

export function usePracticeTimer() {
  const hasHUDState = useHUDStore((state) => state.hudState !== null);
  const isRunning = useHUDStore(
    (state) => state.hudState?.isRunning ?? false,
  );
  const isPaused = useHUDStore((state) => state.hudState?.isPaused ?? false);
  const tick = useHUDStore((state) => state.tick);

  useEffect(() => {
    if (!hasHUDState || !isRunning || isPaused) {
      return undefined;
    }

    // 브라우저 타이머는 store 밖의 훅에서 관리해 상태 변경을 예측하고 테스트하기 쉽게 둔다.
    const intervalId = window.setInterval(() => {
      tick();
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [hasHUDState, isPaused, isRunning, tick]);
}
