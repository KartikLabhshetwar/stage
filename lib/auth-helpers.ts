/**
 * Helper functions for Better Auth
 * This file provides convenience functions for authentication operations
 */

import { authClient } from "./auth-client";
import { socialSignInSchema } from "./validations/auth";

/**
 * Sign in with Google OAuth
 * @param callbackURL - Optional callback URL after successful authentication
 */
export async function signInWithGoogle(callbackURL?: string) {
  const validated = socialSignInSchema.parse({
    provider: "google" as const,
    callbackURL,
  });

  return await authClient.signIn.social({
    provider: "google",
    callbackURL: validated.callbackURL,
  });
}

/**
 * Sign up with email and password
 * @param email - User's email address
 * @param password - User's password
 * @param name - User's name (optional)
 */
export async function signUpWithEmail(email: string, password: string, name?: string) {
  return await authClient.signUp.email({
    email,
    password,
    name: name || email.split("@")[0], // Use email prefix if name not provided
  });
}

/**
 * Sign in with email and password
 * @param email - User's email address
 * @param password - User's password
 */
export async function signInWithEmail(email: string, password: string) {
  return await authClient.signIn.email({
    email,
    password,
  });
}

/**
 * Get the current session
 * @returns Session data or null if not authenticated
 */
export async function getSession() {
  const session = await authClient.getSession();
  return session.data;
}

/**
 * Sign out the current user
 */
export async function signOutUser() {
  return await authClient.signOut();
}

/**
 * Check if user is authenticated
 * @returns true if user has a valid session
 */
export async function isAuthenticated() {
  const session = await getSession();
  return !!session;
}

