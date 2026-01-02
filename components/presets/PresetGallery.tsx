'use client';

import * as React from 'react';
import { useImageStore, useEditorStore } from '@/lib/store';
import { presets, type PresetConfig } from '@/lib/constants/presets';
import { getBackgroundCSS } from '@/lib/constants/backgrounds';
import { getCldImageUrl } from '@/lib/cloudinary';
import { cloudinaryPublicIds } from '@/lib/cloudinary-backgrounds';
import { Frame3DOverlay, type FrameConfig } from '@/components/canvas/frames/Frame3DOverlay';
import { aspectRatios } from '@/lib/constants/aspect-ratios';
import { getAspectRatioCSS } from '@/lib/aspect-ratio-utils';
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

// Maps preset aspectRatio id to CSS aspect-ratio string

  const getPresetAspectRatioCSS = (aspectRatioKey: string): string => {
    const aspectRatio = aspectRatios.find((ar) => ar.id === aspectRatioKey);
    if (!aspectRatio) return "16 / 9"; // Falls back to 16:9 if preset id is missing or invalid
    return getAspectRatioCSS(aspectRatio.width, aspectRatio.height);
  };

// handler for ultra wide aspect ratios

  const isUltraWideAspectRatio = (aspectRatioKey: string): boolean => {
    const ultraWideRatios = ['twitter_banner', 'linkedin_banner'];
    return ultraWideRatios.includes(aspectRatioKey);
  };

// helper functions to calculate frame dimensions

  const calculateFrameDimensions = (preset: PresetConfig) => {
    const hasFrame = preset.imageBorder.enabled && preset.imageBorder.type !== 'none';
    const imageScale = hasFrame ? preset.imageScale * 0.88 : preset.imageScale;
    const frameOffset = hasFrame && (preset.imageBorder.type === 'arc-light' || preset.imageBorder.type === 'arc-dark')
    ? Math.max(0, preset.imageBorder.width || 8)
    : 0;

    const isWindowFrame = ['macos-light', 'macos-dark', 'windows-light', 'windows-dark'].includes(preset.imageBorder.type);
    const isMacosFrame = preset.imageBorder.type === 'macos-light' || preset.imageBorder.type === 'macos-dark';
    const isWindowsFrame = preset.imageBorder.type === 'windows-light' || preset.imageBorder.type === 'windows-dark';
    const isPhotograph = preset.imageBorder.type === 'photograph';

    const polaroidPadding = 8;
    const polaroidBottom = 60;
    const windowPadding = hasFrame && isWindowFrame ? 0 : (hasFrame && isPhotograph ? polaroidPadding : 0);
    const windowHeader = hasFrame && isMacosFrame ? 40 : (hasFrame && isWindowsFrame ? 28 : (hasFrame && isPhotograph ? polaroidBottom - polaroidPadding : 0));

    return {
      imageScale,
      frameOffset,
      windowPadding,
      windowHeader,
      hasFrame,
    };
  };

// Returns the style object for the image frame preview based on preset settings

  const getImageFrameStyle = (preset: PresetConfig): React.CSSProperties => {
    const { imageScale, frameOffset, windowPadding } = calculateFrameDimensions(preset);
    const isUltraWide = isUltraWideAspectRatio(preset.aspectRatio);

    const adjustedScale = isUltraWide ? imageScale * 0.6 : imageScale;
    const totalPadding = frameOffset + windowPadding;

    return {
      width: `${adjustedScale}%`,
      borderRadius: `${preset.borderRadius}px`,
      opacity: preset.imageOpacity,
      padding: totalPadding,
      boxSizing: 'border-box',
      transform: preset.perspective3D ? get3DTransform(preset.perspective3D) : undefined,
      transformStyle: preset.perspective3D ? 'preserve-3d' : undefined,
    };
  };

// Convert preset.imageBorder to FrameConfig format

  const getFrameConfig = (preset: PresetConfig): FrameConfig => {
      return {
        enabled: preset.imageBorder.enabled,
        type: preset.imageBorder.type,
        width: preset.imageBorder.width,
        color: preset.imageBorder.color,
        padding: preset.imageBorder.padding,
        title: preset.imageBorder.title,
      };
  };

// Converts preset 3D config into a single CSS transform string

  const get3DTransform = (perspective3D: PresetConfig["perspective3D"]) => {
    if (!perspective3D) return undefined;
    const {
      perspective,
      rotateX,
      rotateY,
      rotateZ,
      translateX,
      translateY,
      scale,
    } = perspective3D;
    return `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) translateX(${translateX}px) translateY(${translateY}px) scale(${scale})`;
  };


  const previewImageUrl = uploadedImageUrl || (screenshot?.src ?? null);

  return (
    <div className="space-y-4">
      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 -mr-1">
          {presets.map((preset) => {
            const bgImageUrl = getBackgroundImageUrl(preset.backgroundConfig);
            const isActive = isPresetActive(preset);
            const aspectRatioCSS = getPresetAspectRatioCSS(preset.aspectRatio);
            const imageFrameStyle = getImageFrameStyle(preset);

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
                  <div
                    className="relative w-full overflow-hidden"
                    style={{
                      aspectRatio: aspectRatioCSS,
                    }}
                  >
                  <div
                    className="absolute inset-0"
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
                  </div> 
                  {previewImageUrl && (
                    <div
                      className="absolute inset-0 flex items-center justify-center p-4"
                      style={{
                        zIndex: 2,
                        padding: isUltraWideAspectRatio(preset.aspectRatio) ? '8px' : '16',
                      }}
                    >
                      <div
                        className="relative overflow-hidden shadow-lg"
                        style={{
                          ...imageFrameStyle,
                          boxShadow: preset.imageShadow.enabled
                          ? `${preset.imageShadow.offsetX}px ${preset.imageShadow.offsetY}px ${preset.imageShadow.blur}px ${preset.imageShadow.spread}px ${preset.imageShadow.color}`
                          : undefined,
                        }}
                      >
                        <Frame3DOverlay
                          frame={getFrameConfig(preset)}
                          showFrame={preset.imageBorder.enabled && preset.imageBorder.type !== 'none'}
                          framedW={100}
                          framedH={100}
                          frameOffset={calculateFrameDimensions(preset).frameOffset}
                          windowPadding={calculateFrameDimensions(preset).windowPadding}
                          windowHeader={calculateFrameDimensions(preset).windowHeader}
                          eclipseBorder={0}
                          imageScaledW={100}
                          imageScaledH={100}
                          screenshotRadius={preset.borderRadius - 12}
                        />
                        <div 
                          className="w-full h-full overflow-hidden "
                          style={{ 
                            borderRadius: 'inherit',
                            position: 'relative',
                            zIndex: 1,
                            paddingTop: calculateFrameDimensions(preset).windowHeader > 0 
                            ? `${calculateFrameDimensions(preset).windowHeader}px` 
                            : undefined,
                          }}
                        >
                        <img
                          src={previewImageUrl}
                          alt={preset.name}
                          className="w-full h-full object-contain"
                          style={{
                            borderRadius: preset.imageBorder.type === 'macos-light' || 
                            preset.imageBorder.type === 'macos-dark' ||
                            preset.imageBorder.type === 'windows-light' ||
                            preset.imageBorder.type === 'windows-dark'
                            ? `0 0 ${preset.borderRadius}px ${preset.borderRadius}px`
                            : `${preset.borderRadius}px ${preset.borderRadius}px ${preset.borderRadius}px ${preset.borderRadius}px`,
                          }}
                        />
                        </div>
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