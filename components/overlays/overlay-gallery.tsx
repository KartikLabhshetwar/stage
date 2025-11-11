'use client'

import { useState } from 'react'
import { useImageStore } from '@/lib/store'
import { OVERLAY_IMAGES } from '@/lib/constants/overlays'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Upload } from 'lucide-react'
import { CldImage } from 'next-cloudinary'
import { useResponsiveCanvasDimensions } from '@/hooks/useAspectRatioDimensions'

export function OverlayGallery() {
  const { addImageOverlay } = useImageStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [customOverlayRef, setCustomOverlayRef] = useState<HTMLInputElement | null>(null)
  const responsiveDimensions = useResponsiveCanvasDimensions()

  const filteredOverlays = OVERLAY_IMAGES.filter((publicId) =>
    publicId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate default position at the top center of canvas
  const getDefaultPosition = () => {
    const canvasWidth = responsiveDimensions.width || 1920
    const overlaySize = 150
    // Position at top center: x = (canvasWidth / 2) - (overlaySize / 2), y = small offset from top
    return {
      x: Math.max(20, canvasWidth / 2 - overlaySize / 2),
      y: 30, // Small offset from top
    }
  }

  const handleAddOverlay = (src: string) => {
    // Default position at top center of canvas
    const defaultPosition = getDefaultPosition()
    addImageOverlay({
      src,
      position: defaultPosition,
      size: 150,
      rotation: 0,
      opacity: 0.9,
      flipX: false,
      flipY: false,
      isVisible: true,
    })
  }

  const handleCustomOverlayUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Default position at top center of canvas
        const defaultPosition = getDefaultPosition()
        addImageOverlay({
          src: result,
          position: defaultPosition,
          size: 150,
          rotation: 0,
          opacity: 0.9,
          flipX: false,
          flipY: false,
          isVisible: true,
          isCustom: true,
        })
      }
      reader.readAsDataURL(file)
    }
    // Reset input
    if (e.target) {
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-foreground">Anime Overlays</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => customOverlayRef?.click()}
          className="h-8 px-3 text-xs font-medium rounded-lg"
        >
          <Upload className="h-3 w-3 mr-1.5" />
          Upload Custom
        </Button>
        <input
          ref={setCustomOverlayRef}
          type="file"
          accept="image/*"
          onChange={handleCustomOverlayUpload}
          className="hidden"
        />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by anime names..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-11 rounded-xl border-border focus:border-primary focus:ring-2 focus:ring-ring pl-9"
        />
      </div>

      <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-2">
        {filteredOverlays.map((publicId, index) => (
          <button
            key={index}
            onClick={() => handleAddOverlay(publicId)}
            className="aspect-square bg-muted rounded-lg border border-border hover:border-primary transition-colors overflow-hidden p-1.5 flex items-center justify-center group"
            title={publicId.split('/').pop()}
          >
            <div className="relative w-full h-full">
              <CldImage
                src={publicId}
                alt={`Overlay ${index + 1}`}
                width={100}
                height={100}
                quality="auto"
                format="auto"
                crop="fit"
                className="object-contain w-full h-full group-hover:scale-105 transition-transform"
              />
            </div>
          </button>
        ))}
        {filteredOverlays.length === 0 && (
          <div className="col-span-4 py-8 text-center text-muted-foreground text-sm">
            No matching overlays found
          </div>
        )}
      </div>
    </div>
  )
}
