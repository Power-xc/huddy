const normalizeSpeechText = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

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
