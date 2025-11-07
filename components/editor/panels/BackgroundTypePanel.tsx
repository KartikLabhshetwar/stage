'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { gradientColors, type GradientKey } from '@/lib/constants/gradient-colors'
import { solidColors, type SolidColorKey } from '@/lib/constants/solid-colors'
import type { BackgroundConfig } from '@/lib/constants/backgrounds'

interface BackgroundTypePanelProps {
  backgroundConfig: BackgroundConfig
  setBackgroundType: (type: 'gradient' | 'solid' | 'image') => void
  setBackgroundValue: (value: string) => void
}

/**
 * BackgroundTypePanel - Handles background type selection and gradient/solid color pickers
 */
export function BackgroundTypePanel({
  backgroundConfig,
  setBackgroundType,
  setBackgroundValue,
}: BackgroundTypePanelProps) {
  return (
    <div className="space-y-4">
      {/* Background Type Selector */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground">Background Type</Label>
        <div className="flex gap-2">
          <Button
            variant={backgroundConfig.type === 'image' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setBackgroundType('image')}
            className={`flex-1 text-xs font-medium transition-all rounded-lg h-8 border ${
              backgroundConfig.type === 'image'
                ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm border-primary'
                : 'border-border/50 hover:bg-accent text-foreground bg-background hover:border-border'
            }`}
          >
            Image
          </Button>
          <Button
            variant={backgroundConfig.type === 'solid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setBackgroundType('solid')
              if (
                !backgroundConfig.value ||
                typeof backgroundConfig.value !== 'string' ||
                !solidColors[backgroundConfig.value as SolidColorKey]
              ) {
                setBackgroundValue('white')
              }
            }}
            className={`flex-1 text-xs font-medium transition-all rounded-lg h-8 border ${
              backgroundConfig.type === 'solid'
                ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm border-primary'
                : 'border-border/50 hover:bg-accent text-foreground bg-background hover:border-border'
            }`}
          >
            Solid
          </Button>
          <Button
            variant={backgroundConfig.type === 'gradient' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setBackgroundType('gradient')
              if (
                !backgroundConfig.value ||
                typeof backgroundConfig.value !== 'string' ||
                !gradientColors[backgroundConfig.value as GradientKey]
              ) {
                setBackgroundValue('sunset_vibes')
              }
            }}
            className={`flex-1 text-xs font-medium transition-all rounded-lg h-8 border ${
              backgroundConfig.type === 'gradient'
                ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm border-primary'
                : 'border-border/50 hover:bg-accent text-foreground bg-background hover:border-border'
            }`}
          >
            Gradient
          </Button>
        </div>
      </div>

      {/* Gradient Selector */}
      {backgroundConfig.type === 'gradient' && (
        <div className="space-y-3">
          <Label className="text-xs font-medium text-muted-foreground">Gradient</Label>
          <div className="grid grid-cols-5 gap-2.5 max-h-64 overflow-y-auto pr-2">
            {(Object.keys(gradientColors) as GradientKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setBackgroundValue(key)}
                className={`h-16 rounded-lg border-2 transition-all ${
                  backgroundConfig.value === key
                    ? 'border-primary ring-2 ring-ring shadow-sm'
                    : 'border-border hover:border-border/80'
                }`}
                style={{
                  background: gradientColors[key],
                }}
                title={key.replace(/_/g, ' ')}
              />
            ))}
          </div>
        </div>
      )}

      {/* Solid Color Selector */}
      {backgroundConfig.type === 'solid' && (
        <div className="space-y-3">
          <Label className="text-xs font-medium text-muted-foreground">Color</Label>
          <div className="grid grid-cols-5 gap-2.5">
            {(Object.keys(solidColors) as SolidColorKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setBackgroundValue(key)}
                className={`h-10 rounded-lg border-2 transition-all ${
                  backgroundConfig.value === key
                    ? 'border-primary ring-2 ring-ring shadow-sm'
                    : 'border-border hover:border-border/80'
                }`}
                style={{
                  backgroundColor: solidColors[key],
                }}
                title={key.replace(/_/g, ' ')}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
