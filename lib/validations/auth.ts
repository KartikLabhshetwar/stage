import { z } from "zod";

/**
 * Schema for Google OAuth callback validation
 */
export const googleOAuthCallbackSchema = z.object({
  code: z.string().min(1, "Authorization code is required"),
  state: z.string().optional(),
});

/**
 * Schema for social provider sign-in
 * callbackURL can be a relative path (e.g., "/home") or an absolute URL
 */
export const socialSignInSchema = z.object({
  provider: z.literal("google"),
  callbackURL: z
    .string()
    .refine(
      (val) => {
        if (!val) return true; // Optional field
        // Accept relative paths (starting with /)
        if (val.startsWith("/")) return true;
        // Accept absolute URLs
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      {
        message: "callbackURL must be a relative path (starting with /) or a valid absolute URL",
      }
    )
    .optional(),
});

/**
 * Type exports
 */
export type GoogleOAuthCallbackInput = z.infer<typeof googleOAuthCallbackSchema>;
export type SocialSignInInput = z.infer<typeof socialSignInSchema>;

