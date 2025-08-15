import type { APIRoute } from "astro";
import { CollectionsService } from "../../../lib/services/collections.service";
import { updateCollectionSchema, collectionIdSchema } from "../../../lib/schemas/collections.schema";
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
 * Individual Collection API endpoint
 * GET /api/collections/{id} - Get single collection
 * PUT /api/collections/{id} - Update collection
 * DELETE /api/collections/{id} - Delete collection
 */
export const ALL: APIRoute = withErrorHandling(async (context) => {
  const { request } = context;

  // Check allowed methods
  checkHTTPMethod(request, ["GET", "PUT", "DELETE"]);

  // Get authenticated user and Supabase client with session
  const user = await getAuthenticatedUser(context);
  const supabase = await getAuthenticatedSupabaseClient(context);

  // Extract and validate collection ID
  const collectionId = extractIdParam(context, "id");
  const validatedId = collectionIdSchema.parse({ id: collectionId });

  // Initialize service
  const collectionsService = new CollectionsService(supabase);

  switch (request.method) {
    case "GET":
      return await handleGetCollection(collectionsService, user.id, validatedId.id);

    case "PUT":
      return await handleUpdateCollection(context, collectionsService, user.id, validatedId.id);

    case "DELETE":
      return await handleDeleteCollection(collectionsService, user.id, validatedId.id);

    default:
      // This should never happen due to checkHTTPMethod, but TypeScript needs it
      throw new Error(`Unsupported method: ${request.method}`);
  }
});

/**
 * Handle GET /api/collections/{id}
 */
async function handleGetCollection(service: CollectionsService, userId: string, collectionId: string) {
  const result = await service.getCollectionById(userId, collectionId);

  if (!result) {
    throw new APIResponseError(404, "Not Found", "Collection not found");
  }

  return createJSONResponse(result, 200);
}

/**
 * Handle PUT /api/collections/{id}
 */
async function handleUpdateCollection(
  context: { request: Request },
  service: CollectionsService,
  userId: string,
  collectionId: string
) {
  const { request } = context;

  // Parse and validate request body
  const requestData = await parseJSONBody(request, updateCollectionSchema);

  // Update collection via service
  const result = await service.updateCollection(userId, collectionId, requestData);

  if (!result) {
    throw new APIResponseError(404, "Not Found", "Collection not found");
  }

  return createJSONResponse(result, 200);
}

/**
 * Handle DELETE /api/collections/{id}
 */
async function handleDeleteCollection(service: CollectionsService, userId: string, collectionId: string) {
  const success = await service.deleteCollection(userId, collectionId);

  if (!success) {
    throw new APIResponseError(404, "Not Found", "Collection not found");
  }

  // Return 204 No Content for successful deletion
  return new Response(null, { status: 204 });
}
