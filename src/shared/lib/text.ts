/** Lowercases, strips punctuation and collapses whitespace for loose speech matching. */
export const normalizeSpeechText = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** Capitalizes the first letter of each space-separated word. */
export const titleCase = (value: string): string =>
  value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
