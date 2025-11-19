/**
 * Quality slider component for JPEG export options
 */

import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface QualitySliderProps {
  quality: number;
  onQualityChange: (quality: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function QualitySlider({ 
  quality, 
  onQualityChange,
  min = 0.1,
  max = 1,
  step = 0.01,
}: QualitySliderProps) {
  return (
    <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
      <Slider
        value={[quality]}
        onValueChange={([value]) => onQualityChange(value)}
        min={min}
        max={max}
        step={step}
        label="JPEG Quality"
        valueDisplay={`${Math.round(quality * 100)}%`}
      />
    </div>
  );
}

