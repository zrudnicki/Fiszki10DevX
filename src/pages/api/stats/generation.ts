import type { APIRoute } from "astro";
import { StatisticsService } from "../../../lib/services/statistics.service";
import { updateGenerationStatsSchema } from "../../../lib/schemas/statistics.schema";
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
 * Statistics Generation API endpoint
 * GET /api/stats/generation - Get AI generation statistics
 * PUT /api/stats/generation - Update AI generation statistics
 */
export const ALL: APIRoute = withErrorHandling(async (context) => {
  const { request } = context;

  // Check allowed methods
  checkHTTPMethod(request, ["GET", "PUT"]);

  // Get authenticated user and Supabase client with session
  const user = await getAuthenticatedUser(context);
  const supabase = await getAuthenticatedSupabaseClient(context);

  // Initialize service
  const statisticsService = new StatisticsService(supabase, user.id);

  switch (request.method) {
    case "GET":
      return await handleGetGenerationStats(statisticsService);

    case "PUT":
      return await handleUpdateGenerationStats(context, statisticsService);

    default:
      throw new Error(`Unsupported method: ${request.method}`);
  }
});

/**
 * Handle GET /api/stats/generation
 */
async function handleGetGenerationStats(service: StatisticsService) {
  const stats = await service.getGenerationStats();
  return createJSONResponse(stats, 200);
}

/**
 * Handle PUT /api/stats/generation
 */
async function handleUpdateGenerationStats(context: any, service: StatisticsService) {
  const { request } = context;

  // Parse and validate request body
  const updates = await parseJSONBody(request, updateGenerationStatsSchema);

  // Update statistics via service
  const updatedStats = await service.updateGenerationStats(updates);

  return createJSONResponse(updatedStats, 200);
}
