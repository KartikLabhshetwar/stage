'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { SliderControl } from '../shared/SliderControl'

interface BorderRadiusPanelProps {
  borderRadius: number
  setBorderRadius: (radius: number) => void
}

/**
 * BorderRadiusPanel - Controls for background border radius
 */
export function BorderRadiusPanel({ borderRadius, setBorderRadius }: BorderRadiusPanelProps) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2 mb-2">
        <Button
          variant={borderRadius === 0 ? 'default' : 'outline'}
          size="sm"
          onClick={() => setBorderRadius(0)}
          className={`flex-1 text-xs font-medium transition-all rounded-lg h-8 border ${
            borderRadius === 0
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm border-primary'
              : 'border-border/50 hover:bg-accent text-foreground bg-background hover:border-border'
          }`}
        >
          Sharp Edge
        </Button>
        <Button
          variant={borderRadius > 0 ? 'default' : 'outline'}
          size="sm"
          onClick={() => setBorderRadius(24)}
          className={`flex-1 text-xs font-medium transition-all rounded-lg h-8 border ${
            borderRadius > 0
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm border-primary'
              : 'border-border/50 hover:bg-accent text-foreground bg-background hover:border-border'
          }`}
        >
          Rounded
        </Button>
      </div>
      <SliderControl
        label="Border Radius"
        value={borderRadius}
        onChange={setBorderRadius}
        min={0}
        max={100}
        step={1}
        formatValue={(value) => `${value}px`}
      />
    </div>
  )
}
