'use client'

import { CldImage } from 'next-cloudinary'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  sizes?: string
  quality?: number | 'auto'
  crop?: 'fill' | 'fit' | 'scale' | 'crop'
  gravity?: 'auto' | 'center' | 'face'
  [key: string]: any
}

/**
 * OptimizedImage component that uses Cloudinary for all images.
 * All images must be Cloudinary public IDs.
 * Requires NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to be set.
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  priority,
  sizes,
  quality = 'auto',
  crop,
  gravity = 'auto',
  ...props
}: OptimizedImageProps) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  if (!cloudName) {
    console.error(
      'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set. All images require Cloudinary configuration.'
    )
    return null
  }

  // Always use Cloudinary - src should be a Cloudinary public ID
  if (fill) {
    return (
      <CldImage
        src={src}
        alt={alt}
        fill
        className={className}
        priority={priority}
        sizes={sizes}
        quality={quality}
        crop={crop}
        gravity={gravity}
        unoptimized={false}
        {...props}
      />
    )
  }

  return (
    <CldImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes={sizes}
      quality={quality}
      crop={crop}
      gravity={gravity}
      unoptimized={false}
      {...props}
    />
  )
}
