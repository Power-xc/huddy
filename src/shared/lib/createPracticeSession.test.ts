import { describe, expect, it } from "vitest";
import {
  createPracticeSession,
  type CreatePracticeSessionInput,
} from "./createPracticeSession";

const input: CreatePracticeSessionInput = {
  id: "session-1",
  title: "  My Talk  ",
  category: "study",
  mode: "breath",
  focusAreas: ["flow", "confidence"],
  targetDurationMin: 10,
  weekNumber: 3,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("createPracticeSession", () => {
  it("trims the title", () => {
    expect(createPracticeSession(input).title).toBe("My Talk");
  });

  it("preserves the provided identity and metadata", () => {
    const session = createPracticeSession(input);

    expect(session.id).toBe("session-1");
    expect(session.category).toBe("study");
    expect(session.mode).toBe("breath");
    expect(session.focusAreas).toEqual(["flow", "confidence"]);
    expect(session.targetDurationMin).toBe(10);
    expect(session.weekNumber).toBe(3);
    expect(session.createdAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("starts as an empty draft", () => {
    const session = createPracticeSession(input);

    expect(session.status).toBe("draft");
    expect(session.memoKo).toBe("");
    expect(session.keywordCards).toEqual([]);
    expect(session.scriptAnalysis).toBeNull();
    expect(session.report).toBeNull();
    expect(session.completedAt).toBeNull();
  });
});
