/**
 * Resolution scale slider component for export options
 */

import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'

interface ScaleSliderProps {
  scale: number
  onScaleChange: (scale: number) => void
  min?: number
  max?: number
  step?: number
}

export function ScaleSlider({
  scale,
  onScaleChange,
  min = 1,
  max = 5,
  step = 1,
}: ScaleSliderProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
      <Label className="text-sm font-medium text-foreground whitespace-nowrap">
        Resolution Scale
      </Label>
      <div className="flex-1 flex items-center gap-3">
        <Slider
          value={[scale]}
          onValueChange={([value]) => onScaleChange(value)}
          min={min}
          max={max}
          step={step}
        />
        <span className="text-sm text-foreground font-medium whitespace-nowrap">{scale}x</span>
      </div>
    </div>
  )
}
