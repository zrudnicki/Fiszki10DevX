import { z } from "zod";

/**
 * Base validation schemas
 */
export const generationIdSchema = z.object({
  id: z.string().uuid("Invalid generation ID format"),
});

export const textForGenerationSchema = z
  .string()
  .min(100, "Text must be at least 100 characters long")
  .max(10000, "Text must be less than 10000 characters")
  .trim();

export const collectionIdSchema = z.string().uuid("Invalid collection ID format");
export const categoryIdSchema = z.string().uuid("Invalid category ID format");

/**
 * Request validation schemas
 */
export const generateFlashcardsSchema = z.object({
  text: textForGenerationSchema,
  collection_id: collectionIdSchema,
  category_id: categoryIdSchema.optional(),
  max_cards: z.number().int().min(1).max(20).default(10),
});

export const flashcardCandidateSchema = z.object({
  front: z.string().min(1).max(200).trim(),
  back: z.string().min(1).max(500).trim(),
  edited: z.boolean().default(false),
});

export const acceptFlashcardsSchema = z.object({
  accepted_cards: z.array(flashcardCandidateSchema).min(1, "At least one card must be accepted").max(20),
  collection_id: collectionIdSchema,
  category_id: categoryIdSchema.optional(),
});

/**
 * Response schemas for validation
 */
export const flashcardCandidateResponseSchema = z.object({
  front: z.string(),
  back: z.string(),
});

export const generateFlashcardsResponseSchema = z.object({
  candidates: z.array(flashcardCandidateResponseSchema),
  generation_id: z.string().uuid(),
  text_length: z.number(),
  max_cards: z.number(),
});

export type GenerateFlashcardsRequest = z.infer<typeof generateFlashcardsSchema>;
export type AcceptFlashcardsRequest = z.infer<typeof acceptFlashcardsSchema>;
export type FlashcardCandidate = z.infer<typeof flashcardCandidateSchema>;
export type FlashcardCandidateResponse = z.infer<typeof flashcardCandidateResponseSchema>;
export type GenerateFlashcardsResponse = z.infer<typeof generateFlashcardsResponseSchema>;
