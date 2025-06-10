import { z } from "zod";

/**
 * Base validation schemas
 */
export const flashcardIdSchema = z.object({
  id: z.string().uuid("Invalid flashcard ID format"),
});

export const flashcardFrontSchema = z
  .string()
  .min(1, "Front text is required")
  .max(200, "Front text must be less than 200 characters")
  .trim();

export const flashcardBackSchema = z
  .string()
  .min(1, "Back text is required")
  .max(500, "Back text must be less than 500 characters")
  .trim();

export const collectionIdSchema = z.string().uuid("Invalid collection ID format");
export const categoryIdSchema = z.string().uuid("Invalid category ID format");

export const flashcardSourceSchema = z.enum(["manual", "ai_generated"]).default("manual");

/**
 * Request validation schemas
 */
export const createFlashcardSchema = z.object({
  front: flashcardFrontSchema,
  back: flashcardBackSchema,
  collection_id: collectionIdSchema,
  category_id: categoryIdSchema.optional(),
  source: flashcardSourceSchema.optional(),
});

export const updateFlashcardSchema = z.object({
  front: flashcardFrontSchema.optional(),
  back: flashcardBackSchema.optional(),
  collection_id: collectionIdSchema.optional(),
  category_id: categoryIdSchema.optional(),
});

export const bulkCreateFlashcardsSchema = z.object({
  flashcards: z.array(createFlashcardSchema).min(1, "At least one flashcard is required").max(50, "Maximum 50 flashcards per bulk operation"),
});

/**
 * Query parameters validation
 */
export const flashcardsListQuerySchema = z
  .object({
    page: z.string().regex(/^\d+$/).transform(Number).default("1"),
    limit: z.string().regex(/^\d+$/).transform(Number).default("20"),
    sort_by: z.enum(["created_at", "front", "updated_at", "next_review_date"]).default("created_at"),
    sort_order: z.enum(["asc", "desc"]).default("desc"),
    collection_id: z.string().uuid().optional(),
    category_id: z.string().uuid().optional(),
  })
  .transform((data) => ({
    limit: Math.min(Math.max(data.limit, 1), 100), // Clamp between 1-100
    offset: (Math.max(data.page, 1) - 1) * data.limit,
    sort: data.sort_by,
    order: data.sort_order,
    collection_id: data.collection_id,
    category_id: data.category_id,
  }));

export type CreateFlashcardRequest = z.infer<typeof createFlashcardSchema>;
export type UpdateFlashcardRequest = z.infer<typeof updateFlashcardSchema>;
export type BulkCreateFlashcardsRequest = z.infer<typeof bulkCreateFlashcardsSchema>;
export type FlashcardsListQueryParams = z.infer<typeof flashcardsListQuerySchema>; 