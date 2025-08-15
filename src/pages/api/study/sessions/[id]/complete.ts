import type { APIRoute } from "astro";
import { StudyService } from "../../../../../lib/services/study.service";
import { completeSessionSchema } from "../../../../../lib/schemas/study.schema";
import {
  withErrorHandling,
  getAuthenticatedUser,
  getAuthenticatedSupabaseClient,
  createJSONResponse,
  parseJSONBody,
  checkHTTPMethod,
  extractIdParam,
} from "../../../../../lib/utils/api-helpers";

export const prerender = false;

/**
 * Study Session Complete API endpoint
 * PUT /api/study/sessions/{id}/complete - Complete a study session
 */
export const ALL: APIRoute = withErrorHandling(async (context) => {
  const { request } = context;

  // Check allowed methods
  checkHTTPMethod(request, ["PUT"]);

  // Extract session ID from URL
  const sessionId = extractIdParam(context);

  // Get authenticated user and Supabase client with session
  const user = await getAuthenticatedUser(context);
  const supabase = await getAuthenticatedSupabaseClient(context);

  // Initialize service
  const studyService = new StudyService(supabase, user.id);

  switch (request.method) {
    case "PUT":
      return await handleCompleteSession(context, studyService, sessionId);

    default:
      throw new Error(`Unsupported method: ${request.method}`);
  }
});

/**
 * Handle PUT /api/study/sessions/{id}/complete
 */
async function handleCompleteSession(context: { request: Request }, service: StudyService, sessionId: string) {
  const { request } = context;

  // Parse and validate request body
  const requestData = await parseJSONBody(request, completeSessionSchema);

  // Complete study session via service
  const completedSession = await service.completeStudySession(sessionId, requestData);

  return createJSONResponse(completedSession, 200);
}
