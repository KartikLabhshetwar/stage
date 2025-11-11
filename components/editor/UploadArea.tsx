'use client'

import * as React from 'react'
import { useDropzone } from 'react-dropzone'
import { FaImage } from 'react-icons/fa'
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface UploadAreaProps {
  onUpload: (file: File) => void
  error?: string | null
  className?: string
}

export function UploadArea({ onUpload, error, className }: UploadAreaProps) {
  const [isDragActive, setIsDragActive] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const validateFile = React.useCallback((file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return `File type not supported. Please use: ${ALLOWED_IMAGE_TYPES.join(', ')}`
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return `File size too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB`
    }
    return null
  }, [])

  const handleFile = React.useCallback(
    (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        return
      }
      onUpload(file)
    },
    [validateFile, onUpload]
  )

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        handleFile(acceptedFiles[0])
      }
    },
    [handleFile]
  )

  const {
    getRootProps,
    getInputProps,
    isDragActive: dropzoneActive,
  } = useDropzone({
    onDrop,
    accept: {
      'image/*': ALLOWED_IMAGE_TYPES.map((type) => type.split('/')[1]),
    },
    maxSize: MAX_IMAGE_SIZE,
    multiple: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  })

  // Handle paste event
  React.useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      // Only handle paste if the upload area is focused or visible
      if (!containerRef.current) return

      const items = e.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        const item = items[i]

        // Check if the item is an image
        if (item.type.startsWith('image/')) {
          e.preventDefault()

          const file = item.getAsFile()
          if (file) {
            handleFile(file)
          }
          break
        }
      }
    }

    // Add paste event listener to the document
    document.addEventListener('paste', handlePaste)

    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [handleFile])

  const active = isDragActive || dropzoneActive

  return (
    <div ref={containerRef} className={cn('w-full max-w-2xl mx-auto', className)}>
      <div className="space-y-6 sm:space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Upload Image</h2>
          <p className="text-xs sm:text-sm text-muted-foreground px-2">
            Drag and drop, paste, or click to upload an image
          </p>
        </div>

        <div
          {...getRootProps()}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-8 sm:p-12 md:p-16',
            'cursor-pointer transition-all duration-200',
            'flex flex-col items-center justify-center',
            'min-h-[240px] sm:min-h-[280px]',
            active
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-border hover:border-primary/50 hover:bg-accent/50',
            error && 'border-destructive'
          )}
        >
          <input {...getInputProps()} />

          <div
            className={cn(
              'mb-4 sm:mb-6 transition-colors',
              active ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <FaImage size={48} className="sm:hidden" />
            <FaImage size={56} className="hidden sm:block" />
          </div>

          {active ? (
            <p className="text-sm sm:text-base font-medium text-primary">Drop the image here...</p>
          ) : (
            <div className="space-y-2 text-center px-2">
              <p className="text-sm sm:text-base font-medium">Drag & drop an image here</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                or tap to browse • PNG, JPG, WEBP up to {MAX_IMAGE_SIZE / 1024 / 1024}MB • or paste
                an image
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-destructive">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
