const countWords = (value: string): number =>
  value.trim().split(/\s+/).filter(Boolean).length;

const getDurationCount = (targetDurationMin: number): number => {
  if (targetDurationMin > 20) return 24;
  if (targetDurationMin > 10) return 20;
  if (targetDurationMin > 5) return 16;
  if (targetDurationMin > 3) return 12;
  return 8;
};

const getScriptCount = (scriptText: string): number => {
  const wordCount = countWords(scriptText);

  if (wordCount > 600) return 24;
  if (wordCount > 350) return 20;
  if (wordCount > 180) return 16;
  if (wordCount > 80) return 12;
  return 8;
};

export const getKeywordCardCount = (
  scriptText: string,
  targetDurationMin = 3,
): number =>
  Math.max(
    getDurationCount(targetDurationMin),
    getScriptCount(scriptText),
  );
