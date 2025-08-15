import type { APIRoute } from "astro";
import { AIGenerationService } from "../../../../../lib/services/ai-generation.service";
import { acceptFlashcardsSchema, generationIdSchema } from "../../../../../lib/schemas/ai-generation.schema";
import {
  withErrorHandling,
  getAuthenticatedUser,
  getAuthenticatedSupabaseClient,
  createJSONResponse,
  parseJSONBody,
  extractIdParam,
  checkHTTPMethod,
  APIResponseError,
} from "../../../../../lib/utils/api-helpers";

export const prerender = false;

/**
 * AI Flashcard Acceptance API endpoint
 * POST /api/generate/flashcards/{id}/accept - Accept AI-generated flashcards
 */
export const ALL: APIRoute = withErrorHandling(async (context) => {
  const { request } = context;

  // Check allowed methods
  checkHTTPMethod(request, ["POST"]);

  // Get authenticated user and Supabase client with session
  const user = await getAuthenticatedUser(context);
  const supabase = await getAuthenticatedSupabaseClient(context);

  // Extract and validate generation ID
  const generationId = extractIdParam(context, "id");
  const validatedId = generationIdSchema.parse({ id: generationId });

  // Initialize service
  const aiGenerationService = new AIGenerationService(supabase);

  return await handleAcceptFlashcards(context, aiGenerationService, user.id, validatedId.id);
});

/**
 * Handle POST /api/generate/flashcards/{id}/accept
 */
async function handleAcceptFlashcards(
  context: { request: Request },
  service: AIGenerationService,
  userId: string,
  generationId: string
) {
  const { request } = context;

  try {
    // Parse and validate request body
    const requestData = await parseJSONBody(request, acceptFlashcardsSchema);

    // Accept flashcards via service
    const result = await service.acceptFlashcards(userId, generationId, requestData);

    return createJSONResponse(result, 201);
  } catch (error: unknown) {
    const err = error as Error;
    // Handle session-related errors
    if (
      err.message.includes("Generation session not found") ||
      err.message.includes("Generation session has expired")
    ) {
      throw new APIResponseError(404, "Not Found", err.message);
    }

    if (err.message.includes("Generation session does not belong to user")) {
      throw new APIResponseError(403, "Forbidden", err.message);
    }

    // Handle validation errors
    if (err.message.includes("not found or does not belong to user")) {
      throw new APIResponseError(404, "Not Found", err.message);
    }

    // Re-throw other errors to be handled by global error handler
    throw err;
  }
}
