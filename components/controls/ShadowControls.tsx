'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassInputWrapper } from '@/components/ui/glass-input-wrapper';
import { ImageShadow } from '@/lib/store';

interface ShadowControlsProps {
  shadow: ImageShadow;
  onShadowChange: (shadow: ImageShadow | Partial<ImageShadow>) => void;
}

export function ShadowControls({ shadow, onShadowChange }: ShadowControlsProps) {
  const presetShadows = [
    { blur: 4, offsetX: 0, offsetY: 2, spread: 0, label: 'Small' },
    { blur: 10, offsetX: 0, offsetY: 4, spread: 0, label: 'Medium' },
    { blur: 20, offsetX: 0, offsetY: 8, spread: 0, label: 'Large' },
    { blur: 40, offsetX: 0, offsetY: 16, spread: 0, label: 'XL' },
  ];

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold text-foreground">
            Shadow
          </Label>
          <Button
            variant={shadow.enabled ? 'default' : 'outline'}
            size="sm"
            onClick={() => onShadowChange({ enabled: !shadow.enabled })}
            className={`text-sm font-medium transition-all rounded-lg h-9 border ${
              shadow.enabled
                ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm border-primary'
                : 'border-border/50 hover:border-border hover:bg-accent text-foreground bg-background'
            }`}
          >
            {shadow.enabled ? 'Enabled' : 'Disabled'}
          </Button>
        </div>

        {shadow.enabled && (
          <>
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-foreground">Preset Shadows</Label>
              <div className="grid grid-cols-2 gap-2">
                {presetShadows.map((preset, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onShadowChange({
                        blur: preset.blur,
                        offsetX: preset.offsetX,
                        offsetY: preset.offsetY,
                        spread: preset.spread,
                      })
                    }
                    className={`text-sm font-medium transition-all rounded-lg h-9 border border-border/50 hover:border-border hover:bg-accent text-foreground bg-background`}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <Slider
                  value={[shadow.blur]}
                  onValueChange={(value) => onShadowChange({ blur: value[0] })}
                  min={0}
                  max={50}
                  step={1}
                  label="Blur"
                  valueDisplay={`${shadow.blur}px`}
                />
              </div>

              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <Slider
                  value={[shadow.offsetX]}
                  onValueChange={(value) => onShadowChange({ offsetX: value[0] })}
                  min={-20}
                  max={20}
                  step={1}
                  label="Horizontal Offset"
                  valueDisplay={`${shadow.offsetX}px`}
                />
              </div>

              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <Slider
                  value={[shadow.offsetY]}
                  onValueChange={(value) => onShadowChange({ offsetY: value[0] })}
                  min={-20}
                  max={20}
                  step={1}
                  label="Vertical Offset"
                  valueDisplay={`${shadow.offsetY}px`}
                />
              </div>

              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <Slider
                  value={[shadow.spread]}
                  onValueChange={(value) => onShadowChange({ spread: value[0] })}
                  min={-10}
                  max={20}
                  step={1}
                  label="Spread"
                  valueDisplay={`${shadow.spread}px`}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-semibold text-foreground">Shadow Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={(() => {
                    // Extract RGB from rgba or rgb string
                    const rgbMatch = shadow.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                    if (rgbMatch) {
                      const r = parseInt(rgbMatch[1]);
                      const g = parseInt(rgbMatch[2]);
                      const b = parseInt(rgbMatch[3]);
                      return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
                    }
                    // If it's already hex, return it
                    if (shadow.color.startsWith('#')) {
                      return shadow.color;
                    }
                    return '#000000';
                  })()}
                  onChange={(e) => {
                    // Convert hex to rgba for better control
                    const hex = e.target.value;
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    // Extract alpha from current color if it exists
                    const alphaMatch = shadow.color.match(/rgba\([^)]+,\s*([\d.]+)\)/);
                    const currentAlpha = alphaMatch ? alphaMatch[1] : '0.3';
                    onShadowChange({ color: `rgba(${r}, ${g}, ${b}, ${currentAlpha})` });
                  }}
                  className="w-12 h-10 rounded-lg border border-border cursor-pointer"
                />
                <div className="flex-1 flex items-center gap-2">
                  <GlassInputWrapper className="flex-1">
                    <Input
                      type="text"
                      value={shadow.color}
                      onChange={(e) => onShadowChange({ color: e.target.value })}
                      placeholder="rgba(0, 0, 0, 0.3)"
                      className="border-0 bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </GlassInputWrapper>
                  <div className="text-xs text-muted-foreground whitespace-nowrap font-medium">Opacity</div>
                  <GlassInputWrapper className="w-16">
                    <Input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={(() => {
                        const alphaMatch = shadow.color.match(/rgba\([^)]+,\s*([\d.]+)\)/);
                        return alphaMatch ? alphaMatch[1] : '0.3';
                      })()}
                      onChange={(e) => {
                        const alpha = parseFloat(e.target.value) || 0.3;
                        const rgbMatch = shadow.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                        if (rgbMatch) {
                          onShadowChange({
                            color: `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${alpha})`,
                          });
                        } else {
                          onShadowChange({ color: `rgba(0, 0, 0, ${alpha})` });
                        }
                      }}
                      className="border-0 bg-transparent text-sm px-2 py-2 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </GlassInputWrapper>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

