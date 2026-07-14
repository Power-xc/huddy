import { describe, expect, it } from "vitest";
import { normalizeSpeechText, titleCase } from "./text";

describe("normalizeSpeechText", () => {
  it("lowercases, strips punctuation and collapses whitespace", () => {
    expect(normalizeSpeechText("  Our ROADMAP, today!  ")).toBe(
      "our roadmap today",
    );
  });

  it("returns an empty string for punctuation-only input", () => {
    expect(normalizeSpeechText("!!! ??? ...")).toBe("");
  });
});

describe("titleCase", () => {
  it("capitalizes each word", () => {
    expect(titleCase("growth strategy")).toBe("Growth Strategy");
  });
});
