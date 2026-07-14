import { describe, expect, it } from "vitest";
import { buildBreathScript } from "./buildBreathScript";

describe("buildBreathScript", () => {
  it("returns null when there is no usable script text", () => {
    expect(buildBreathScript("")).toBeNull();
    expect(buildBreathScript("   \n  ")).toBeNull();
  });

  it("builds a single segment from one short sentence", () => {
    const result = buildBreathScript("Hello world.");

    expect(result).not.toBeNull();
    expect(result?.segments).toHaveLength(1);
    expect(result?.segments[0].text).toBe("Hello world.");
    expect(result?.segments[0].translationKo).toBeNull();
    expect(result?.fullText).toBe("Hello world.");
    expect(typeof result?.segments[0].id).toBe("string");
  });

  it("never marks the first segment as a breath point", () => {
    const result = buildBreathScript("One two three. Four five six.");

    expect(result?.segments).toHaveLength(2);
    expect(result?.segments[0].isBreathPoint).toBe(false);
    expect(result?.segments[1].isBreathPoint).toBe(true);
    expect(result?.fullText).toBe("One two three. / Four five six.");
  });

  it("splits a long sentence into multiple breath segments", () => {
    const longSentence = Array.from({ length: 25 }, (_, i) => `w${i + 1}`).join(
      " ",
    );
    const result = buildBreathScript(longSentence);

    expect(result?.segments.length).toBe(3);
    expect(result?.segments.at(-1)?.isBreathPoint).toBe(true);
  });

  it("aligns a matching Korean translation to the sentence", () => {
    const result = buildBreathScript("Hello world.", "안녕 세계.");

    expect(result?.segments[0].translationKo).toBe("안녕 세계.");
  });
});
