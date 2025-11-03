import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { nextCookies } from "better-auth/next-js";

const prisma = new PrismaClient();

/**
 * Better Auth Configuration
 * 
 * This configuration includes:
 * - Email/Password authentication
 * - Google OAuth provider
 * - Enhanced session management with cookie caching
 * - Email verification support
 * - Secure cookie settings for production
 * 
 * Required Environment Variables:
 * - BETTER_AUTH_SECRET: Secret key for encryption and hashing (required)
 * - BETTER_AUTH_URL: Base URL of your application (optional, defaults to http://localhost:3000)
 * - GOOGLE_CLIENT_ID: Google OAuth client ID (required for Google OAuth)
 * - GOOGLE_CLIENT_SECRET: Google OAuth client secret (required for Google OAuth)
 * - DATABASE_URL: PostgreSQL connection string (required)
 */
// Validate that required environment variables are set
if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error(
    "BETTER_AUTH_SECRET environment variable is required. " +
    "Generate one using: openssl rand -base64 32"
  );
}

export const auth = betterAuth({
  // Secret key for encryption and hashing
  // This is REQUIRED for secure authentication
  // Generate one using: openssl rand -base64 32
  // Better Auth will also automatically read from process.env.BETTER_AUTH_SECRET
  // but we set it explicitly here for clarity
  secret: process.env.BETTER_AUTH_SECRET,
  
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  
  // Email/Password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true if you want email verification
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  
  // Social providers (Google OAuth)
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  
  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      strategy: "jwe", // Encrypted tokens for better security
    },
  },
  
  // Trusted origins for CORS
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  ].filter(Boolean) as string[],
  
  // Base path for auth endpoints
  basePath: "/api/auth",
  
  // Base URL (used for redirects and OAuth callbacks)
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  
  // Next.js cookies plugin for Server Actions support
  plugins: [nextCookies()],
});

