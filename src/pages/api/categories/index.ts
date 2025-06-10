import type { APIRoute } from 'astro';
import { CategoriesService } from '../../../lib/services/categories.service';
import { 
  createCategorySchema, 
  categoriesListQuerySchema 
} from '../../../lib/schemas/categories.schema';
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
 * Categories API endpoint
 * GET /api/categories - List categories with pagination
 * POST /api/categories - Create new category
 */
export const ALL: APIRoute = withErrorHandling(async (context) => {
  const { request } = context;
  
  // Check allowed methods
  checkHTTPMethod(request, ['GET', 'POST']);
  
  // Get authenticated user and Supabase client with session
  const user = await getAuthenticatedUser(context);
  const supabase = await getAuthenticatedSupabaseClient(context);
  
  // Initialize service
  const categoriesService = new CategoriesService(supabase);

  switch (request.method) {
    case 'GET':
      return await handleGetCategories(context, categoriesService, user.id);
    
    case 'POST':
      return await handleCreateCategory(context, categoriesService, user.id);
    
    default:
      // This should never happen due to checkHTTPMethod, but TypeScript needs it
      throw new Error(`Unsupported method: ${request.method}`);
  }
});

/**
 * Handle GET /api/categories
 */
async function handleGetCategories(
  context: any,
  service: CategoriesService,
  userId: string
) {
  const url = new URL(context.request.url);
  
  // Parse and validate query parameters
  const queryParams = parseQueryParams(url);
  const validatedParams = categoriesListQuerySchema.parse(queryParams);
  
  // Get categories from service
  const result = await service.getCategories(userId, validatedParams);
  
  return createJSONResponse(result, 200);
}

/**
 * Handle POST /api/categories
 */
async function handleCreateCategory(
  context: any,
  service: CategoriesService,
  userId: string
) {
  const { request } = context;
  
  // Parse and validate request body
  const requestData = await parseJSONBody(request, createCategorySchema);
  
  // Create category via service
  const result = await service.createCategory(userId, requestData);
  
  return createJSONResponse(result, 201);
} 