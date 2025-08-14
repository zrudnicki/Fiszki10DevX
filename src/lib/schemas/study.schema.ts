import { z } from "zod";

/**
 * Validation schemas for Study Session API
 */

// Start study session request
export const startStudySessionSchema = z.object({
  collection_id: z.string().uuid("Invalid collection ID format"),
  session_type: z.enum(["review", "learn", "mixed"]).default("mixed"),
  max_cards: z.number().int().min(1).max(50).default(20),
});

// Review flashcard request
export const reviewFlashcardSchema = z.object({
  flashcard_id: z.string().uuid("Invalid flashcard ID format"),
  quality: z.number().int().min(0).max(5), // 0-5 SuperMemo scale
  response_time_ms: z.number().int().min(0).optional(),
  difficulty_felt: z.enum(["very_easy", "easy", "normal", "hard", "very_hard"]).optional(),
});

// Batch review request
export const batchReviewSchema = z.object({
  reviews: z.array(reviewFlashcardSchema).min(1).max(20),
});

// Complete session request
export const completeSessionSchema = z.object({
  session_duration_ms: z.number().int().min(0),
  cards_reviewed: z.number().int().min(0),
  accuracy_rate: z.number().min(0).max(1).optional(),
});

// Study session query parameters
export const studySessionQuerySchema = z.object({
  collection_id: z.string().uuid().optional(),
  session_type: z.enum(["review", "learn", "mixed"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

/**
 * Response type schemas
 */
export type StartStudySessionRequest = z.infer<typeof startStudySessionSchema>;
export type ReviewFlashcardRequest = z.infer<typeof reviewFlashcardSchema>;
export type BatchReviewRequest = z.infer<typeof batchReviewSchema>;
export type CompleteSessionRequest = z.infer<typeof completeSessionSchema>;
export type StudySessionQuery = z.infer<typeof studySessionQuerySchema>; 