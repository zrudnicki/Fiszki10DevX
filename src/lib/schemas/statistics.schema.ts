import { z } from "zod";

/**
 * Validation schemas for Statistics API
 */

// Generation statistics schemas
export const generationStatsSchema = z.object({
  total_generated: z.number().int().min(0),
  total_accepted_direct: z.number().int().min(0),
  total_accepted_edited: z.number().int().min(0),
});

export const updateGenerationStatsSchema = z.object({
  total_generated: z.number().int().min(0).optional(),
  total_accepted_direct: z.number().int().min(0).optional(),
  total_accepted_edited: z.number().int().min(0).optional(),
});

// Learning statistics query parameters
export const learningStatsQuerySchema = z.object({
  collection_id: z.string().uuid().optional(),
  period: z.enum(["week", "month", "year", "all"]).default("all"),
});

/**
 * Response type schemas
 */
export const generationStatsResponseSchema = z.object({
  total_generated: z.number(),
  total_accepted_direct: z.number(),
  total_accepted_edited: z.number(),
  acceptance_rate: z.number(),
  edit_rate: z.number(),
});

export const learningStatsResponseSchema = z.object({
  total_flashcards: z.number(),
  total_reviews: z.number(),
  accuracy_rate: z.number(),
  average_session_time: z.number(),
  reviews_by_period: z.array(
    z.object({
      date: z.string(),
      count: z.number(),
      accuracy: z.number(),
    })
  ),
});

/**
 * Type exports
 */
export type GenerationStatsRequest = z.infer<typeof generationStatsSchema>;
export type UpdateGenerationStatsRequest = z.infer<typeof updateGenerationStatsSchema>;
export type LearningStatsQuery = z.infer<typeof learningStatsQuerySchema>;
export type GenerationStatsResponse = z.infer<typeof generationStatsResponseSchema>;
export type LearningStatsResponse = z.infer<typeof learningStatsResponseSchema>;
