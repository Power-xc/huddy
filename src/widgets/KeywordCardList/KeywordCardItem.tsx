import type { KeywordCard } from "@shared/types";
import { GlassCard } from "@shared/ui";

export type KeywordCardItemProps = {
  card: KeywordCard;
  onKeywordChange: (id: string, keyword: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
};

export function KeywordCardItem({
  card,
  onKeywordChange,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
}: KeywordCardItemProps) {
  return (
    <GlassCard className="grid gap-4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border-strong font-mono text-sm text-primary">
            {card.order}
          </span>
          <div>
            <p className="text-sm text-text-secondary">Keyword</p>
            <p className="text-sm text-text-muted">{card.hintKo}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-md border border-border px-3 py-2 text-sm text-text-secondary transition-colors hover:border-primary hover:text-text disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!canMoveUp}
            onClick={() => onMoveUp?.(card.id)}
            type="button"
          >
            Up
          </button>
          <button
            className="rounded-md border border-border px-3 py-2 text-sm text-text-secondary transition-colors hover:border-primary hover:text-text disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!canMoveDown}
            onClick={() => onMoveDown?.(card.id)}
            type="button"
          >
            Down
          </button>
        </div>
      </div>
      <input
        className="min-h-11 rounded-lg border border-border bg-surface px-4 text-text outline-none transition-colors placeholder:text-text-muted focus:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        onChange={(event) => onKeywordChange(card.id, event.target.value)}
        value={card.keyword}
      />
    </GlassCard>
  );
}
