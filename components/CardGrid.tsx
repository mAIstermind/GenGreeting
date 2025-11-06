import React from 'react';
import type { GeneratedCard } from '../types';
import { GreetingCard } from './GreetingCard';

interface CardGridProps {
  cards: GeneratedCard[];
  onEditCard: (card: GeneratedCard) => void;
}

export const CardGrid: React.FC<CardGridProps> = ({ cards, onEditCard }) => {
  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <GreetingCard key={`${card.email}-${index}`} card={card} onEdit={onEditCard}/>
      ))}
    </div>
  );
};