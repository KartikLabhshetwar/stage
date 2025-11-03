import { DesignsGallery } from "@/components/designs/DesignsGallery";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Designs Gallery Page - View all saved designs
 * 
 * This page requires authentication and displays all saved designs
 * for the current user.
 */
export default async function DesignsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in?redirect=/designs");
  }

  return (
    <div className="bg-gray-50">
      <DesignsGallery />
    </div>
  );
}

