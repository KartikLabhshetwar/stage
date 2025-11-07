'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

interface SliderControlProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  formatValue?: (value: number) => string
}

/**
 * SliderControl - Reusable slider component with label and value display
 */
export function SliderControl({
  label,
  value,
  onChange,
  min,
  max,
  step,
  formatValue,
}: SliderControlProps) {
  const displayValue = formatValue ? formatValue(value) : value.toString()

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
        <span className="text-xs text-muted-foreground font-medium">{displayValue}</span>
      </div>
      <Slider value={[value]} onValueChange={(values) => onChange(values[0])} min={min} max={max} step={step} className="w-full" />
    </div>
  )
}
