import { describe, expect, it } from "vitest";
import {
  analyzePracticeScript,
  assessScriptReadAloud,
} from "./analyzePracticeScript";

const ISO = /^\d{4}-\d{2}-\d{2}T/;

describe("analyzePracticeScript", () => {
  it("returns null when there are no words to analyze", () => {
    expect(analyzePracticeScript("")).toBeNull();
    expect(analyzePracticeScript("!!! ??? ...")).toBeNull();
  });

  it("surfaces a repeated content word as a keyword", () => {
    const analysis = analyzePracticeScript(
      "Growth growth growth revenue revenue product.",
    );

    expect(analysis).not.toBeNull();
    expect(analysis?.keywords.length).toBeGreaterThan(0);
    expect(
      analysis?.keywords.some((keyword) =>
        keyword.term.toLowerCase().includes("growth"),
      ),
    ).toBe(true);
    expect(analysis?.createdAt).toMatch(ISO);
  });

  it("computes readability from word and sentence counts", () => {
    const analysis = analyzePracticeScript(
      "One two three four. Five six seven eight.",
    );

    expect(analysis?.readability.wordCount).toBe(8);
    expect(analysis?.readability.sentenceCount).toBe(2);
    expect(analysis?.readability.avgWordsPerSentence).toBe(4);
    expect(analysis?.readability.score).toBeGreaterThanOrEqual(45);
    expect(analysis?.readability.score).toBeLessThanOrEqual(100);
  });
});

describe("assessScriptReadAloud", () => {
  it("returns null when the script has no words", () => {
    expect(assessScriptReadAloud("", "anything")).toBeNull();
  });

  it("scores full coverage when the transcript matches the script", () => {
    const assessment = assessScriptReadAloud(
      "Our roadmap drives growth",
      "our roadmap drives growth",
    );

    expect(assessment?.coverageScore).toBe(100);
    expect(assessment?.matchedWordCount).toBe(4);
    expect(assessment?.totalWordCount).toBe(4);
    expect(assessment?.missedWords).toHaveLength(0);
  });

  it("reports missed content words on partial coverage", () => {
    const assessment = assessScriptReadAloud(
      "Our roadmap drives growth",
      "our roadmap",
    );

    expect(assessment?.coverageScore).toBe(50);
    expect(assessment?.missedWords).toContain("Drives");
    expect(assessment?.missedWords).toContain("Growth");
  });
});
