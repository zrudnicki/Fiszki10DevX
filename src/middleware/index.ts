import { defineMiddleware } from 'astro:middleware';
import { supabase } from '../db/supabase';

export const onRequest = defineMiddleware(async (context, next) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  // Add auth data to locals
  context.locals.session = session;
  context.locals.user = session?.user ?? null;

  // Handle auth redirects
  const isAuthPage = context.url.pathname === '/login';
  const isCallbackPage = context.url.pathname === '/auth/callback';
  
  if (session && isAuthPage) {
    return context.redirect('/');
  }

  return next();
}); 