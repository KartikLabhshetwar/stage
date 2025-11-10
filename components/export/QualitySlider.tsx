/**
 * Quality slider component for JPEG export options
 */

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

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
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
      <Label className="text-sm font-medium text-foreground whitespace-nowrap">
        JPEG Quality
      </Label>
      <div className="flex-1 flex items-center gap-3">
        <Slider
          value={[quality]}
          onValueChange={([value]) => onQualityChange(value)}
          min={min}
          max={max}
          step={step}
        />
        <span className="text-sm text-foreground font-medium whitespace-nowrap">
          {Math.round(quality * 100)}%
        </span>
      </div>
    </div>
  );
}
