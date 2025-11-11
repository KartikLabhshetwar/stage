import { getCldImageUrl } from 'next-cloudinary'

// Re-export for convenience
export { getCldImageUrl }

/**
 * Cloudinary configuration type
 */
export interface CloudinaryConfig {
  cloudName: string
  apiKey?: string
  apiSecret?: string
}

/**
 * Get Cloudinary configuration from environment variables
 */
export function getCloudinaryConfig(): CloudinaryConfig {
  return {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  }
}

/**
 * Optimize an image URL using Cloudinary
 * If the URL is already a Cloudinary URL, it will be optimized
 * If it's a local image, it can be fetched and optimized through Cloudinary
 *
 * @param imageUrl - The image URL (can be local path or Cloudinary URL)
 * @param options - Transformation options
 */
export function getOptimizedImageUrl(
  imageUrl: string,
  options?: {
    width?: number
    height?: number
    quality?: number | 'auto'
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png'
    crop?: 'fill' | 'fit' | 'scale' | 'crop'
    gravity?: 'auto' | 'center' | 'face'
  }
): string {
  // If it's already a Cloudinary URL or external URL, use it directly
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    // Check if it's a Cloudinary URL
    if (imageUrl.includes('cloudinary.com')) {
      // Already a Cloudinary URL, just return it
      return imageUrl
    }
    // External URL - can be fetched through Cloudinary
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    if (cloudName) {
      return getCldImageUrl({
        src: imageUrl,
        width: options?.width,
        height: options?.height,
        quality: options?.quality,
        format: options?.format,
        crop: options?.crop,
        gravity: options?.gravity,
      })
    }
    return imageUrl
  }

  // Local image path - if Cloudinary is configured, fetch and optimize
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (cloudName && imageUrl.startsWith('/')) {
    // For local images, we need to construct a full URL or upload them
    // For now, we'll use fetch mode if the image is accessible via public URL
    // In production, you should upload these images to Cloudinary
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const fullUrl = `${baseUrl}${imageUrl}`

    return getCldImageUrl({
      src: fullUrl,
      width: options?.width,
      height: options?.height,
      quality: options?.quality,
      format: options?.format,
      crop: options?.crop,
      gravity: options?.gravity,
    })
  }

  // Fallback to original URL if Cloudinary is not configured
  return imageUrl
}

/**
 * Generate a Cloudinary public ID from a local path
 * Converts /backgrounds/image.jpg to backgrounds/image
 */
export function getCloudinaryPublicId(imagePath: string): string {
  // Remove leading slash and file extension
  return imagePath.replace(/^\//, '').replace(/\.[^.]+$/, '')
}

/**
 * Get optimized image URL for background images
 * Uses Cloudinary fetch mode to optimize local images
 */
export function getOptimizedBackgroundUrl(
  imagePath: string,
  width?: number,
  height?: number
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  if (cloudName && imagePath.startsWith('/')) {
    // For local images, use fetch mode with full URL
    // Cloudinary will fetch and optimize the image from your site
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
    const fullUrl = `${baseUrl}${imagePath}`

    return getCldImageUrl({
      src: fullUrl,
      width: width || 1920,
      height: height || 1080,
      quality: 'auto',
      format: 'auto',
      crop: 'fill',
      gravity: 'auto',
    })
  }

  // Fallback to original path
  return imagePath
}
