import type {
  KeywordCard,
  PracticeSignalSummary,
  SpokenKeywordInsight,
} from "@shared/types";
import { normalizeSpeechText, titleCase } from "@shared/lib/text";
import { detectKeyword } from "./detectKeyword";

const stopWords = new Set([
  "a",
  "about",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "for",
  "from",
  "have",
  "i",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "our",
  "that",
  "the",
  "this",
  "to",
  "today",
  "we",
  "with",
  "you",
]);

const countRouteKeyword = (transcript: string, keyword: string): number => {
  const normalizedTranscript = normalizeSpeechText(transcript);
  const normalizedKeyword = normalizeSpeechText(keyword);

  if (!normalizedTranscript || !normalizedKeyword) {
    return 0;
  }

  const transcriptWords = normalizedTranscript.split(" ");
  const keywordWords = normalizedKeyword.split(" ");

  return transcriptWords.reduce((count, _, startIndex) => {
    const isMatch = keywordWords.every((keywordWord, keywordIndex) =>
      (transcriptWords[startIndex + keywordIndex] ?? "").includes(keywordWord),
    );

    return isMatch ? count + 1 : count;
  }, 0);
};

export function extractSpokenKeywords(
  transcript: string,
  routeCards: KeywordCard[],
): SpokenKeywordInsight[] {
  const normalizedTranscript = normalizeSpeechText(transcript);

  if (!normalizedTranscript) {
    return [];
  }

  const counts = new Map<string, number>();
  const words = normalizedTranscript
    .split(" ")
    .filter((word) => word.length >= 4 && !stopWords.has(word));

  words.forEach((word) => {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  });

  for (let index = 0; index < words.length - 1; index += 1) {
    const phrase = `${words[index]} ${words[index + 1]}`;
    counts.set(phrase, (counts.get(phrase) ?? 0) + 1);
  }

  routeCards.forEach((card) => {
    const routeCount = countRouteKeyword(transcript, card.keyword);
    if (routeCount > 0) {
      counts.set(normalizeSpeechText(card.keyword), routeCount + 2);
    }
  });

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 8)
    .map(([text, count]) => ({
      text: titleCase(text),
      count,
      isRouteKeyword: routeCards.some((card) =>
        detectKeyword(text, card.keyword),
      ),
    }));
}

export function getRouteKeywordProgress(
  transcript: string,
  routeCards: KeywordCard[],
): Pick<
  PracticeSignalSummary,
  "matchedRouteKeywords" | "missedRouteKeywords"
> {
  const matchedRouteKeywords = routeCards
    .filter((card) => detectKeyword(transcript, card.keyword))
    .map((card) => card.keyword);
  const missedRouteKeywords = routeCards
    .filter((card) => !detectKeyword(transcript, card.keyword))
    .map((card) => card.keyword);

  return { matchedRouteKeywords, missedRouteKeywords };
}
