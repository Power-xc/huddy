import { describe, expect, it } from "vitest";
import { getKeywordCardCount } from "./getKeywordCardCount";

const words = (count: number): string => "word ".repeat(count).trim();

describe("getKeywordCardCount", () => {
  it("returns the floor count for a short script and short duration", () => {
    expect(getKeywordCardCount("", 3)).toBe(8);
    expect(getKeywordCardCount(words(10), 3)).toBe(8);
  });

  it("scales the count up with the target duration", () => {
    expect(getKeywordCardCount("", 4)).toBe(12);
    expect(getKeywordCardCount("", 6)).toBe(16);
    expect(getKeywordCardCount("", 11)).toBe(20);
    expect(getKeywordCardCount("", 21)).toBe(24);
  });

  it("scales the count up with the script length", () => {
    expect(getKeywordCardCount(words(100), 3)).toBe(12);
    expect(getKeywordCardCount(words(200), 3)).toBe(16);
    expect(getKeywordCardCount(words(400), 3)).toBe(20);
    expect(getKeywordCardCount(words(700), 3)).toBe(24);
  });

  it("takes the larger of the duration-based and script-based counts", () => {
    expect(getKeywordCardCount(words(700), 3)).toBe(24);
    expect(getKeywordCardCount("", 21)).toBe(24);
    expect(getKeywordCardCount(words(100), 21)).toBe(24);
  });

  it("defaults the target duration to three minutes", () => {
    expect(getKeywordCardCount(words(100))).toBe(12);
  });
});
