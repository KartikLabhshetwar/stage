'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useImageStore } from '@/lib/store'
import { Trash2, Eye, EyeOff } from 'lucide-react'
import { getCldImageUrl } from '@/lib/cloudinary'
import { OVERLAY_PUBLIC_IDS } from '@/lib/cloudinary-overlays'
import { useWheelInput } from '@/hooks/useWheelInput'

export function OverlayControls() {
  const {
    imageOverlays,
    updateImageOverlay,
    removeImageOverlay,
    clearImageOverlays,
  } = useImageStore()

  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null)

  const selectedOverlay = imageOverlays.find(
    (overlay) => overlay.id === selectedOverlayId
  )

  const handleUpdateSize = (value: number[]) => {
    if (selectedOverlay) {
      updateImageOverlay(selectedOverlay.id, { size: value[0] })
    }
  }

  const handleUpdateRotation = (value: number[]) => {
    if (selectedOverlay) {
      updateImageOverlay(selectedOverlay.id, { rotation: value[0] })
    }
  }

  const handleUpdateOpacity = (value: number[]) => {
    if (selectedOverlay) {
      updateImageOverlay(selectedOverlay.id, { opacity: value[0] })
    }
  }

  const handleToggleFlipX = () => {
    if (selectedOverlay) {
      updateImageOverlay(selectedOverlay.id, { flipX: !selectedOverlay.flipX })
    }
  }

  const handleToggleFlipY = () => {
    if (selectedOverlay) {
      updateImageOverlay(selectedOverlay.id, { flipY: !selectedOverlay.flipY })
    }
  }

  const handleToggleVisibility = (id: string) => {
    const overlay = imageOverlays.find((o) => o.id === id)
    if (overlay) {
      updateImageOverlay(id, { isVisible: !overlay.isVisible })
    }
  }

  const handleUpdatePosition = (axis: 'x' | 'y', value: number[]) => {
    if (selectedOverlay) {
      updateImageOverlay(selectedOverlay.id, {
        position: {
          ...selectedOverlay.position,
          [axis]: value[0],
        },
      })
    }
  }
  
  const { ref: sizeRef } = useWheelInput({
    value: selectedOverlay?.size ?? 100,
    onChange: (val) => handleUpdateSize([val]),
    min: 20,
    max: 400,
    step: 1,
  });
  
  const { ref: rotationRef } = useWheelInput({
    value: selectedOverlay?.rotation ?? 0,
    onChange: (val) => handleUpdateRotation([val]),
    min: 0,
    max: 360,
    step: 1,
  });
  
  const { ref: opacityRef } = useWheelInput({
    value: selectedOverlay?.opacity ?? 1,
    onChange: (val) => handleUpdateOpacity([val]),
    min: 0,
    max: 1,
    step: 0.01,
  });
  
  const { ref: posXRef } = useWheelInput({
    value: selectedOverlay?.position.x ?? 0,
    onChange: (val) => handleUpdatePosition('x', [val]),
    min: 0,
    max: 800,
    step: 1,
  });
  
  const { ref: posYRef } = useWheelInput({
    value: selectedOverlay?.position.y ?? 0,
    onChange: (val) => handleUpdatePosition('y', [val]),
    min: 0,
    max: 600,
    step: 1,
  });


  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-foreground">Image Overlays</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={clearImageOverlays}
          disabled={imageOverlays.length === 0}
          className="h-8 px-3 text-xs font-medium rounded-lg"
        >
          Clear All
        </Button>
      </div>

      {imageOverlays.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-foreground">Manage Overlays</p>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {imageOverlays.map((overlay) => (
              <div
                key={overlay.id}
                className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-colors ${
                  selectedOverlayId === overlay.id
                    ? 'bg-accent border-primary'
                    : 'bg-background hover:bg-accent border-border'
                }`}
                onClick={() => setSelectedOverlayId(overlay.id)}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleVisibility(overlay.id)
                  }}
                  className="h-6 w-6 p-0"
                >
                  {overlay.isVisible ? (
                    <Eye className="h-3 w-3" />
                  ) : (
                    <EyeOff className="h-3 w-3" />
                  )}
                </Button>
                <div className="relative w-8 h-8 shrink-0 rounded overflow-hidden">
                  {(() => {
                    // Check if this is a Cloudinary public ID or a custom upload
                    const isCloudinaryId = OVERLAY_PUBLIC_IDS.includes(overlay.src as any) || 
                                         (typeof overlay.src === 'string' && overlay.src.startsWith('overlays/'))
                    
                    // Get the image URL - use Cloudinary if it's a Cloudinary ID, otherwise use the src directly
                    const imageUrl = isCloudinaryId && !overlay.isCustom
                      ? getCldImageUrl({
                          src: overlay.src,
                          width: 32,
                          height: 32,
                          quality: 'auto',
                          format: 'auto',
                          crop: 'fit',
                        })
                      : overlay.src
                    
                    // Use regular img tag for Cloudinary URLs and data URLs
                    return (
                      <img
                        src={imageUrl}
                        alt="Overlay preview"
                        className="object-contain w-full h-full"
                        style={{ display: 'block' }}
                      />
                    )
                  })()}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeImageOverlay(overlay.id)
                    if (selectedOverlayId === overlay.id) {
                      setSelectedOverlayId(null)
                    }
                  }}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive ml-auto"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedOverlay && (
        <div className="space-y-5 border-t pt-5">
          <div className="space-y-5">
            <p className="text-sm font-semibold text-foreground">
              Edit Overlay
            </p>

            {/* Size */}
            <div ref={sizeRef} className="p-3 rounded-xl bg-muted border border-border">
              <Slider
                value={[selectedOverlay.size]}
                onValueChange={handleUpdateSize}
                max={400}
                min={20}
                step={1}
                label="Size"
                valueDisplay={`${selectedOverlay.size}px`}
              />
            </div>

            {/* Rotation */}
            <div ref={rotationRef} className="p-3 rounded-xl bg-muted border border-border">
              <Slider
                value={[selectedOverlay.rotation]}
                onValueChange={handleUpdateRotation}
                max={360}
                min={0}
                step={1}
                label="Rotation"
                valueDisplay={`${selectedOverlay.rotation}°`}
              />
            </div>

            {/* Opacity */}
            <div ref={opacityRef} className="p-3 rounded-xl bg-muted border border-border">
              <Slider
                value={[selectedOverlay.opacity]}
                onValueChange={handleUpdateOpacity}
                max={1}
                min={0}
                step={0.01}
                label="Opacity"
                valueDisplay={`${Math.round(selectedOverlay.opacity * 100)}%`}
              />
            </div>

            {/* Flip Controls */}
            <div className="flex gap-2">
              <Button
                variant={selectedOverlay.flipX ? 'default' : 'outline'}
                size="sm"
                onClick={handleToggleFlipX}
                className="flex-1 h-10 rounded-xl"
              >
                Flip X
              </Button>
              <Button
                variant={selectedOverlay.flipY ? 'default' : 'outline'}
                size="sm"
                onClick={handleToggleFlipY}
                className="flex-1 h-10 rounded-xl"
              >
                Flip Y
              </Button>
            </div>

            {/* Position */}
            <div className="space-y-4">
              <p className="text-sm font-semibold text-foreground">Position</p>
              {/* X position */}
              <div ref={posXRef} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <Slider
                  value={[selectedOverlay.position.x]}
                  onValueChange={(value) => handleUpdatePosition('x', value)}
                  max={800}
                  min={0}
                  step={1}
                  label="X Position"
                  valueDisplay={`${Math.round(selectedOverlay.position.x)}px`}
                />
              </div>

              {/* Y position */}
              <div ref={posYRef} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <Slider
                  value={[selectedOverlay.position.y]}
                  onValueChange={(value) => handleUpdatePosition('y', value)}
                  max={600}
                  min={0}
                  step={1}
                  label="Y Position"
                  valueDisplay={`${Math.round(selectedOverlay.position.y)}px`}
                />
              </div>
            </div>

            {/* Remove Button */}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                removeImageOverlay(selectedOverlay.id)
                setSelectedOverlayId(null)
              }}
              className="w-full h-10 rounded-xl"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove Overlay
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

