'use client'

import React from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { FaImage, FaTimes } from 'react-icons/fa'
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '@/lib/constants'
import { getCldImageUrl } from '@/lib/cloudinary'
import { backgroundCategories, getAvailableCategories, cloudinaryPublicIds } from '@/lib/cloudinary-backgrounds'
import type { BackgroundConfig } from '@/lib/constants/backgrounds'

interface BackgroundImagePanelProps {
  backgroundConfig: BackgroundConfig
  setBackgroundType: (type: 'gradient' | 'solid' | 'image') => void
  setBackgroundValue: (value: string) => void
}

/**
 * BackgroundImagePanel - Handles image background selection and upload
 */
export function BackgroundImagePanel({
  backgroundConfig,
  setBackgroundType,
  setBackgroundValue,
}: BackgroundImagePanelProps) {
  const [uploadError, setUploadError] = React.useState<string | null>(null)

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return `File type not supported. Please use: ${ALLOWED_IMAGE_TYPES.join(', ')}`
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return `File size too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB`
    }
    return null
  }

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        const validationError = validateFile(file)
        if (validationError) {
          setUploadError(validationError)
          return
        }

        setUploadError(null)
        const blobUrl = URL.createObjectURL(file)
        setBackgroundValue(blobUrl)
        setBackgroundType('image')
      }
    },
    [setBackgroundValue, setBackgroundType]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ALLOWED_IMAGE_TYPES.map((type) => type.split('/')[1]),
    },
    maxSize: MAX_IMAGE_SIZE,
    multiple: false,
  })

  if (backgroundConfig.type !== 'image') {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Current Background Preview */}
      {backgroundConfig.value &&
        (backgroundConfig.value.startsWith('blob:') ||
          backgroundConfig.value.startsWith('http') ||
          backgroundConfig.value.startsWith('data:') ||
          cloudinaryPublicIds.includes(backgroundConfig.value)) && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Current Background</Label>
            <div className="relative rounded-lg overflow-hidden border border-border aspect-video bg-muted">
              {(() => {
                const isCloudinaryPublicId =
                  typeof backgroundConfig.value === 'string' &&
                  !backgroundConfig.value.startsWith('blob:') &&
                  !backgroundConfig.value.startsWith('http') &&
                  !backgroundConfig.value.startsWith('data:') &&
                  cloudinaryPublicIds.includes(backgroundConfig.value)

                let imageUrl = backgroundConfig.value as string

                if (isCloudinaryPublicId) {
                  imageUrl = getCldImageUrl({
                    src: backgroundConfig.value as string,
                    width: 600,
                    height: 400,
                    quality: 'auto',
                    format: 'auto',
                    crop: 'fill',
                    gravity: 'auto',
                  })
                }

                return (
                  <>
                    <img src={imageUrl} alt="Current background" className="w-full h-full object-cover" />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 flex items-center gap-1.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground border-0 shadow-md px-3 py-1.5 h-auto"
                      onClick={() => {
                        setBackgroundType('gradient')
                        setBackgroundValue('sunset_vibes')
                        if (backgroundConfig.value.startsWith('blob:')) {
                          URL.revokeObjectURL(backgroundConfig.value)
                        }
                      }}
                    >
                      <FaTimes size={14} />
                      <span className="text-xs font-medium">Remove</span>
                    </Button>
                  </>
                )
              })()}
            </div>
          </div>
        )}

      {/* Preset Backgrounds */}
      {backgroundCategories && Object.keys(backgroundCategories).length > 0 && (
        <div className="space-y-3">
          <Label className="text-xs font-medium text-muted-foreground">Preset Backgrounds</Label>
          <div className="max-h-50 overflow-y-auto pr-2 space-y-3">
            {getAvailableCategories()
              .filter((category: string) => category !== 'demo' && category !== 'nature')
              .map((category: string) => {
                const categoryBackgrounds = backgroundCategories[category]
                if (!categoryBackgrounds || categoryBackgrounds.length === 0) return null

                const categoryDisplayName = category.charAt(0).toUpperCase() + category.slice(1)

                return (
                  <div key={category} className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground capitalize">
                      {categoryDisplayName} Wallpapers
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {categoryBackgrounds.map((publicId: string, idx: number) => {
                        const thumbnailUrl = getCldImageUrl({
                          src: publicId,
                          width: 300,
                          height: 200,
                          quality: 'auto',
                          format: 'auto',
                          crop: 'fill',
                          gravity: 'auto',
                        })

                        return (
                          <button
                            key={`${category}-${idx}`}
                            onClick={() => {
                              setBackgroundValue(publicId)
                              setBackgroundType('image')
                            }}
                            className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all w-full ${
                              backgroundConfig.value === publicId
                                ? 'border-primary ring-2 ring-ring shadow-sm'
                                : 'border-border hover:border-border/80'
                            }`}
                            title={`${categoryDisplayName} ${idx + 1}`}
                          >
                            <img
                              src={thumbnailUrl}
                              alt={`${categoryDisplayName} ${idx + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Upload Background Image */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Upload Background Image</Label>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
            isDragActive
              ? 'border-primary bg-accent scale-[1.02]'
              : 'border-border hover:border-border/80 hover:bg-accent/50'
          }`}
        >
          <input {...getInputProps()} />
          <div
            className={`mb-3 transition-colors flex items-center justify-center w-full ${
              isDragActive ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            <FaImage size={32} />
          </div>
          {isDragActive ? (
            <p className="text-xs font-medium text-foreground text-center">Drop the image here...</p>
          ) : (
            <div className="space-y-1 text-center">
              <p className="text-xs font-medium text-muted-foreground">Drag & drop an image here</p>
              <p className="text-xs text-muted-foreground">
                or click to browse • PNG, JPG, WEBP up to {MAX_IMAGE_SIZE / 1024 / 1024}MB
              </p>
            </div>
          )}
        </div>
        {uploadError && (
          <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-2">
            {uploadError}
          </div>
        )}
      </div>
    </div>
  )
}
