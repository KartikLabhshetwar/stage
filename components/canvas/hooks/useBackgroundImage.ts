'use client'

import { useEffect, useState } from 'react'
import type { BackgroundConfig } from '@/lib/constants/backgrounds'

/**
 * Custom hook for loading background images
 * Handles both direct URLs and Cloudinary public IDs
 */
export function useBackgroundImage(
  backgroundConfig: BackgroundConfig,
  containerWidth: number,
  containerHeight: number
): HTMLImageElement | null {
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    if (backgroundConfig.type === 'image' && backgroundConfig.value) {
      const imageValue = backgroundConfig.value as string

      // Check if it's a valid image URL/blob/data URI or Cloudinary public ID
      // Skip if it looks like a gradient key (e.g., "primary_gradient")
      const isValidImageValue =
        imageValue.startsWith('http') ||
        imageValue.startsWith('blob:') ||
        imageValue.startsWith('data:') ||
        // Check if it might be a Cloudinary public ID (not a gradient key)
        (typeof imageValue === 'string' && !imageValue.includes('_gradient'))

      if (!isValidImageValue) {
        setBgImage(null)
        return
      }

      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => setBgImage(img)
      img.onerror = () => {
        setBgImage(null)
      }

      // Check if it's a Cloudinary public ID or URL
      let imageUrl = imageValue
      if (typeof imageUrl === 'string' && !imageUrl.startsWith('http') && !imageUrl.startsWith('blob:') && !imageUrl.startsWith('data:')) {
        // It might be a Cloudinary public ID, construct URL
        const { getCldImageUrl } = require('@/lib/cloudinary')
        const { cloudinaryPublicIds } = require('@/lib/cloudinary-backgrounds')
        if (cloudinaryPublicIds.includes(imageUrl)) {
          // Use container dimensions for better quality
          imageUrl = getCldImageUrl({
            src: imageUrl,
            width: Math.max(containerWidth, 1920),
            height: Math.max(containerHeight, 1080),
            quality: 'auto',
            format: 'auto',
            crop: 'fill',
            gravity: 'auto',
          })
        } else {
          // Invalid image value, don't try to load
          setBgImage(null)
          return
        }
      }

      img.src = imageUrl
    } else {
      setBgImage(null)
    }
  }, [backgroundConfig, containerWidth, containerHeight])

  return bgImage
}
