'use client'

import React from 'react'
import { SliderControl } from '../shared/SliderControl'

interface OpacityPanelProps {
  opacity: number
  setOpacity: (opacity: number) => void
}

/**
 * OpacityPanel - Controls for background opacity
 */
export function OpacityPanel({ opacity, setOpacity }: OpacityPanelProps) {
  return (
    <SliderControl
      label="Opacity"
      value={opacity}
      onChange={setOpacity}
      min={0}
      max={1}
      step={0.01}
      formatValue={(value) => `${Math.round(value * 100)}%`}
    />
  )
}
