import type { APIRoute } from "astro";
import { StatisticsService } from "../../../lib/services/statistics.service";
import { learningStatsQuerySchema } from "../../../lib/schemas/statistics.schema";
import {
  withErrorHandling,
  getAuthenticatedUser,
  getAuthenticatedSupabaseClient,
  createJSONResponse,
  parseQueryParams,
  checkHTTPMethod,
} from "../../../lib/utils/api-helpers";

export const prerender = false;

/**
 * Statistics Learning API endpoint
 * GET /api/stats/learning - Get learning statistics
 * Query parameters: collection_id?, period? (week|month|year|all)
 */
export const ALL: APIRoute = withErrorHandling(async (context) => {
  const { request } = context;

  // Check allowed methods
  checkHTTPMethod(request, ["GET"]);

  // Get authenticated user and Supabase client with session
  const user = await getAuthenticatedUser(context);
  const supabase = await getAuthenticatedSupabaseClient(context);

  // Initialize service
  const statisticsService = new StatisticsService(supabase, user.id);

  switch (request.method) {
    case "GET":
      return await handleGetLearningStats(context, statisticsService);

    default:
      throw new Error(`Unsupported method: ${request.method}`);
  }
});

/**
 * Handle GET /api/stats/learning
 */
async function handleGetLearningStats(context: { request: Request }, service: StatisticsService) {
  const url = new URL(context.request.url);

  // Parse and validate query parameters
  const queryParams = parseQueryParams(url);
  const validatedQuery = learningStatsQuerySchema.parse(queryParams);

  // Get learning statistics from service
  const stats = await service.getLearningStats(validatedQuery);

  return createJSONResponse(stats, 200);
}
