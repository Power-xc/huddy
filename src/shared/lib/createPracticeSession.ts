import type {
  FocusArea,
  PracticeSession,
  PracticeSessionCategory,
  PresentationMode,
} from "@shared/types";

export type CreatePracticeSessionInput = {
  id: string;
  title: string;
  category: PracticeSessionCategory;
  mode: PresentationMode;
  focusAreas: FocusArea[];
  targetDurationMin: PracticeSession["targetDurationMin"];
  weekNumber: number;
  createdAt: string;
  updatedAt: string;
};

export function createPracticeSession({
  id,
  title,
  category,
  mode,
  focusAreas,
  targetDurationMin,
  weekNumber,
  createdAt,
  updatedAt,
}: CreatePracticeSessionInput): PracticeSession {
  return {
    id,
    title: title.trim(),
    category,
    mode,
    focusAreas,
    targetDurationMin,
    weekNumber,
    memoKo: "",
    scriptText: "",
    scriptAnalysis: null,
    keywordCards: [],
    breathScript: null,
    transcript: null,
    practiceSignals: null,
    report: null,
    recording: null,
    status: "draft",
    createdAt,
    updatedAt,
    completedAt: null,
  };
}
