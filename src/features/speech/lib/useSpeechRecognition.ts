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
  startListening: () => void;
  stopListening: () => void;
};

export function useSpeechRecognition(): UseSpeechRecognitionResult {
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);

  const isSupported = getSpeechClass() !== null;

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const shouldListenRef = useRef(false);
  const finalAccRef = useRef("");

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
        if (nonFatal.includes(event.error)) return;
        shouldListenRef.current = false;
        setIsListening(false);
      };

      rec.start();
      setIsListening(true);
    };
  }, []);

  const startListening = useCallback(() => {
    if (shouldListenRef.current) return;
    finalAccRef.current = "";
    setFinalTranscript("");
    setInterimTranscript("");
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
    startListening,
    stopListening,
  };
}
