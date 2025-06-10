import type { APIRoute } from 'astro';
import { CollectionsService } from '../../../lib/services/collections.service';
import { 
  createCollectionSchema, 
  collectionsListQuerySchema 
} from '../../../lib/schemas/collections.schema';
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
 * Collections API endpoint
 * GET /api/collections - List collections with pagination
 * POST /api/collections - Create new collection
 */
export const ALL: APIRoute = withErrorHandling(async (context) => {
  const { request } = context;
  
  // Check allowed methods
  checkHTTPMethod(request, ['GET', 'POST']);
  
  // Get authenticated user and Supabase client with session
  const user = await getAuthenticatedUser(context);
  const supabase = await getAuthenticatedSupabaseClient(context);
  
  // Initialize service
  const collectionsService = new CollectionsService(supabase);

  switch (request.method) {
    case 'GET':
      return await handleGetCollections(context, collectionsService, user.id);
    
    case 'POST':
      return await handleCreateCollection(context, collectionsService, user.id);
    
    default:
      // This should never happen due to checkHTTPMethod, but TypeScript needs it
      throw new Error(`Unsupported method: ${request.method}`);
  }
});

/**
 * Handle GET /api/collections
 */
async function handleGetCollections(
  context: any,
  service: CollectionsService,
  userId: string
) {
  const url = new URL(context.request.url);
  
  // Parse and validate query parameters
  const queryParams = parseQueryParams(url);
  const validatedParams = collectionsListQuerySchema.parse(queryParams);
  
  // Get collections from service
  const result = await service.getCollections(userId, validatedParams);
  
  return createJSONResponse(result, 200);
}

/**
 * Handle POST /api/collections
 */
async function handleCreateCollection(
  context: any,
  service: CollectionsService,
  userId: string
) {
  const { request } = context;
  
  // Parse and validate request body
  const requestData = await parseJSONBody(request, createCollectionSchema);
  
  // Create collection via service
  const result = await service.createCollection(userId, requestData);
  
  return createJSONResponse(result, 201);
} 