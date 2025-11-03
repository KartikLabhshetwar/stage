import { EditorLayout } from "@/components/editor/EditorLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Protected Editor Page - SaaS Application
 * 
 * This page requires authentication. The proxy middleware handles
 * optimistic redirects, but we perform a full server-side session
 * validation here as a defense-in-depth security measure.
 * 
 * If the user is not authenticated, they will be redirected to the sign-in page.
 */
export default async function EditorPage() {
  // Full server-side session validation against database
  // This is the final security check before rendering protected content
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect unauthenticated users to sign-in page
  // This should rarely happen as the proxy middleware handles this,
  // but serves as an additional security layer
  if (!session) {
    redirect("/sign-in?redirect=/home");
  }

  // Session is valid - user is authenticated
  // The session object contains:
  // - session.user: { id, name, email, emailVerified, image }
  // - session.session: { id, expiresAt, token }

  return (
    <ErrorBoundary>
      <EditorLayout />
    </ErrorBoundary>
  );
}
