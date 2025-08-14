import type { APIContext } from "astro";
import { ZodError } from "zod";
import type { APIError } from "../../types/dto.types";

/**
 * Extract user from Supabase session in context
 */
export async function getAuthenticatedUser(context: APIContext) {
  // First try to get user from locals (server-side session)
  let user = context.locals.user;

  // If no user in locals, try to get from Authorization header
  if (!user) {
    const authHeader = context.request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const {
          data: { user: tokenUser },
          error,
        } = await context.locals.supabase.auth.getUser(token);
        if (!error && tokenUser) {
          user = tokenUser;
        }
      } catch (error) {
        console.warn("Failed to validate token:", error);
      }
    }
  }

  if (!user) {
    throw new APIResponseError(401, "Unauthorized", "Authentication required");
  }

  return user;
}

/**
 * Get Supabase client with user session set (for RLS)
 */
export async function getAuthenticatedSupabaseClient(context: APIContext) {
  const authHeader = context.request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      // Verify the token is valid first
      const {
        data: { user },
        error,
      } = await context.locals.supabase.auth.getUser(token);
      if (error || !user) {
        console.warn("Invalid token for Supabase client:", error);
        return context.locals.supabase;
      }

      // Create a new Supabase client with the access token
      const { createClient } = await import("@supabase/supabase-js");
      const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        console.warn("Missing Supabase environment variables");
        return context.locals.supabase;
      }

      const authenticatedClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      return authenticatedClient;
    } catch (error) {
      console.warn("Failed to create authenticated Supabase client:", error);
    }
  }

  // Return the original client if no token or setup failed
  return context.locals.supabase;
}

/**
 * Create standardized JSON response
 */
export function createJSONResponse(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

/**
 * Create error response
 */
export function createErrorResponse(status: number, error: string, message?: string, details?: unknown): Response {
  const errorData: APIError = {
    error,
    message,
    details,
  };

  return createJSONResponse(errorData, status);
}

/**
 * Custom API Response Error class
 */
export class APIResponseError extends Error {
  constructor(
    public status: number,
    public error: string,
    public message?: string,
    public details?: unknown
  ) {
    super(message || error);
    this.name = "APIResponseError";
  }

  toResponse(): Response {
    return createErrorResponse(this.status, this.error, this.message, this.details);
  }
}

/**
 * Global API error handler
 */
export function handleAPIError(error: unknown): Response {
  console.error("API Error:", error);

  // Handle custom API errors
  if (error instanceof APIResponseError) {
    return error.toResponse();
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return createErrorResponse(400, "Validation failed", "Request validation failed", error.errors);
  }

  // Handle standard errors
  if (error instanceof Error) {
    // Check for specific Supabase/database errors
    if (error.message.includes("permission denied") || error.message.includes("RLS")) {
      return createErrorResponse(403, "Forbidden", "Access denied");
    }

    if (error.message.includes("not found")) {
      return createErrorResponse(404, "Not Found", error.message);
    }

    // Generic server error
    return createErrorResponse(500, "Internal Server Error", "An unexpected error occurred");
  }

  // Fallback for unknown errors
  return createErrorResponse(500, "Internal Server Error", "An unexpected error occurred");
}

/**
 * Async wrapper for API handlers with error handling
 */
export function withErrorHandling(handler: (context: APIContext) => Promise<Response>) {
  return async (context: APIContext): Promise<Response> => {
    try {
      return await handler(context);
    } catch (error) {
      return handleAPIError(error);
    }
  };
}

/**
 * Parse and validate query parameters
 */
export function parseQueryParams(url: URL): Record<string, string | undefined> {
  const params: Record<string, string | undefined> = {};

  for (const [key, value] of url.searchParams.entries()) {
    params[key] = value || undefined;
  }

  return params;
}

/**
 * Parse JSON request body with validation
 */
export async function parseJSONBody<T>(request: Request, schema?: { parse: (data: unknown) => T }): Promise<T> {
  try {
    const text = await request.text();

    if (!text.trim()) {
      throw new APIResponseError(400, "Bad Request", "Request body is required");
    }

    const data = JSON.parse(text);

    if (schema) {
      return schema.parse(data);
    }

    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new APIResponseError(400, "Bad Request", "Invalid JSON in request body");
    }

    throw error; // Re-throw validation errors and custom errors
  }
}

/**
 * Check if HTTP method is allowed
 */
export function checkHTTPMethod(request: Request, allowedMethods: string[]): void {
  if (!allowedMethods.includes(request.method)) {
    throw new APIResponseError(
      405,
      "Method Not Allowed",
      `Method ${request.method} not allowed. Allowed methods: ${allowedMethods.join(", ")}`
    );
  }
}

/**
 * Extract ID parameter from URL
 */
export function extractIdParam(context: APIContext, paramName = "id"): string {
  const id = context.params[paramName];

  if (!id || typeof id !== "string") {
    throw new APIResponseError(400, "Bad Request", `Invalid ${paramName} parameter`);
  }

  return id;
}
