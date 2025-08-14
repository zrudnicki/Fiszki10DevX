import type { APIRoute } from "astro";
import { CategoriesService } from "../../../lib/services/categories.service";
import { updateCategorySchema, categoryIdSchema } from "../../../lib/schemas/categories.schema";
import {
  withErrorHandling,
  getAuthenticatedUser,
  getAuthenticatedSupabaseClient,
  createJSONResponse,
  parseJSONBody,
  extractIdParam,
  checkHTTPMethod,
  APIResponseError,
} from "../../../lib/utils/api-helpers";

export const prerender = false;

/**
 * Individual Category API endpoint
 * GET /api/categories/{id} - Get single category
 * PUT /api/categories/{id} - Update category
 * DELETE /api/categories/{id} - Delete category
 */
export const ALL: APIRoute = withErrorHandling(async (context) => {
  const { request } = context;

  // Check allowed methods
  checkHTTPMethod(request, ["GET", "PUT", "DELETE"]);

  // Get authenticated user and Supabase client with session
  const user = await getAuthenticatedUser(context);
  const supabase = await getAuthenticatedSupabaseClient(context);

  // Extract and validate category ID
  const categoryId = extractIdParam(context, "id");
  const validatedId = categoryIdSchema.parse({ id: categoryId });

  // Initialize service
  const categoriesService = new CategoriesService(supabase);

  switch (request.method) {
    case "GET":
      return await handleGetCategory(categoriesService, user.id, validatedId.id);

    case "PUT":
      return await handleUpdateCategory(context, categoriesService, user.id, validatedId.id);

    case "DELETE":
      return await handleDeleteCategory(categoriesService, user.id, validatedId.id);

    default:
      // This should never happen due to checkHTTPMethod, but TypeScript needs it
      throw new Error(`Unsupported method: ${request.method}`);
  }
});

/**
 * Handle GET /api/categories/{id}
 */
async function handleGetCategory(service: CategoriesService, userId: string, categoryId: string) {
  const result = await service.getCategoryById(userId, categoryId);

  if (!result) {
    throw new APIResponseError(404, "Not Found", "Category not found");
  }

  return createJSONResponse(result, 200);
}

/**
 * Handle PUT /api/categories/{id}
 */
async function handleUpdateCategory(context: any, service: CategoriesService, userId: string, categoryId: string) {
  const { request } = context;

  // Parse and validate request body
  const requestData = await parseJSONBody(request, updateCategorySchema);

  // Update category via service
  const result = await service.updateCategory(userId, categoryId, requestData);

  if (!result) {
    throw new APIResponseError(404, "Not Found", "Category not found");
  }

  return createJSONResponse(result, 200);
}

/**
 * Handle DELETE /api/categories/{id}
 */
async function handleDeleteCategory(service: CategoriesService, userId: string, categoryId: string) {
  const success = await service.deleteCategory(userId, categoryId);

  if (!success) {
    throw new APIResponseError(404, "Not Found", "Category not found");
  }

  // Return 204 No Content for successful deletion
  return new Response(null, { status: 204 });
}
