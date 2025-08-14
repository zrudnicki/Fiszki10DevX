/**
 * Spaced Repetition Algorithm - Based on SuperMemo SM-2
 *
 * This implementation calculates the next review date and parameters
 * for flashcards based on the user's performance.
 */

export interface SpacedRepetitionParams {
  quality: number; // 0-5 scale (0 = complete blackout, 5 = perfect response)
  repetition_count: number; // Number of times card has been reviewed
  ease_factor: number; // Ease factor (>=1.3, typically starts at 2.5)
  interval_days: number; // Current interval in days
}

export interface SpacedRepetitionResult {
  repetition_count: number;
  ease_factor: number;
  interval_days: number;
  next_review_date: Date;
  should_repeat_today: boolean; // If quality < 3, repeat in current session
}

/**
 * Calculate next review parameters using SuperMemo SM-2 algorithm
 */
export function calculateNextReview(params: SpacedRepetitionParams): SpacedRepetitionResult {
  const { quality, repetition_count, ease_factor, interval_days } = params;

  // If quality < 3, card is failed - repeat today and reset repetition count
  if (quality < 3) {
    return {
      repetition_count: 0,
      ease_factor: Math.max(1.3, ease_factor), // Don't reduce ease factor below 1.3
      interval_days: 1, // Review again tomorrow
      next_review_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      should_repeat_today: true,
    };
  }

  // Calculate new ease factor
  const newEaseFactor = Math.max(1.3, ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  // Calculate new repetition count
  const newRepetitionCount = repetition_count + 1;

  // Calculate new interval
  let newInterval: number;

  if (newRepetitionCount === 1) {
    newInterval = 1; // First review: 1 day
  } else if (newRepetitionCount === 2) {
    newInterval = 6; // Second review: 6 days
  } else {
    // Subsequent reviews: previous interval * ease factor
    newInterval = Math.round(interval_days * newEaseFactor);
  }

  // Calculate next review date
  const nextReviewDate = new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000);

  return {
    repetition_count: newRepetitionCount,
    ease_factor: newEaseFactor,
    interval_days: newInterval,
    next_review_date: nextReviewDate,
    should_repeat_today: false,
  };
}

/**
 * Get initial parameters for a new flashcard
 */
export function getInitialSpacedRepetitionParams(): Omit<SpacedRepetitionParams, "quality"> {
  return {
    repetition_count: 0,
    ease_factor: 2.5, // Default ease factor
    interval_days: 1,
  };
}

/**
 * Determine if a flashcard is due for review
 */
export function isFlashcardDue(nextReviewDate: string | Date): boolean {
  const reviewDate = typeof nextReviewDate === "string" ? new Date(nextReviewDate) : nextReviewDate;

  return reviewDate <= new Date();
}

/**
 * Get cards due for review from a collection (cards with repetitions > 0 that are due)
 */
export function getCardsForReview<T extends { repetitions: number; next_review_date: string }>(
  cards: T[],
  maxCards = 20
): T[] {
  return cards
    .filter((card) => card.repetitions > 0 && isFlashcardDue(card.next_review_date))
    .sort((a, b) => new Date(a.next_review_date).getTime() - new Date(b.next_review_date).getTime())
    .slice(0, maxCards);
}

/**
 * Get new cards for learning (cards that haven't been reviewed yet)
 */
export function getNewCardsForLearning<T extends { repetitions: number; next_review_date: string }>(
  cards: T[],
  maxCards = 10
): T[] {
  return cards
    .filter((card) => card.repetitions === 0)
    .sort((a, b) => new Date(a.next_review_date).getTime() - new Date(b.next_review_date).getTime())
    .slice(0, maxCards);
}

/**
 * Mix review and new cards for a balanced study session
 */
export function getMixedCardsForStudy<T extends { repetitions: number; next_review_date: string }>(
  cards: T[],
  maxCards = 20,
  newCardRatio = 0.3 // 30% new cards, 70% review cards
): T[] {
  const maxNewCards = Math.ceil(maxCards * newCardRatio);
  const maxReviewCards = maxCards - maxNewCards;

  const reviewCards = getCardsForReview(cards, maxReviewCards);
  const newCards = getNewCardsForLearning(cards, maxNewCards);

  // Calculate remaining slots
  const totalAvailableCards = reviewCards.length + newCards.length;
  const remainingSlots = maxCards - totalAvailableCards;

  // If we have remaining slots, try to fill them with any available cards
  let additionalCards: T[] = [];
  if (remainingSlots > 0) {
    const usedCardIds = new Set([...reviewCards, ...newCards].map((c) => (c as any).id));
    additionalCards = cards.filter((card) => !usedCardIds.has((card as any).id)).slice(0, remainingSlots);
  }

  // Combine all cards
  const combinedCards = [...reviewCards, ...newCards, ...additionalCards];

  // Simple shuffle algorithm
  for (let i = combinedCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combinedCards[i], combinedCards[j]] = [combinedCards[j], combinedCards[i]];
  }

  return combinedCards.slice(0, maxCards);
}

/**
 * Get any available cards for study (fallback function)
 * This function will return cards regardless of review date for emergency cases
 */
export function getAnyAvailableCards<T extends { repetitions: number; next_review_date: string }>(
  cards: T[],
  maxCards = 20
): T[] {
  // First try new cards
  const newCards = getNewCardsForLearning(cards, maxCards);
  if (newCards.length > 0) {
    return newCards;
  }

  // Then try review cards (even if not due yet)
  const allOldCards = cards
    .filter((card) => card.repetitions > 0)
    .sort((a, b) => new Date(a.next_review_date).getTime() - new Date(b.next_review_date).getTime())
    .slice(0, maxCards);

  return allOldCards;
}
