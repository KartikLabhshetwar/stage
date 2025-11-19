/**
 * Resolution scale slider component for export options
 */

import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface ScaleSliderProps {
  scale: number;
  onScaleChange: (scale: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function ScaleSlider({ 
  scale, 
  onScaleChange,
  min = 1,
  max = 5,
  step = 1,
}: ScaleSliderProps) {
  return (
    <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
      <Slider
        value={[scale]}
        onValueChange={([value]) => onScaleChange(value)}
        min={min}
        max={max}
        step={step}
        label="Resolution Scale"
        valueDisplay={`${scale}x`}
      />
    </div>
  );
}

