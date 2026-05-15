import type {
  PracticeScriptAnalysis,
  ScriptKeywordInsight,
  ScriptReadAloudAssessment,
  ScriptReadabilityInsight,
  ScriptVocabularyInsight,
  ScriptVocabularyRisk,
} from "@shared/types";

const stopWords = new Set([
  "a",
  "about",
  "after",
  "all",
  "also",
  "am",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "because",
  "but",
  "by",
  "can",
  "for",
  "from",
  "have",
  "i",
  "if",
  "in",
  "is",
  "it",
  "its",
  "my",
  "of",
  "on",
  "or",
  "our",
  "so",
  "that",
  "the",
  "this",
  "to",
  "today",
  "was",
  "we",
  "with",
  "you",
  "your",
]);

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const tokenize = (value: string): string[] =>
  (value.toLowerCase().match(/[a-z]+/g) ?? []).filter(Boolean);

const titleCase = (value: string): string =>
  value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const isContentWord = (word: string): boolean =>
  word.length >= 4 && !stopWords.has(word);

const countItems = (items: string[]): Map<string, number> => {
  const counts = new Map<string, number>();

  items.forEach((item) => {
    counts.set(item, (counts.get(item) ?? 0) + 1);
  });

  return counts;
};

const buildPhraseCounts = (words: string[]): Map<string, number> => {
  const phrases: string[] = [];

  for (let index = 0; index < words.length - 1; index += 1) {
    const pair = words.slice(index, index + 2);
    if (pair.every(isContentWord)) {
      phrases.push(pair.join(" "));
    }
  }

  for (let index = 0; index < words.length - 2; index += 1) {
    const trio = words.slice(index, index + 3);
    if (trio.filter(isContentWord).length >= 2 && isContentWord(trio[0])) {
      phrases.push(trio.join(" "));
    }
  }

  return countItems(phrases);
};

const buildKeywords = (words: string[]): ScriptKeywordInsight[] => {
  const contentWords = words.filter(isContentWord);
  const wordCounts = countItems(contentWords);
  const phraseCounts = buildPhraseCounts(words);
  const phraseCandidates = [...phraseCounts.entries()].map(
    ([term, count]) => ({
      term,
      count,
      kind: "phrase" as const,
      score: count * 7 + term.split(" ").length * 2,
    }),
  );
  const wordCandidates = [...wordCounts.entries()].map(([term, count]) => ({
    term,
    count,
    kind: "word" as const,
    score: count * 5 + (term.length >= 8 ? 2 : 0),
  }));
  const selectedTerms = new Set<string>();

  return [...phraseCandidates, ...wordCandidates]
    .sort((left, right) => right.score - left.score || right.term.length - left.term.length)
    .filter((candidate) => {
      if (selectedTerms.has(candidate.term)) {
        return false;
      }

      if (
        candidate.kind === "word" &&
        [...selectedTerms].some((term) => term.split(" ").includes(candidate.term))
      ) {
        return false;
      }

      selectedTerms.add(candidate.term);
      return true;
    })
    .slice(0, 8)
    .map((candidate) => ({
      term: titleCase(candidate.term),
      count: candidate.count,
      kind: candidate.kind,
      reasonKo:
        candidate.kind === "phrase"
          ? "스크립트 흐름을 잡는 표현"
          : candidate.count >= 2
            ? "반복 등장하는 핵심 단어"
            : "내용 전달에 중요한 단어",
    }));
};

const getVocabularyRisk = (
  word: string,
): Pick<ScriptVocabularyInsight, "risk" | "tipKo"> => {
  if (word.includes("th")) {
    return { risk: "high", tipKo: "th는 혀끝을 살짝 내고 공기를 빼세요." };
  }

  if (/(tion|sion|cian)$/.test(word)) {
    return { risk: "medium", tipKo: "끝소리를 shun처럼 가볍게 줄이세요." };
  }

  if (/[rl]/.test(word) && /[vw]/.test(word)) {
    return { risk: "medium", tipKo: "r/l 위치와 v/w 입모양을 분리하세요." };
  }

  if (/[vw]/.test(word)) {
    return { risk: "medium", tipKo: "v는 윗니를 아랫입술에 가볍게 대세요." };
  }

  if (/[rl]/.test(word)) {
    return { risk: "medium", tipKo: "r은 혀를 말고, l은 혀끝을 올리세요." };
  }

  if (word.length >= 10) {
    return { risk: "medium", tipKo: "긴 단어는 두 박자로 나눠 읽으세요." };
  }

  return { risk: "low", tipKo: "강세를 앞뒤 문장 리듬에 맞추세요." };
};

const riskWeight: Record<ScriptVocabularyRisk, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

const buildVocabulary = (words: string[]): ScriptVocabularyInsight[] =>
  [...countItems(words.filter((word) => isContentWord(word) && word.length >= 6)).entries()]
    .map(([word, count]) => ({
      word,
      count,
      ...getVocabularyRisk(word),
    }))
    .sort(
      (left, right) =>
        riskWeight[right.risk] - riskWeight[left.risk] ||
        right.count - left.count ||
        right.word.length - left.word.length,
    )
    .slice(0, 8)
    .map((item) => ({
      ...item,
      word: titleCase(item.word),
    }));

const countSentenceWords = (sentence: string): number => tokenize(sentence).length;

