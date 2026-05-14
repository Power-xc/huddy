"use client";

import { useCallback, useRef, useState } from "react";

export type HudSoundCue = "keyword" | "breath" | "milestone" | "complete";

const cueFrequency: Record<HudSoundCue, number> = {
  keyword: 740,
  breath: 560,
  milestone: 660,
  complete: 880,
};

export type UseHudSoundCueResult = {
  isSoundEnabled: boolean;
  playCue: (cue: HudSoundCue) => void;
  toggleSound: () => void;
};

export function useHudSoundCue(): UseHudSoundCueResult {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const contextRef = useRef<AudioContext | null>(null);

  const getContext = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") {
      return null;
    }

    const browserWindow = window as typeof window & {
      webkitAudioContext?: typeof AudioContext;
    };
    const AudioContextClass =
      browserWindow.AudioContext ?? browserWindow.webkitAudioContext;

    if (!AudioContextClass) {
      return null;
    }

    contextRef.current ??= new AudioContextClass();
    return contextRef.current;
  }, []);

  const playCue = useCallback(
    (cue: HudSoundCue) => {
      if (!isSoundEnabled) {
        return;
      }

      const context = getContext();
      if (!context) {
        return;
      }

      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;

      oscillator.frequency.value = cueFrequency[cue];
      oscillator.type = "sine";
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.13);
    },
    [getContext, isSoundEnabled],
  );

  const toggleSound = useCallback(() => {
    setIsSoundEnabled((current) => !current);
  }, []);

  return { isSoundEnabled, playCue, toggleSound };
}
