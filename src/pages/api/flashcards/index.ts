import type { APIRoute } from 'astro';
import { FlashcardsService } from '../../../lib/services/flashcards.service';
import { 
  createFlashcardSchema, 
  flashcardsListQuerySchema 
} from '../../../lib/schemas/flashcards.schema';
import { 
  withErrorHandling,
  getAuthenticatedUser,
  getAuthenticatedSupabaseClient,
  createJSONResponse,
  parseJSONBody,
  parseQueryParams,
  checkHTTPMethod
} from '../../../lib/utils/api-helpers';

export const prerender = false;

/**
 * Flashcards API endpoint
 * GET /api/flashcards - List flashcards with pagination and filtering
 * POST /api/flashcards - Create new flashcard
 */
export const ALL: APIRoute = withErrorHandling(async (context) => {
  const { request } = context;
  
  // Check allowed methods
  checkHTTPMethod(request, ['GET', 'POST']);
  
  // Get authenticated user and Supabase client with session
  const user = await getAuthenticatedUser(context);
  const supabase = await getAuthenticatedSupabaseClient(context);
  
  // Initialize service
  const flashcardsService = new FlashcardsService(supabase);

  switch (request.method) {
    case 'GET':
      return await handleGetFlashcards(context, flashcardsService, user.id);
    
    case 'POST':
      return await handleCreateFlashcard(context, flashcardsService, user.id);
    
    default:
      // This should never happen due to checkHTTPMethod, but TypeScript needs it
      throw new Error(`Unsupported method: ${request.method}`);
  }
});

/**
 * Handle GET /api/flashcards
 */
async function handleGetFlashcards(
  context: any,
  service: FlashcardsService,
  userId: string
) {
  const url = new URL(context.request.url);
  
  // Parse and validate query parameters
  const queryParams = parseQueryParams(url);
  const validatedParams = flashcardsListQuerySchema.parse(queryParams);
  
  // Get flashcards from service
  const result = await service.getFlashcards(userId, validatedParams);
  
  return createJSONResponse(result, 200);
}

/**
 * Handle POST /api/flashcards
 */
async function handleCreateFlashcard(
  context: any,
  service: FlashcardsService,
  userId: string
) {
  const { request } = context;
  
  // Parse and validate request body
  const requestData = await parseJSONBody(request, createFlashcardSchema);
  
  // Create flashcard via service
  const result = await service.createFlashcard(userId, requestData);
  
  return createJSONResponse(result, 201);
} 