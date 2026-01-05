'use client';

import * as React from 'react';
import { useImageStore, useEditorStore } from '@/lib/store';
import { presets, type PresetConfig } from '@/lib/constants/presets';
import { getBackgroundCSS } from '@/lib/constants/backgrounds';
import { getCldImageUrl } from '@/lib/cloudinary';
import { cloudinaryPublicIds } from '@/lib/cloudinary-backgrounds';
import { cn } from '@/lib/utils';
interface PresetGalleryProps {
  onPresetSelect?: (preset: PresetConfig) => void;
}

export function PresetGallery({ onPresetSelect }: PresetGalleryProps) {
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

  const { screenshot } = useEditorStore();

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
    onPresetSelect?.(preset);
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
    onPresetSelect,
  ]);

  const getBackgroundImageUrl = (config: PresetConfig['backgroundConfig']): string | null => {
    if (config.type !== 'image') return null;
    const value = config.value as string;
    
    if (value.startsWith('blob:') || value.startsWith('http') || value.startsWith('data:')) {
      return value;
    }
    
    if (cloudinaryPublicIds.includes(value)) {
      return getCldImageUrl({
        src: value,
        width: 400,
        height: 300,
        quality: 'auto',
        format: 'auto',
        crop: 'fill',
        gravity: 'auto',
      });
    }
    
    return null;
  };

  const previewImageUrl = uploadedImageUrl || (screenshot?.src ?? null);

  return (
    <div className="space-y-4">
      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 -mr-1">
          {presets.map((preset) => {
            const bgImageUrl = getBackgroundImageUrl(preset.backgroundConfig);
            const isActive = isPresetActive(preset);
            
            return (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={cn(
                  'w-full rounded-lg border-2 transition-all overflow-hidden',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  isActive
                    ? 'border-primary shadow-lg shadow-primary/20'
                    : 'border-border hover:border-border/80 hover:shadow-md'
                )}
              >
                <div
                  className="relative aspect-video w-full"
                  style={getBackgroundCSS(preset.backgroundConfig)}
                >
                  {bgImageUrl && (
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${bgImageUrl})`,
                        filter: preset.backgroundBlur ? `blur(${preset.backgroundBlur}px)` : undefined,
                        opacity: preset.backgroundConfig.opacity ?? 1,
                      }}
                    />
                  )}
                  
                  {previewImageUrl && (
                    <div
                      className="absolute inset-0 flex items-center justify-center p-4"
                    >
                      <div
                        className="relative rounded-lg overflow-hidden shadow-lg"
                        style={{
                          width: `${preset.imageScale}%`,
                          aspectRatio: '16/9',
                          borderRadius: `${preset.borderRadius}px`,
                          opacity: preset.imageOpacity,
                          boxShadow: preset.imageShadow.enabled
                            ? `${preset.imageShadow.offsetX}px ${preset.imageShadow.offsetY}px ${preset.imageShadow.blur}px ${preset.imageShadow.spread}px ${preset.imageShadow.color}`
                            : undefined,
                        }}
                      >
                        <img
                          src={previewImageUrl}
                          alt={preset.name}
                          className="w-full h-full object-cover"
                        />
                        {preset.imageBorder.enabled && (
                          <div
                            className="absolute inset-0 border-2"
                            style={{
                              borderColor: preset.imageBorder.color,
                              borderRadius: `${preset.borderRadius}px`,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  )}
                  
                  {!previewImageUrl && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-xs text-muted-foreground/50">
                        {preset.name}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-3 bg-background/95 backdrop-blur-sm border-t border-border/50">
                  <div className="text-sm font-medium text-foreground">{preset.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{preset.description}</div>
                </div>
              </button>
            );
          })}
          
        {!uploadedImageUrl && !screenshot?.src && (
          <div className="p-4 rounded-lg bg-muted/50 border border-border text-center">
            <p className="text-xs text-muted-foreground">
              Upload an image to see preset previews
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

