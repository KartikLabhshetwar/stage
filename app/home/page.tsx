import { EditorLayout } from '@/components/editor/EditorLayout'
import { ErrorBoundary } from '@/components/ErrorBoundary'

/**
 * Editor Page - Public Access
 *
 * This page is now publicly accessible without authentication.
 */
export default async function EditorPage() {
  return (
    <ErrorBoundary>
      <EditorLayout />
    </ErrorBoundary>
  )
}
