import type { BreathScript } from "@shared/types";

const maxWordsPerSegment = 12;

const splitSentences = (value: string): string[] =>
  value
    .split(/(?<=[.!?。！？])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

const splitWordsEvenly = (value: string, partCount: number): string[] => {
  if (!value.trim() || partCount <= 0) {
    return Array.from({ length: partCount }, () => "");
  }

  const words = value.trim().split(/\s+/);
  const wordsPerPart = Math.ceil(words.length / partCount);

  return Array.from({ length: partCount }, (_, index) =>
    words.slice(index * wordsPerPart, (index + 1) * wordsPerPart).join(" "),
  );
};

const splitEnglishSentence = (sentence: string): string[] => {
  const words = sentence.trim().split(/\s+/).filter(Boolean);
  const segments: string[] = [];

  for (let index = 0; index < words.length; index += maxWordsPerSegment) {
    segments.push(words.slice(index, index + maxWordsPerSegment).join(" "));
  }

  return segments;
};

const alignTranslationSentences = (
  translationKo: string,
  sentenceCount: number,
): string[] => {
  const sentences = splitSentences(translationKo);

  if (sentences.length === sentenceCount) {
    return sentences;
  }

  return splitWordsEvenly(translationKo, sentenceCount);
};

export const buildBreathScript = (
  scriptText: string,
  translationKo = "",
): BreathScript | null => {
  const englishSentences = splitSentences(scriptText);

  if (englishSentences.length === 0) {
    return null;
  }

  const translationSentences = alignTranslationSentences(
    translationKo,
    englishSentences.length,
  );
  const segments = englishSentences.flatMap((sentence, sentenceIndex) => {
    const englishParts = splitEnglishSentence(sentence);
    const koreanParts = splitWordsEvenly(
      translationSentences[sentenceIndex] ?? "",
      englishParts.length,
    );

    return englishParts.map((text, partIndex) => ({
      id: crypto.randomUUID(),
      text,
      translationKo: koreanParts[partIndex]?.trim() || null,
      isBreathPoint:
        partIndex === englishParts.length - 1 || partIndex % 2 === 1,
    }));
  });

  const firstSegment = segments[0];
  if (firstSegment) {
    firstSegment.isBreathPoint = false;
  }

  return {
    segments,
    fullText: segments.map((segment) => segment.text).join(" / "),
  };
};
