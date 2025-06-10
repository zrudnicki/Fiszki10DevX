import type { APIRoute } from "astro";
import { StudyService } from "../../../../../lib/services/study.service";
import { reviewFlashcardSchema, batchReviewSchema } from "../../../../../lib/schemas/study.schema";
import { 
  withErrorHandling,
  getAuthenticatedUser,
  getAuthenticatedSupabaseClient,
  createJSONResponse,
  parseJSONBody,
  checkHTTPMethod,
  extractIdParam
} from "../../../../../lib/utils/api-helpers";

export const prerender = false;

/**
 * Study Session Review API endpoint
 * POST /api/study/sessions/{id}/review - Review flashcard(s) in study session
 */
export const ALL: APIRoute = withErrorHandling(async (context) => {
  const { request } = context;
  
  // Check allowed methods
  checkHTTPMethod(request, ['POST']);
  
  // Extract session ID from URL
  const sessionId = extractIdParam(context);
  
  // Get authenticated user and Supabase client with session
  const user = await getAuthenticatedUser(context);
  const supabase = await getAuthenticatedSupabaseClient(context);
  
  // Initialize service
  const studyService = new StudyService(supabase, user.id);

  switch (request.method) {
    case 'POST':
      return await handleReviewFlashcards(context, studyService, sessionId);
    
    default:
      throw new Error(`Unsupported method: ${request.method}`);
  }
});

/**
 * Handle POST /api/study/sessions/{id}/review
 */
async function handleReviewFlashcards(context: any, service: StudyService, sessionId: string) {
  const { request } = context;
  
  // Parse request body as JSON first to determine if it's single or batch review
  const rawBody = await request.text();
  let parsedBody;
  
  try {
    parsedBody = JSON.parse(rawBody);
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
  
  // Check if it's a batch review (has 'reviews' array) or single review
  if (parsedBody.reviews && Array.isArray(parsedBody.reviews)) {
    // Batch review
    const requestData = batchReviewSchema.parse(parsedBody);
    const result = await service.batchReviewFlashcards(sessionId, requestData);
    
    return createJSONResponse(result, 200);
  } else {
    // Single review
    const requestData = reviewFlashcardSchema.parse(parsedBody);
    const result = await service.reviewFlashcard(sessionId, requestData);
    
    return createJSONResponse(result, 200);
  }
} 