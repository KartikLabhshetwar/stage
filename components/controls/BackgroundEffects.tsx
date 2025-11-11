'use client'

import * as React from 'react'
import { useImageStore } from '@/lib/store'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'

export function BackgroundEffects() {
  const { backgroundBlur, backgroundNoise, setBackgroundBlur, setBackgroundNoise } = useImageStore()

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">
        Background Effects
      </h4>

      {/* Blur */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-xs font-medium text-muted-foreground">Blur</Label>
          <span className="text-xs text-muted-foreground font-medium">{backgroundBlur}px</span>
        </div>
        <Slider
          value={[backgroundBlur]}
          onValueChange={(value) => setBackgroundBlur(value[0])}
          min={0}
          max={50}
          step={1}
          className="w-full"
        />
      </div>

      {/* Noise */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-xs font-medium text-muted-foreground">Noise</Label>
          <span className="text-xs text-muted-foreground font-medium">{backgroundNoise}%</span>
        </div>
        <Slider
          value={[backgroundNoise]}
          onValueChange={(value) => setBackgroundNoise(value[0])}
          min={0}
          max={100}
          step={1}
          className="w-full"
        />
      </div>
    </div>
  )
}
