import { z } from 'zod';

// Request schemas
export const createCollectionSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters'),
  description: z.string()
    .max(500, 'Description must be at most 500 characters')
    .optional()
    .nullable(),
});

export const updateCollectionSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters')
    .optional(),
  description: z.string()
    .max(500, 'Description must be at most 500 characters')
    .optional()
    .nullable(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

// Query parameters schemas
export const collectionsListQuerySchema = z.object({
  limit: z.coerce.number()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must be at most 100')
    .default(50),
  offset: z.coerce.number()
    .min(0, 'Offset must be non-negative')
    .default(0),
  sort: z.enum(['name', 'created_at']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const collectionIdSchema = z.object({
  id: z.string().uuid('Invalid collection ID format'),
});

// Response schemas
export const collectionDTOSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  flashcard_count: z.number().int().min(0),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const collectionsListResponseSchema = z.object({
  data: z.array(collectionDTOSchema),
  pagination: z.object({
    total: z.number().int().min(0),
    limit: z.number().int().min(1),
    offset: z.number().int().min(0),
  }),
});

// Type exports
export type CreateCollectionRequest = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionRequest = z.infer<typeof updateCollectionSchema>;
export type CollectionsListQuery = z.infer<typeof collectionsListQuerySchema>;
export type CollectionId = z.infer<typeof collectionIdSchema>;
export type CollectionDTO = z.infer<typeof collectionDTOSchema>;
export type CollectionsListResponse = z.infer<typeof collectionsListResponseSchema>; 