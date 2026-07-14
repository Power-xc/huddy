import { normalizeSpeechText } from "@shared/lib/text";

const areWordsClose = (left: string, right: string): boolean =>
  left === right ||
  (left.length >= 4 && right.length >= 4 &&
    (left.includes(right) || right.includes(left)));

export function detectKeyword(transcript: string, keyword: string): boolean {
  const normalizedTranscript = normalizeSpeechText(transcript);
  const normalizedKeyword = normalizeSpeechText(keyword);

  if (!normalizedTranscript || !normalizedKeyword) {
    return false;
  }

  const transcriptWords = normalizedTranscript.split(" ");
  const keywordWords = normalizedKeyword.split(" ");

  if (keywordWords.length > transcriptWords.length) {
    return false;
  }

  return transcriptWords.some((_, startIndex) =>
    keywordWords.every((keywordWord, keywordIndex) =>
      (transcriptWords[startIndex + keywordIndex] ?? "").includes(keywordWord),
    ),
  );
}

export type PhraseRecognitionProgress = {
  matchedWordIndexes: number[];
  matchedWordCount: number;
  totalWordCount: number;
  isComplete: boolean;
};

export function getPhraseRecognitionProgress(
  transcript: string,
  phrase: string,
): PhraseRecognitionProgress {
  const transcriptWords = normalizeSpeechText(transcript).split(" ").filter(Boolean);
  const phraseWords = normalizeSpeechText(phrase).split(" ").filter(Boolean);

  if (transcriptWords.length === 0 || phraseWords.length === 0) {
    return {
      matchedWordIndexes: [],
      matchedWordCount: 0,
      totalWordCount: phraseWords.length,
      isComplete: false,
    };
  }

  const recentWords = transcriptWords.slice(
    -Math.max(24, phraseWords.length * 3),
  );
  let phraseIndex = 0;
  const matchedWordIndexes: number[] = [];
  let matchedEnding = false;

  recentWords.forEach((spokenWord) => {
    const lookahead = phraseWords
      .slice(phraseIndex, phraseIndex + 3)
      .findIndex((phraseWord) => areWordsClose(phraseWord, spokenWord));

    if (lookahead < 0) {
      return;
    }

    const matchedIndex = phraseIndex + lookahead;
    matchedWordIndexes.push(matchedIndex);
    phraseIndex = matchedIndex + 1;
    matchedEnding = phraseIndex >= phraseWords.length;
  });

  const requiredCoverage = phraseWords.length <= 4 ? 1 : 0.78;
  const matchedWordCount = matchedWordIndexes.length;

  return {
    matchedWordIndexes,
    matchedWordCount,
    totalWordCount: phraseWords.length,
    isComplete:
      matchedWordCount / phraseWords.length >= requiredCoverage &&
      matchedEnding,
  };
}

export function detectPhraseCompletion(
  transcript: string,
  phrase: string,
): boolean {
  return getPhraseRecognitionProgress(transcript, phrase).isComplete;
}
