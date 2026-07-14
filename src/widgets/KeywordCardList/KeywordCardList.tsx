"use client";

import { useState } from "react";
import type { KeywordCard } from "@shared/types";
import { Button } from "@shared/ui";
import { KeywordCardItem } from "./KeywordCardItem";

export type KeywordCardListProps = {
  cards: KeywordCard[];
  onChange: (cards: KeywordCard[]) => void;
};

const reorderCards = (cards: KeywordCard[]) =>
  cards.map((card, index) => ({
    ...card,
    order: index + 1,
  }));

const cardsPerPage = 4;

export function KeywordCardList({ cards, onChange }: KeywordCardListProps) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(cards.length / cardsPerPage));
  const currentPage = Math.min(page, totalPages - 1);
  const pageStart = currentPage * cardsPerPage;
  const visibleCards = cards.slice(pageStart, pageStart + cardsPerPage);

  const handleKeywordChange = (id: string, keyword: string) => {
    onChange(
      cards.map((card) => (card.id === id ? { ...card, keyword } : card)),
    );
  };

  const moveCard = (id: string, direction: "up" | "down") => {
    const currentIndex = cards.findIndex((card) => card.id === id);
    const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= cards.length) {
      return;
    }

    const nextCards = [...cards];
    const currentCard = nextCards[currentIndex];
    const targetCard = nextCards[nextIndex];

    nextCards[currentIndex] = targetCard;
    nextCards[nextIndex] = currentCard;
    onChange(reorderCards(nextCards));
    setPage(Math.floor(nextIndex / cardsPerPage));
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-text">
            전체 키워드 {cards.length}개
          </p>
          <p className="mt-1 text-sm text-text-muted">
            한 번에 4개씩 검토하고 순서를 조정하세요.
          </p>
        </div>
        <p className="font-mono text-sm text-primary" aria-live="polite">
          {currentPage + 1} / {totalPages}
        </p>
      </div>

      <div className="grid gap-3">
        {visibleCards.map((card) => {
          const index = cards.findIndex((item) => item.id === card.id);

          return (
            <KeywordCardItem
              canMoveDown={index < cards.length - 1}
              canMoveUp={index > 0}
              card={card}
              key={card.id}
              onKeywordChange={handleKeywordChange}
              onMoveDown={(id) => moveCard(id, "down")}
              onMoveUp={(id) => moveCard(id, "up")}
            />
          );
        })}
      </div>

      <nav
        aria-label="키워드 카드 페이지"
        className="flex items-center justify-between gap-3 border-t border-border pt-4"
      >
        <Button
          disabled={currentPage === 0}
          onClick={() => setPage(Math.max(0, currentPage - 1))}
          size="sm"
          variant="secondary"
        >
          ← 이전 4개
        </Button>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              aria-label={`${index + 1}페이지로 이동`}
              aria-current={index === currentPage ? "page" : undefined}
              className={[
                "h-2.5 rounded-full transition-[width,background-color]",
                index === currentPage ? "w-7 bg-primary" : "w-2.5 bg-border",
              ].join(" ")}
              key={index}
              onClick={() => setPage(index)}
              type="button"
            />
          ))}
        </div>
        <Button
          disabled={currentPage >= totalPages - 1}
          onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))}
          size="sm"
          variant="secondary"
        >
          다음 4개 →
        </Button>
      </nav>
    </div>
  );
}
