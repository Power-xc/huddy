export type PresentationMode = "script" | "breath" | "keyword" | "no-script";

export type FocusArea =
  | "breathing"
  | "confidence"
  | "pronunciation"
  | "flow"
  | "eye-contact";

export type PracticeSessionCategory = "work" | "study" | "life" | "custom";

export type PracticeSessionStatus =
  | "draft"
  | "prepared"
  | "in-progress"
  | "completed";

export type KeywordCard = {
  id: string;
  order: number;
  keyword: string;
  hintKo: string;
  isUsed: boolean;
};

export type BreathSegment = {
  id: string;
  text: string;
  translationKo: string | null;
  isBreathPoint: boolean;
};

export type BreathScript = {
  segments: BreathSegment[];
  fullText: string;
};

export type CueSeverity = "info" | "stable" | "warning" | "error";

export type CueCategory = "keyword" | "breath" | "pace" | "posture" | "system";

export type HudCue = {
  id: string;
  category: CueCategory;
  severity: CueSeverity;
  message: string;
  createdAt: string;
};

// P0에서는 녹음 파일 자체가 아니라 저장/분석 흐름에 필요한 메타데이터만 보관한다.
export type RecordingMetadata = {
  id: string;
  sessionId: string;
  mode: "none" | "audio-only";
  durationSec: number;
  createdAt: string;
};

export type TranscriptSegment = {
  id: string;
  text: string;
  startSec: number;
  endSec: number;
};

export type SessionMetric = {
  clarity: number;
  confidence: number;
  flow: number;
  pronunciation: number;
  breath: number;
};

export type SessionReport = {
  oneLineFeedback: string;
  strengths: [string, string, string];
  improvements: [string, string];
  breathFeedback: string;
  flowFeedback: string;
  problemWords: string[];
  nextWeekMission: string;
  recommendedMode: PresentationMode;
  metrics: SessionMetric;
  actualDurationSec: number;
  keywordsUsedCount: number;
  createdAt: string;
};

export type SpokenKeywordInsight = {
  text: string;
  count: number;
  isRouteKeyword: boolean;
};

export type ScriptKeywordInsight = {
  term: string;
  count: number;
  kind: "word" | "phrase";
  reasonKo: string;
};

export type ScriptVocabularyRisk = "low" | "medium" | "high";

export type ScriptVocabularyInsight = {
  word: string;
  count: number;
  risk: ScriptVocabularyRisk;
  tipKo: string;
};

export type ScriptReadabilityInsight = {
  wordCount: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
  longSentenceCount: number;
  score: number;
  feedbackKo: string;
};

export type PracticeScriptAnalysis = {
  keywords: ScriptKeywordInsight[];
  vocabulary: ScriptVocabularyInsight[];
  readability: ScriptReadabilityInsight;
  createdAt: string;
};

export type ScriptReadAloudAssessment = {
  coverageScore: number;
  pronunciationScore: number;
  recognitionConfidence: number | null;
  matchedWordCount: number;
  totalWordCount: number;
  missedWords: string[];
  unclearWords: string[];
  feedbackKo: string;
  createdAt: string;
};

export type TranscriptTimelineItem = {
  id: string;
  text: string;
  elapsedSec: number;
  matchedKeywords: string[];
};

export type KeywordAdvanceSource = "auto-detected" | "manual";

export type KeywordRouteProgressItem = {
  keyword: string;
  source: KeywordAdvanceSource;
  elapsedSec: number;
};

export type PracticeSignalSummary = {
  spokenKeywords: SpokenKeywordInsight[];
  matchedRouteKeywords: string[];
  missedRouteKeywords: string[];
  transcriptTimeline: TranscriptTimelineItem[];
  keywordProgress: KeywordRouteProgressItem[];
  autoDetectedKeywords: string[];
  manuallyAdvancedKeywords: string[];
  cameraAttentionScore: number | null;
  mouthMovementScore: number | null;
  mouthOpennessScore: number | null;
  headStabilityScore: number | null;
  lookDownRatio: number | null;
  readingPostureRiskScore: number | null;
  pauseRhythmScore: number | null;
  speechRecognitionConfidence: number | null;
  speechRecognitionError: string | null;
  scriptAssessment: ScriptReadAloudAssessment | null;
  cameraFeedback: string;
  mouthFeedback: string;
  postureFeedback: string;
  pauseFeedback: string;
  readingFeedback: string;
  soundCueEnabled: boolean;
  createdAt: string;
};

// 브라우저의 Session 객체와 의미가 겹치지 않도록, 저장되는 발표 연습 단위는 PracticeSession으로 고정한다.
export type PracticeSession = {
  id: string;
  title: string;
  category: PracticeSessionCategory;
  mode: PresentationMode;
  focusAreas: FocusArea[];
  targetDurationMin: number;
  weekNumber: number;
  memoKo: string;
  scriptText: string;
  scriptTranslationKo: string;
  scriptAnalysis: PracticeScriptAnalysis | null;
  keywordCards: KeywordCard[];
  breathScript: BreathScript | null;
  transcript: string | null;
  practiceSignals: PracticeSignalSummary | null;
  report: SessionReport | null;
  recording: RecordingMetadata | null;
  status: PracticeSessionStatus;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

export type PracticeSessionSummary = {
  id: string;
  title: string;
  category: PracticeSessionCategory;
  mode: PresentationMode;
  focusAreas: FocusArea[];
  status: PracticeSessionStatus;
  weekNumber: number;
  completedAt: string | null;
};

// HUDState는 발표 중 화면 제어 상태라 새로고침 후 복원 대상이 아니며 저장 모델에서 분리한다.
export type HUDState = {
  sessionId: string;
  currentKeywordIndex: number;
  elapsedSec: number;
  isRunning: boolean;
  isPaused: boolean;
};

export type WeeklyProgress = {
  weekNumber: number;
  sessions: PracticeSessionSummary[];
  isCompleted: boolean;
  mission: string | null;
  metrics: SessionMetric | null;
};

export type AppConfig = {
  programStartDate: string;
  currentWeek: number;
  totalSessionsCompleted: number;
};
