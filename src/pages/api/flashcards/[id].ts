import type { APIRoute } from "astro";
import { FlashcardsService } from "../../../lib/services/flashcards.service";
import { updateFlashcardSchema, flashcardIdSchema } from "../../../lib/schemas/flashcards.schema";
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
 * Individual Flashcard API endpoint
 * GET /api/flashcards/{id} - Get single flashcard
 * PUT /api/flashcards/{id} - Update flashcard
 * DELETE /api/flashcards/{id} - Delete flashcard
 */
export const ALL: APIRoute = withErrorHandling(async (context) => {
  const { request } = context;

  // Check allowed methods
  checkHTTPMethod(request, ["GET", "PUT", "DELETE"]);

  // Get authenticated user and Supabase client with session
  const user = await getAuthenticatedUser(context);
  const supabase = await getAuthenticatedSupabaseClient(context);

  // Extract and validate flashcard ID
  const flashcardId = extractIdParam(context, "id");
  const validatedId = flashcardIdSchema.parse({ id: flashcardId });

  // Initialize service
  const flashcardsService = new FlashcardsService(supabase);

  switch (request.method) {
    case "GET":
      return await handleGetFlashcard(flashcardsService, user.id, validatedId.id);

    case "PUT":
      return await handleUpdateFlashcard(context, flashcardsService, user.id, validatedId.id);

    case "DELETE":
      return await handleDeleteFlashcard(flashcardsService, user.id, validatedId.id);

    default:
      // This should never happen due to checkHTTPMethod, but TypeScript needs it
      throw new Error(`Unsupported method: ${request.method}`);
  }
});

/**
 * Handle GET /api/flashcards/{id}
 */
async function handleGetFlashcard(service: FlashcardsService, userId: string, flashcardId: string) {
  const result = await service.getFlashcardById(userId, flashcardId);

  if (!result) {
    throw new APIResponseError(404, "Not Found", "Flashcard not found");
  }

  return createJSONResponse(result, 200);
}

/**
 * Handle PUT /api/flashcards/{id}
 */
async function handleUpdateFlashcard(context: any, service: FlashcardsService, userId: string, flashcardId: string) {
  const { request } = context;

  // Parse and validate request body
  const requestData = await parseJSONBody(request, updateFlashcardSchema);

  // Update flashcard via service
  const result = await service.updateFlashcard(userId, flashcardId, requestData);

  if (!result) {
    throw new APIResponseError(404, "Not Found", "Flashcard not found");
  }

  return createJSONResponse(result, 200);
}

/**
 * Handle DELETE /api/flashcards/{id}
 */
async function handleDeleteFlashcard(service: FlashcardsService, userId: string, flashcardId: string) {
  const success = await service.deleteFlashcard(userId, flashcardId);

  if (!success) {
    throw new APIResponseError(404, "Not Found", "Flashcard not found");
  }

  // Return 204 No Content for successful deletion
  return new Response(null, { status: 204 });
}
