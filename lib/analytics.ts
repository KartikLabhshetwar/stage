/**
 * Analytics utility for tracking events with Umami
 */

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, any>) => void
    }
  }
}

/**
 * Check if we're running on localhost
 */
function isLocalhost(): boolean {
  if (typeof window === 'undefined') return false
  const hostname = window.location.hostname
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0'
}

/**
 * Safely track an event with Umami
 * @param eventName - Name of the event to track
 * @param eventData - Optional data to attach to the event
 */
export function trackEvent(eventName: string, eventData?: Record<string, any>): void {
  // Skip tracking on localhost
  if (isLocalhost()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('🚫 Tracking skipped (localhost):', eventName, eventData)
    }
    return
  }

  // Check if we're in the browser and Umami is loaded
  if (typeof window !== 'undefined' && window.umami) {
    try {
      window.umami.track(eventName, eventData)
      // Log in development to help debug
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Umami Event Tracked:', eventName, eventData)
      }
    } catch (error) {
      // Silently fail if tracking fails to avoid breaking the app
      console.warn('Failed to track event:', error)
    }
  } else if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.warn('⚠️ Umami not loaded. Event not tracked:', eventName)
  }
}
