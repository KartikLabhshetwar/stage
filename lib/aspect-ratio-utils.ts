/**
 * Aspect Ratio Utilities
 *
 * Provides standard pixel dimensions for common aspect ratios
 * Based on industry standards for social media, video, and design platforms
 */

import { aspectRatios, type AspectRatio } from '@/lib/constants/aspect-ratios'
import { ASPECT_RATIO_PRESETS, type AspectRatioPreset } from '@/lib/constants'

/**
 * Standard pixel dimensions mapping for aspect ratios
 * These are industry-standard resolutions that maintain aspect ratios
 */
const STANDARD_DIMENSIONS: Record<string, { width: number; height: number }> = {
  '16:9': { width: 1920, height: 1080 }, // Full HD - Standard for video/YouTube
  '1:1': { width: 1080, height: 1080 }, // Square - Instagram feed posts
  '4:5': { width: 1080, height: 1350 }, // Portrait - Instagram portrait posts
  '9:16': { width: 1080, height: 1920 }, // Story/Reel - Instagram Stories, TikTok
  '3:4': { width: 1080, height: 1440 }, // Portrait - Pinterest pins
  '2:3': { width: 1200, height: 1800 }, // Portrait - Social media posts
  '3:2': { width: 1920, height: 1280 }, // Photo - Standard photography
  '4:3': { width: 1920, height: 1440 }, // Traditional - Classic displays
  '5:4': { width: 1920, height: 1536 }, // Photo - Classic photography
  '16:10': { width: 1920, height: 1200 }, // Widescreen - Desktop displays
  '40:21': { width: 1200, height: 630 }, // Open Graph - Standard OG image format (1200×630px)
  '3:1': { width: 1500, height: 500 }, // Twitter Banner - Twitter/X profile banner format
  '4:1': { width: 1584, height: 396 }, // LinkedIn Banner - LinkedIn profile/company banner format
}

// Special dimensions for specific aspect ratio IDs that share common ratios
const SPECIAL_DIMENSIONS: Record<string, { width: number; height: number }> = {
  youtube_banner: { width: 2560, height: 1440 }, // YouTube Channel Banner - Higher resolution 16:9
  instagram_banner: { width: 1080, height: 1080 }, // Instagram Highlight Cover - Square format
}

/**
 * Get standard pixel dimensions for an aspect ratio
 * Returns dimensions that maintain the aspect ratio but use standard sizes
 *
 * @param width - Aspect ratio width (e.g., 16 for 16:9)
 * @param height - Aspect ratio height (e.g., 9 for 16:9)
 * @returns Standard pixel dimensions for the aspect ratio
 */
export function getStandardDimensions(
  width: number,
  height: number
): { width: number; height: number } {
  const ratioString = `${width}:${height}`

  // Check if we have a standard dimension for this ratio
  if (STANDARD_DIMENSIONS[ratioString]) {
    return STANDARD_DIMENSIONS[ratioString]
  }

  // Calculate ratio
  const ratio = width / height

  // Fallback: scale to a reasonable size maintaining aspect ratio
  // Aim for width around 1920px for landscape or 1080px for portrait
  if (ratio > 1) {
    // Landscape - use Full HD width
    return { width: 1920, height: Math.round(1920 / ratio) }
  } else {
    // Portrait - use Full HD height
    return { width: Math.round(1080 * ratio), height: 1080 }
  }
}

/**
 * Get aspect ratio preset from aspect ratio ID
 *
 * @param aspectRatioId - The ID of the aspect ratio (e.g., '16_9')
 * @returns AspectRatioPreset with proper dimensions
 */
export function getAspectRatioPreset(aspectRatioId: string): AspectRatioPreset | null {
  const aspectRatio = aspectRatios.find((ar) => ar.id === aspectRatioId)

  if (!aspectRatio) {
    return null
  }

  // Check for special dimensions first (for formats that share ratios but have different dimensions)
  if (SPECIAL_DIMENSIONS[aspectRatioId]) {
    const specialDimensions = SPECIAL_DIMENSIONS[aspectRatioId]
    const ratioString = `${aspectRatio.width}:${aspectRatio.height}`
    return {
      id: aspectRatio.id,
      name: aspectRatio.name,
      category: aspectRatio.category || 'Custom',
      width: specialDimensions.width,
      height: specialDimensions.height,
      ratio: ratioString,
      description: aspectRatio.description,
    }
  }

  // Find matching preset by comparing ratio strings
  const ratioString = `${aspectRatio.width}:${aspectRatio.height}`
  const matchingPreset = ASPECT_RATIO_PRESETS.find(
    (preset) => preset.ratio === ratioString || preset.ratio === aspectRatio.ratio.toString()
  )

  if (matchingPreset) {
    return matchingPreset
  }

  // Create a preset with standard dimensions for this aspect ratio
  const standardDimensions = getStandardDimensions(aspectRatio.width, aspectRatio.height)
  return {
    id: aspectRatio.id,
    name: aspectRatio.name,
    category: aspectRatio.category || 'Custom',
    width: standardDimensions.width,
    height: standardDimensions.height,
    ratio: ratioString,
    description: aspectRatio.description,
  }
}

/**
 * Calculate display dimensions that fit within viewport constraints
 * while maintaining aspect ratio
 *
 * @param width - Original width
 * @param height - Original height
 * @param maxWidth - Maximum width constraint
 * @param maxHeight - Maximum height constraint
 * @returns Dimensions that fit within constraints
 */
export function calculateFitDimensions(
  width: number,
  height: number,
  maxWidth?: number,
  maxHeight?: number
): { width: number; height: number } {
  const ratio = width / height

  let displayWidth = width
  let displayHeight = height

  // Apply constraints
  if (maxWidth && displayWidth > maxWidth) {
    displayWidth = maxWidth
    displayHeight = displayWidth / ratio
  }

  if (maxHeight && displayHeight > maxHeight) {
    displayHeight = maxHeight
    displayWidth = displayHeight * ratio
  }

  return {
    width: Math.round(displayWidth),
    height: Math.round(displayHeight),
  }
}

/**
 * Get CSS aspect ratio string from dimensions
 *
 * @param width - Width of the aspect ratio
 * @param height - Height of the aspect ratio
 * @returns CSS aspect ratio string (e.g., "16/9")
 */
export function getAspectRatioCSS(width: number, height: number): string {
  return `${width} / ${height}`
}
