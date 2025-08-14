import { z } from "zod";

/**
 * Base validation schemas
 */
export const categoryIdSchema = z.object({
  id: z.string().uuid("Invalid category ID format"),
});

export const categoryNameSchema = z
  .string()
  .min(1, "Category name is required")
  .max(100, "Category name must be less than 100 characters")
  .trim();

/**
 * Request validation schemas
 */
export const createCategorySchema = z.object({
  name: categoryNameSchema,
});

export const updateCategorySchema = z.object({
  name: categoryNameSchema.optional(),
});

/**
 * Query parameters validation
 */
export const categoriesListQuerySchema = z
  .object({
    page: z.string().regex(/^\d+$/).transform(Number).default("1"),
    limit: z.string().regex(/^\d+$/).transform(Number).default("20"),
    sort_by: z.enum(["created_at", "name", "updated_at"]).default("created_at"),
    sort_order: z.enum(["asc", "desc"]).default("desc"),
  })
  .transform((data) => ({
    limit: Math.min(Math.max(data.limit, 1), 100), // Clamp between 1-100
    offset: (Math.max(data.page, 1) - 1) * data.limit,
    sort: data.sort_by,
    order: data.sort_order,
  }));

export type CreateCategoryRequest = z.infer<typeof createCategorySchema>;
export type UpdateCategoryRequest = z.infer<typeof updateCategorySchema>;
export type CategoriesListQuery = z.infer<typeof categoriesListQuerySchema>;
