import { defineMiddleware } from "astro:middleware";
import { supabase } from "../db/supabase";

export const onRequest = defineMiddleware(async (context, next) => {
  // Add Supabase client to locals for API endpoints
  context.locals.supabase = supabase;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Add auth data to locals
  context.locals.session = session;
  context.locals.user = session?.user ?? null;

  // Handle API routes differently from page routes
  const isAPIRoute = context.url.pathname.startsWith("/api/");

  if (isAPIRoute) {
    // For API routes, don't redirect - let the endpoint handle auth
    // The API helpers will throw proper 401 errors if needed
    return next();
  }

  // Handle page auth redirects
  const isAuthPage = context.url.pathname === "/login";
  const isCallbackPage = context.url.pathname === "/auth/callback";

  if (session && isAuthPage) {
    return context.redirect("/");
  }

  return next();
});
