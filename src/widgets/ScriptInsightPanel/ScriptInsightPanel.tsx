import type {
  PracticeScriptAnalysis,
  ScriptReadAloudAssessment,
} from "@shared/types";
import { GlassCard } from "@shared/ui";

export type ScriptInsightPanelProps = {
  analysis: PracticeScriptAnalysis | null;
  assessment?: ScriptReadAloudAssessment | null;
};

const formatScore = (score: number): string => `${score}%`;

export function ScriptInsightPanel({
  analysis,
  assessment = null,
}: ScriptInsightPanelProps) {
  if (!analysis) {
    return null;
  }

  return (
    <GlassCard className="grid gap-5 p-6">
      <div>
        <p className="text-sm font-medium text-primary">Script coach</p>
        <h2 className="mt-2 text-xl font-semibold text-text">
          스크립트 키워드와 발음 포인트
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <p className="text-sm text-text-secondary">읽기 쉬움</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-primary">
            {formatScore(analysis.readability.score)}
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {analysis.readability.feedbackKo}
          </p>
        </div>
        <div>
          <p className="text-sm text-text-secondary">문장 평균</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-text">
            {analysis.readability.avgWordsPerSentence}
            <span className="ml-1 text-base text-text-secondary">words</span>
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            긴 문장 {analysis.readability.longSentenceCount}개
          </p>
        </div>
        <div>
          <p className="text-sm text-text-secondary">스크립트 길이</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-text">
            {analysis.readability.wordCount}
            <span className="ml-1 text-base text-text-secondary">words</span>
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {analysis.readability.sentenceCount}문장 기준
          </p>
        </div>
      </div>

      {assessment && (
        <div className="grid gap-4 border-t border-border pt-5 md:grid-cols-3">
          <div>
            <p className="text-sm text-text-secondary">스크립트 매칭</p>
            <p className="mt-2 font-mono text-2xl font-semibold text-primary">
              {formatScore(assessment.coverageScore)}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">발음 인식</p>
            <p className="mt-2 font-mono text-2xl font-semibold text-primary">
              {formatScore(assessment.pronunciationScore)}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">인식 단어</p>
            <p className="mt-2 font-mono text-2xl font-semibold text-text">
              {assessment.matchedWordCount}
              <span className="ml-1 text-base text-text-secondary">
                / {assessment.totalWordCount}
              </span>
            </p>
          </div>
          <p className="md:col-span-3 text-sm leading-6 text-text-secondary">
            {assessment.feedbackKo}
          </p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="text-sm text-text-secondary">중요 키워드</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {analysis.keywords.map((keyword) => (
              <span
                className="rounded-full border border-border px-3 py-1 font-mono text-sm text-text-secondary"
                key={keyword.term}
                title={keyword.reasonKo}
              >
                {keyword.term}
                <span className="ml-1 text-text-muted">x{keyword.count}</span>
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-text-secondary">발음 연습 단어</p>
          <div className="mt-3 grid gap-2">
            {analysis.vocabulary.map((item) => (
              <div
                className="grid gap-1 rounded-lg border border-border bg-surface/50 px-3 py-2"
                key={item.word}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-sm text-text">
                    {item.word}
                  </span>
                  <span className="font-mono text-xs uppercase text-text-muted">
                    {item.risk}
                  </span>
                </div>
                <p className="text-xs leading-5 text-text-secondary">
                  {item.tipKo}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {assessment && assessment.unclearWords.length > 0 && (
        <div className="border-t border-border pt-5">
          <p className="text-sm text-text-secondary">다시 또렷하게 읽을 단어</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {assessment.unclearWords.map((word) => (
              <span
                className="rounded-full border border-warning/40 px-3 py-1 font-mono text-sm text-warning"
                key={word}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
