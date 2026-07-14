import { describe, expect, it } from "vitest";
import { formatTime } from "./formatTime";

describe("formatTime", () => {
  it("formats seconds as zero-padded MM:SS", () => {
    expect(formatTime(0)).toBe("00:00");
    expect(formatTime(5)).toBe("00:05");
    expect(formatTime(65)).toBe("01:05");
    expect(formatTime(600)).toBe("10:00");
  });

  it("floors fractional seconds", () => {
    expect(formatTime(59.9)).toBe("00:59");
  });

  it("clamps negative input to zero", () => {
    expect(formatTime(-10)).toBe("00:00");
  });

  it("falls back to zero for non-finite input", () => {
    expect(formatTime(Number.NaN)).toBe("00:00");
    expect(formatTime(Number.POSITIVE_INFINITY)).toBe("00:00");
  });

  it("keeps counting minutes past one hour", () => {
    expect(formatTime(3661)).toBe("61:01");
  });
});