const buildReadability = (
  scriptText: string,
  words: string[],
): ScriptReadabilityInsight => {
  const sentences = scriptText
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const sentenceCount = Math.max(1, sentences.length);
  const wordCount = words.length;
  const avgWordsPerSentence =
    sentenceCount > 0 ? Math.round((wordCount / sentenceCount) * 10) / 10 : 0;
  const longSentenceCount = sentences.filter(
    (sentence) => countSentenceWords(sentence) > 22,
  ).length;
  const score =
    wordCount === 0
      ? 0
      : clamp(
          Math.round(
            100 -
              longSentenceCount * 10 -
              Math.max(0, avgWordsPerSentence - 18) * 3 -
              (wordCount > 220 ? 8 : 0),
          ),
          45,
          100,
        );
  const feedbackKo =
    score >= 85
      ? "문장 길이가 안정적이라 소리 내어 읽기 좋습니다."
      : longSentenceCount > 0
        ? "긴 문장은 호흡 단위로 나누면 더 또렷하게 읽힙니다."
        : "평균 문장 길이를 조금 줄이면 낭독 리듬이 더 좋아집니다.";

  return {
    wordCount,
    sentenceCount,
    avgWordsPerSentence,
    longSentenceCount,
    score,
    feedbackKo,
  };
};

export function analyzePracticeScript(
  scriptText: string,
): PracticeScriptAnalysis | null {
  const words = tokenize(scriptText);

  if (words.length === 0) {
    return null;
  }

  return {
    keywords: buildKeywords(words),
    vocabulary: buildVocabulary(words),
    readability: buildReadability(scriptText, words),
    createdAt: new Date().toISOString(),
  };
}

const levenshteinDistance = (left: string, right: string): number => {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let leftIndex = 0; leftIndex < left.length; leftIndex += 1) {
    const current = [leftIndex + 1];

    for (let rightIndex = 0; rightIndex < right.length; rightIndex += 1) {
      const cost = left[leftIndex] === right[rightIndex] ? 0 : 1;
      current[rightIndex + 1] = Math.min(
        current[rightIndex] + 1,
        previous[rightIndex + 1] + 1,
        previous[rightIndex] + cost,
      );
    }

    previous.splice(0, previous.length, ...current);
  }

  return previous[right.length] ?? 0;
};

const areWordsSimilar = (scriptWord: string, spokenWord: string): boolean => {
  if (scriptWord === spokenWord) {
    return true;
  }

  if (scriptWord.length < 5 || spokenWord.length < 5) {
    return false;
  }

  const distance = levenshteinDistance(scriptWord, spokenWord);
  const longest = Math.max(scriptWord.length, spokenWord.length);

  return 1 - distance / longest >= 0.78;
};

const findNextMatch = (
  scriptWord: string,
  spokenWords: string[],
  startIndex: number,
): number => {
  const endIndex = Math.min(spokenWords.length, startIndex + 10);

  for (let index = startIndex; index < endIndex; index += 1) {
    if (areWordsSimilar(scriptWord, spokenWords[index] ?? "")) {
      return index;
    }
  }

  return -1;
};

const getMissedWords = (
  scriptWords: string[],
  matched: boolean[],
): string[] => {
  const missedCounts = new Map<string, number>();

  scriptWords.forEach((word, index) => {
    if (!matched[index] && isContentWord(word)) {
      missedCounts.set(word, (missedCounts.get(word) ?? 0) + 1);
    }
  });

  return [...missedCounts.entries()]
    .sort((left, right) => right[1] - left[1] || right[0].length - left[0].length)
    .slice(0, 8)
    .map(([word]) => titleCase(word));
};

const hasSpokenWord = (targetWord: string, spokenWords: string[]): boolean =>
  spokenWords.some((spokenWord) => areWordsSimilar(targetWord, spokenWord));

export function assessScriptReadAloud(
  scriptText: string,
  transcript: string,
): ScriptReadAloudAssessment | null {
  const scriptWords = tokenize(scriptText);

  if (scriptWords.length === 0) {
    return null;
  }

  const spokenWords = tokenize(transcript);
  const matched = scriptWords.map(() => false);
  let spokenIndex = 0;

  scriptWords.forEach((word, index) => {
    const matchIndex = findNextMatch(word, spokenWords, spokenIndex);
    if (matchIndex >= 0) {
      matched[index] = true;
      spokenIndex = matchIndex + 1;
    }
  });

  const matchedWordCount = matched.filter(Boolean).length;
  const coverageScore = Math.round((matchedWordCount / scriptWords.length) * 100);
  const analysis = analyzePracticeScript(scriptText);
  const vocabularyTargets =
    analysis?.vocabulary.map((item) => item.word.toLowerCase()) ?? [];
  const recognizedVocabularyCount = vocabularyTargets.filter((word) =>
    hasSpokenWord(word, spokenWords),
  ).length;
  const vocabularyScore =
    vocabularyTargets.length > 0
      ? Math.round((recognizedVocabularyCount / vocabularyTargets.length) * 100)
      : coverageScore;
  const pronunciationScore = Math.round(
    coverageScore * 0.55 + vocabularyScore * 0.45,
  );
  const missedWords = getMissedWords(scriptWords, matched);
  const missedSet = new Set(missedWords.map((word) => word.toLowerCase()));
  const unclearWords = vocabularyTargets
    .filter((word) => missedSet.has(word) || !hasSpokenWord(word, spokenWords))
    .slice(0, 5)
    .map(titleCase);
  const feedbackKo =
    spokenWords.length === 0
      ? "아직 인식된 낭독 문장이 부족합니다."
      : pronunciationScore >= 82
        ? "스크립트 대부분이 또렷하게 인식되고 있습니다."
        : pronunciationScore >= 60
          ? "핵심 흐름은 읽혔지만 일부 단어는 더 천천히 발음해보세요."
          : "스크립트와 인식된 문장의 차이가 큽니다. 한 문장씩 끊어 읽어보세요.";

  return {
    coverageScore,
    pronunciationScore,
    matchedWordCount,
    totalWordCount: scriptWords.length,
    missedWords,
    unclearWords,
    feedbackKo,
    createdAt: new Date().toISOString(),
  };
}
