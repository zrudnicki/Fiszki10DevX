import type { APIRoute } from "astro";
import { FlashcardsService } from "../../../lib/services/flashcards.service";
import { bulkCreateFlashcardsSchema } from "../../../lib/schemas/flashcards.schema";
import {
  withErrorHandling,
  getAuthenticatedUser,
  getAuthenticatedSupabaseClient,
  createJSONResponse,
  parseJSONBody,
  checkHTTPMethod,
} from "../../../lib/utils/api-helpers";

export const prerender = false;

/**
 * Bulk Flashcards API endpoint
 * POST /api/flashcards/bulk - Create multiple flashcards
 */
export const ALL: APIRoute = withErrorHandling(async (context) => {
  const { request } = context;

  // Check allowed methods
  checkHTTPMethod(request, ["POST"]);

  // Get authenticated user and Supabase client with session
  const user = await getAuthenticatedUser(context);
  const supabase = await getAuthenticatedSupabaseClient(context);

  // Initialize service
  const flashcardsService = new FlashcardsService(supabase);

  return await handleBulkCreateFlashcards(context, flashcardsService, user.id);
});

/**
 * Handle POST /api/flashcards/bulk
 */
async function handleBulkCreateFlashcards(context: any, service: FlashcardsService, userId: string) {
  const { request } = context;

  // Parse and validate request body
  const requestData = await parseJSONBody(request, bulkCreateFlashcardsSchema);

  // Create flashcards via service
  const result = await service.createFlashcardsBulk(userId, requestData);

  return createJSONResponse(result, 201);
}
