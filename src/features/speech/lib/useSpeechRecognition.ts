"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechAlternative = { readonly transcript: string; readonly confidence: number };

type SpeechResult = {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechAlternative;
};

type SpeechResultList = {
  readonly length: number;
  [index: number]: SpeechResult;
};

type SpeechResultEvent = Event & {
  readonly resultIndex: number;
  readonly results: SpeechResultList;
};

type SpeechErrorEvent = Event & { readonly error: string };

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechErrorEvent) => void) | null;
  start: () => void;
  abort: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

const getSpeechClass = (): SpeechRecognitionCtor | null => {
  if (typeof window === "undefined") return null;
  const w = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

export type UseSpeechRecognitionResult = {
  interimTranscript: string;
  finalTranscript: string;
  isListening: boolean;
  isSupported: boolean;
  recognitionConfidence: number | null;
  recognitionError: string | null;
  startListening: () => void;
  stopListening: () => void;
};

export function useSpeechRecognition(): UseSpeechRecognitionResult {
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognitionConfidence, setRecognitionConfidence] = useState<
    number | null
  >(null);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  const isSupported = getSpeechClass() !== null;

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const shouldListenRef = useRef(false);
  const finalAccRef = useRef("");
  const confidenceTotalRef = useRef(0);
  const confidenceWeightRef = useRef(0);

  // Stored in a ref so onend can call it without the hook referencing itself
  const buildAndStartRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    buildAndStartRef.current = () => {
      const Cls = getSpeechClass();
      if (!Cls) return;

      const rec = new Cls();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      rec.maxAlternatives = 3;
      recognitionRef.current = rec;

      rec.onresult = (event: SpeechResultEvent) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (!result) continue;
          const text = result[0]?.transcript ?? "";
          if (result.isFinal) {
            finalAccRef.current = (finalAccRef.current + " " + text).trim();
            setFinalTranscript(finalAccRef.current);
            const confidence = result[0]?.confidence ?? 0;
            const weight = Math.max(1, text.trim().split(/\s+/).length);

            if (confidence > 0) {
              confidenceTotalRef.current += confidence * weight;
              confidenceWeightRef.current += weight;
              setRecognitionConfidence(
                Math.round(
                  (confidenceTotalRef.current /
                    confidenceWeightRef.current) *
                    100,
                ),
              );
            }
          } else {
            interim += text;
          }
        }
        setInterimTranscript(interim);
      };

      rec.onend = () => {
        setInterimTranscript("");
        if (shouldListenRef.current) {
          buildAndStartRef.current();
        } else {
          setIsListening(false);
        }
      };

      rec.onerror = (event: SpeechErrorEvent) => {
        const nonFatal = ["no-speech", "aborted"];
        if (nonFatal.includes(event.error)) {
          if (event.error === "no-speech") {
            setRecognitionError("음성이 감지되지 않았습니다. 마이크와 주변 소음을 확인해주세요.");
          }
          return;
        }
        const errorMessages: Record<string, string> = {
          "audio-capture": "사용 가능한 마이크를 찾을 수 없습니다.",
          "not-allowed": "마이크 권한이 거부되었습니다.",
          network: "음성 인식 네트워크에 연결할 수 없습니다.",
          service: "브라우저 음성 인식 서비스를 사용할 수 없습니다.",
        };

        setRecognitionError(
          errorMessages[event.error] ?? "음성 인식을 계속할 수 없습니다.",
        );
        shouldListenRef.current = false;
        setIsListening(false);
      };

      try {
        rec.start();
        setRecognitionError(null);
        setIsListening(true);
      } catch {
        shouldListenRef.current = false;
        setRecognitionError("음성 인식을 시작할 수 없습니다. 페이지를 새로고침해주세요.");
        setIsListening(false);
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (shouldListenRef.current) return;
    finalAccRef.current = "";
    setFinalTranscript("");
    setInterimTranscript("");
    setRecognitionConfidence(null);
    setRecognitionError(null);
    confidenceTotalRef.current = 0;
    confidenceWeightRef.current = 0;
    shouldListenRef.current = true;
    buildAndStartRef.current();
  }, []);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setIsListening(false);
    setInterimTranscript("");
  }, []);

  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      recognitionRef.current?.abort();
    };
  }, []);

  return {
    interimTranscript,
    finalTranscript,
    isListening,
    isSupported,
    recognitionConfidence,
    recognitionError,
    startListening,
    stopListening,
  };
}
