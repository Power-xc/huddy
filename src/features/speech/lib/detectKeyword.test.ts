import { describe, expect, it } from "vitest";
import {
  detectKeyword,
  detectPhraseCompletion,
  getPhraseRecognitionProgress,
} from "./detectKeyword";

describe("detectKeyword", () => {
  it("matches a keyword regardless of case and punctuation", () => {
    expect(detectKeyword("Let me introduce the roadmap.", "roadmap")).toBe(true);
    expect(detectKeyword("Our ROADMAP, today!", "roadmap")).toBe(true);
  });

  it("matches a multi-word keyword in order", () => {
    expect(detectKeyword("the main goal is speed", "main goal")).toBe(true);
  });

  it("returns false when the keyword is absent", () => {
    expect(detectKeyword("hello there", "roadmap")).toBe(false);
  });

  it("returns false when the keyword is longer than the transcript", () => {
    expect(detectKeyword("hi", "one two three")).toBe(false);
  });

  it("returns false for empty input", () => {
    expect(detectKeyword("", "roadmap")).toBe(false);
    expect(detectKeyword("roadmap", "")).toBe(false);
  });
});

describe("getPhraseRecognitionProgress", () => {
  it("reports completion when the full phrase is spoken in order", () => {
    const progress = getPhraseRecognitionProgress(
      "let me start with the agenda",
      "let me start with the agenda",
    );

    expect(progress.matchedWordCount).toBe(6);
    expect(progress.totalWordCount).toBe(6);
    expect(progress.isComplete).toBe(true);
  });

  it("does not complete when the phrase ending is missing", () => {
    const progress = getPhraseRecognitionProgress(
      "let me start with the",
      "let me start with the agenda",
    );

    expect(progress.isComplete).toBe(false);
    expect(progress.totalWordCount).toBe(6);
  });

  it("handles empty input without matching", () => {
    const progress = getPhraseRecognitionProgress("", "hello world");

    expect(progress).toEqual({
      matchedWordIndexes: [],
      matchedWordCount: 0,
      totalWordCount: 2,
      isComplete: false,
    });
  });
});

describe("detectPhraseCompletion", () => {
  it("is true only once the whole phrase is recognized", () => {
    expect(detectPhraseCompletion("the main point", "the main point")).toBe(
      true,
    );
    expect(detectPhraseCompletion("the main", "the main point")).toBe(false);
  });
});
