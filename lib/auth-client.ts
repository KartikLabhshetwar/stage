import { createAuthClient } from "better-auth/react";

/**
 * Create Better Auth client
 * baseURL is auto-detected from the current origin in the browser.
 * For explicit configuration, set NEXT_PUBLIC_BETTER_AUTH_URL environment variable.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.BETTER_AUTH_URL || undefined,
});

// Export commonly used methods for convenience
export const { signIn, signOut, useSession } = authClient;

