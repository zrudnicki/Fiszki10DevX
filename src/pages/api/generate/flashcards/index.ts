import type { APIRoute } from "astro";
import { AIGenerationService } from "../../../../lib/services/ai-generation.service";
import { generateFlashcardsSchema } from "../../../../lib/schemas/ai-generation.schema";
import {
  withErrorHandling,
  getAuthenticatedUser,
  getAuthenticatedSupabaseClient,
  createJSONResponse,
  parseJSONBody,
  checkHTTPMethod,
  APIResponseError,
} from "../../../../lib/utils/api-helpers";

export const prerender = false;

/**
 * AI Flashcard Generation API endpoint
 * POST /api/generate/flashcards - Generate flashcards from text using AI
 */
export const ALL: APIRoute = withErrorHandling(async (context) => {
  const { request } = context;

  // Check allowed methods
  checkHTTPMethod(request, ["POST"]);

  // Get authenticated user and Supabase client with session
  const user = await getAuthenticatedUser(context);
  const supabase = await getAuthenticatedSupabaseClient(context);

  // Initialize service
  const aiGenerationService = new AIGenerationService(supabase);

  return await handleGenerateFlashcards(context, aiGenerationService, user.id);
});

/**
 * Handle POST /api/generate/flashcards
 */
async function handleGenerateFlashcards(context: any, service: AIGenerationService, userId: string) {
  const { request } = context;

  try {
    // Parse and validate request body
    const requestData = await parseJSONBody(request, generateFlashcardsSchema);

    // Generate flashcards via service
    const result = await service.generateFlashcards(userId, requestData);

    return createJSONResponse(result, 200);
  } catch (error: any) {
    // Handle rate limiting specifically
    if (error.message.includes("Rate limit exceeded")) {
      throw new APIResponseError(429, "Too Many Requests", error.message);
    }

    // Handle AI configuration errors
    if (error.message.includes("AI generation is not configured")) {
      throw new APIResponseError(503, "Service Unavailable", error.message);
    }

    // Handle OpenRouter API errors
    if (error.message.includes("OpenRouter API error")) {
      throw new APIResponseError(502, "Bad Gateway", "AI service is temporarily unavailable");
    }

    // Handle validation errors
    if (error.message.includes("not found or does not belong to user")) {
      throw new APIResponseError(404, "Not Found", error.message);
    }

    // Re-throw other errors to be handled by global error handler
    throw error;
  }
}
