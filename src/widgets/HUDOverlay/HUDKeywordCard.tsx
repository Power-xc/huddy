import type { KeywordCard } from "@shared/types";
import { Button, GlassCard } from "@shared/ui";

export type HUDKeywordCardProps = {
  currentCard: KeywordCard | null;
  currentIndex: number;
  totalCount: number;
  onNext: () => void;
};

export function HUDKeywordCard({
  currentCard,
  currentIndex,
  totalCount,
  onNext,
}: HUDKeywordCardProps) {
  const isCompleted = !currentCard && totalCount > 0;
  const isLastKeyword = currentIndex >= totalCount - 1;

  if (isCompleted) {
    return (
      <GlassCard className="px-5 py-4 text-center">
        <p className="text-base font-semibold text-text">모든 키워드 완료</p>
        <p className="mt-1 text-sm text-text-secondary">
          발표를 마무리하고 완료 버튼을 눌러주세요.
        </p>
      </GlassCard>
    );
  }

  if (!currentCard) {
    return (
      <GlassCard className="px-5 py-4 text-center">
        <p className="text-base font-semibold text-text">키워드가 없습니다</p>
        <p className="mt-1 text-sm text-text-secondary">
          Prepare 단계에서 키워드를 먼저 생성하세요.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="grid gap-3 px-5 py-4 text-center">
      {/* 한 번에 하나만 보여 발표자가 화면을 읽는 대신 현재 cue만 확인하도록 한다. */}
      <div>
        <p className="font-mono text-xs text-text-secondary">
          {currentIndex + 1} / {totalCount}
        </p>
        <p className="mt-1 truncate font-heading text-2xl font-semibold text-primary">
          {currentCard.keyword}
        </p>
        <p className="mt-1 text-sm text-text-secondary">
          {currentCard.hintKo}
        </p>
      </div>
      <div className="flex justify-center">
        <Button onClick={onNext} size="sm" variant="secondary">
          {isLastKeyword ? "키워드 완료" : "다음 키워드"}
        </Button>
      </div>
    </GlassCard>
  );
}
