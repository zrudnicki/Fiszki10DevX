import type { APIRoute } from "astro";
import { StudyService } from "../../../lib/services/study.service";
import { startStudySessionSchema } from "../../../lib/schemas/study.schema";
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
 * Study Next API endpoint
 * POST /api/study/next - Start a new study session
 */
export const ALL: APIRoute = withErrorHandling(async (context) => {
  const { request } = context;

  // Check allowed methods
  checkHTTPMethod(request, ["POST"]);

  // Get authenticated user and Supabase client with session
  const user = await getAuthenticatedUser(context);
  const supabase = await getAuthenticatedSupabaseClient(context);

  // Initialize service
  const studyService = new StudyService(supabase, user.id);

  switch (request.method) {
    case "POST":
      return await handleStartStudySession(context, studyService);

    default:
      throw new Error(`Unsupported method: ${request.method}`);
  }
});

/**
 * Handle POST /api/study/next
 */
async function handleStartStudySession(context: any, service: StudyService) {
  const { request } = context;

  // Parse and validate request body
  const requestData = await parseJSONBody(request, startStudySessionSchema);

  // Start study session via service
  const session = await service.startStudySession(requestData);

  return createJSONResponse(session, 201);
}
