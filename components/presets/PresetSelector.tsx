'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useImageStore } from '@/lib/store';
import { presets, type PresetConfig } from '@/lib/constants/presets';
import { getBackgroundCSS } from '@/lib/constants/backgrounds';
import { cn } from '@/lib/utils';

export function PresetSelector() {
  const {
    uploadedImageUrl,
    selectedAspectRatio,
    backgroundConfig,
    backgroundBorderRadius,
    backgroundBlur,
    backgroundNoise,
    borderRadius,
    imageOpacity,
    imageScale,
    imageBorder,
    imageShadow,
    setAspectRatio,
    setBackgroundConfig,
    setBackgroundType,
    setBackgroundValue,
    setBackgroundOpacity,
    setBorderRadius,
    setBackgroundBorderRadius,
    setBackgroundBlur,
    setBackgroundNoise,
    setImageOpacity,
    setImageScale,
    setImageBorder,
    setImageShadow,
    setPerspective3D,
  } = useImageStore();

  const [open, setOpen] = React.useState(false);

  // Check if a preset matches the current settings
  const isPresetActive = React.useCallback((preset: PresetConfig) => {
    return (
      preset.aspectRatio === selectedAspectRatio &&
      preset.backgroundConfig.type === backgroundConfig.type &&
      preset.backgroundConfig.value === backgroundConfig.value &&
      preset.backgroundBorderRadius === backgroundBorderRadius &&
      preset.borderRadius === borderRadius &&
      preset.imageOpacity === imageOpacity &&
      preset.imageScale === imageScale &&
      preset.imageBorder.enabled === imageBorder.enabled &&
      preset.imageShadow.enabled === imageShadow.enabled &&
      (preset.backgroundBlur ?? 0) === backgroundBlur &&
      (preset.backgroundNoise ?? 0) === backgroundNoise
    );
  }, [
    selectedAspectRatio,
    backgroundConfig,
    backgroundBorderRadius,
    backgroundBlur,
    backgroundNoise,
    borderRadius,
    imageOpacity,
    imageScale,
    imageBorder.enabled,
    imageShadow.enabled,
  ]);

  const applyPreset = React.useCallback((preset: PresetConfig) => {
    // Set all parameters from the preset
    setAspectRatio(preset.aspectRatio);
    setBackgroundConfig(preset.backgroundConfig);
    setBackgroundType(preset.backgroundConfig.type);
    setBackgroundValue(preset.backgroundConfig.value);
    setBackgroundOpacity(preset.backgroundConfig.opacity ?? 1);
    setBorderRadius(preset.borderRadius);
    setBackgroundBorderRadius(preset.backgroundBorderRadius);
    setImageOpacity(preset.imageOpacity);
    setImageScale(preset.imageScale);
    setImageBorder(preset.imageBorder);
    setImageShadow(preset.imageShadow);
    // Reset blur and noise to 0 if not specified, otherwise use preset values
    setBackgroundBlur(preset.backgroundBlur ?? 0);
    setBackgroundNoise(preset.backgroundNoise ?? 0);
    // Reset 3D transform to defaults if not specified, otherwise use preset values
    setPerspective3D(preset.perspective3D ?? {
      perspective: 200,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      translateX: 0,
      translateY: 0,
      scale: 1,
    });
    
    // Close the popover after applying
    setOpen(false);
  }, [
    setAspectRatio,
    setBackgroundConfig,
    setBackgroundType,
    setBackgroundValue,
    setBackgroundOpacity,
    setBorderRadius,
    setBackgroundBorderRadius,
    setBackgroundBlur,
    setBackgroundNoise,
    setImageOpacity,
    setImageScale,
    setImageBorder,
    setImageShadow,
    setPerspective3D,
  ]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={!uploadedImageUrl}
          variant="outline"
          size="sm"
          className="w-full h-10 justify-center gap-2.5 rounded-lg bg-background hover:bg-accent text-foreground border border-border hover:border-border/80 shadow-sm hover:shadow-md transition-all duration-200 font-semibold text-sm px-3 overflow-hidden"
        >
          <span className="truncate">Presets</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-foreground">Quick Presets</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Apply pre-configured styles instantly
            </p>
          </div>
          
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 -mr-1">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={cn(
                  'w-full text-left p-3 rounded-lg border-2 transition-all',
                  isPresetActive(preset)
                    ? 'border-primary bg-primary/5 hover:bg-primary/10'
                    : 'border-border bg-background hover:bg-accent hover:border-border/80',
                  'focus:outline-none',
                  'group'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Preview thumbnail */}
                  <div
                    className="w-16 h-16 rounded-md overflow-hidden border-2 border-border shrink-0"
                    style={getBackgroundCSS(preset.backgroundConfig)}
                  />
                  
                  {/* Preset info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground group-hover:text-foreground">
                      {preset.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {preset.description}
                    </div>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                        {preset.aspectRatio === '1_1' ? 'Square' :
                         preset.aspectRatio === '9_16' ? 'Story' :
                         preset.aspectRatio === '16_9' ? 'Landscape' :
                         preset.aspectRatio === '4_5' ? 'Portrait' :
                         preset.aspectRatio}
                      </span>
                      {preset.borderRadius > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                          Rounded
                        </span>
                      )}
                      {preset.imageShadow.enabled && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                          Shadow
                        </span>
                      )}
                      {preset.backgroundBlur && preset.backgroundBlur > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                          Blur
                        </span>
                      )}
                      {preset.backgroundNoise && preset.backgroundNoise > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                          Grain
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {!uploadedImageUrl && (
            <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground text-center">
                Upload an image to use presets
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

