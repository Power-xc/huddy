import type { KeywordCard } from "@shared/types";
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

export function KeywordCardList({ cards, onChange }: KeywordCardListProps) {
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
  };

  return (
    <div className="grid gap-3">
      {cards.map((card, index) => (
        <KeywordCardItem
          canMoveDown={index < cards.length - 1}
          canMoveUp={index > 0}
          card={card}
          key={card.id}
          onKeywordChange={handleKeywordChange}
          onMoveDown={(id) => moveCard(id, "down")}
          onMoveUp={(id) => moveCard(id, "up")}
        />
      ))}
    </div>
  );
}
