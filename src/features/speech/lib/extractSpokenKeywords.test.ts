import { describe, expect, it } from "vitest";
import type { KeywordCard } from "@shared/types";
import {
  extractSpokenKeywords,
  getRouteKeywordProgress,
} from "./extractSpokenKeywords";

const card = (keyword: string): KeywordCard => ({
  id: keyword,
  order: 1,
  keyword,
  hintKo: "",
  isUsed: false,
});

describe("extractSpokenKeywords", () => {
  it("returns nothing for an empty transcript", () => {
    expect(extractSpokenKeywords("", [])).toEqual([]);
  });

  it("ranks the most frequent content word first", () => {
    const result = extractSpokenKeywords(
      "roadmap roadmap growth strategy",
      [],
    );

    expect(result[0]).toMatchObject({ text: "Roadmap", count: 2 });
  });

  it("boosts and flags route keywords that were spoken", () => {
    const result = extractSpokenKeywords(
      "growth strategy strategy roadmap",
      [card("strategy")],
    );

    expect(result[0]).toEqual({
      text: "Strategy",
      count: 4,
      isRouteKeyword: true,
    });
  });
});

describe("getRouteKeywordProgress", () => {
  it("separates matched from missed route keywords", () => {
    const progress = getRouteKeywordProgress("we discuss growth strategy", [
      card("strategy"),
      card("budget"),
    ]);

    expect(progress.matchedRouteKeywords).toEqual(["strategy"]);
    expect(progress.missedRouteKeywords).toEqual(["budget"]);
  });
});
