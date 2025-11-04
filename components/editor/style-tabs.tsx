'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AspectRatioDropdown } from '@/components/aspect-ratio/aspect-ratio-dropdown';
import { TextOverlayControls } from '@/components/text-overlay/text-overlay-controls';
import { useImageStore } from '@/lib/store';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { gradientColors, type GradientKey } from '@/lib/constants/gradient-colors';
import { solidColors, type SolidColorKey } from '@/lib/constants/solid-colors';
import { Button } from '@/components/ui/button';
import { getCldImageUrl } from '@/lib/cloudinary';
import { cloudinaryPublicIds } from '@/lib/cloudinary-backgrounds';
import { useDropzone } from 'react-dropzone';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '@/lib/constants';
import { ImageSquare as ImageIcon, Crop, PaintBrush, TextT, X } from '@phosphor-icons/react';
import { aspectRatios } from '@/lib/constants/aspect-ratios';
import { BorderControls } from '@/components/controls/BorderControls';
import { ShadowControls } from '@/components/controls/ShadowControls';
import { GlassInputWrapper } from '@/components/ui/glass-input-wrapper';

export function StyleTabs() {
  const {
    backgroundConfig,
    borderRadius,
    backgroundBorderRadius,
    imageOpacity,
    imageScale,
    selectedAspectRatio,
    imageBorder,
    imageShadow,
    setBackgroundType,
    setBackgroundValue,
    setBackgroundOpacity,
    setBackgroundBlur,
    setBorderRadius,
    setBackgroundBorderRadius,
    setImageOpacity,
    setImageScale,
    setImageBorder,
    setImageShadow,
  } = useImageStore();

  const [bgUploadError, setBgUploadError] = React.useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return `File type not supported. Please use: ${ALLOWED_IMAGE_TYPES.join(', ')}`;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return `File size too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB`;
    }
    return null;
  };

  const onBgDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const validationError = validateFile(file);
        if (validationError) {
          setBgUploadError(validationError);
          return;
        }

        setBgUploadError(null);
        const blobUrl = URL.createObjectURL(file);
        setBackgroundValue(blobUrl);
        setBackgroundType('image');
      }
    },
    [setBackgroundValue, setBackgroundType]
  );

  const { getRootProps: getBgRootProps, getInputProps: getBgInputProps, isDragActive: isBgDragActive } = useDropzone({
    onDrop: onBgDrop,
    accept: {
      'image/*': ALLOWED_IMAGE_TYPES.map((type) => type.split('/')[1]),
    },
    maxSize: MAX_IMAGE_SIZE,
    multiple: false,
  });

  return (
    <Tabs defaultValue="aspect" className="w-full max-w-full">
      <TabsList className="flex w-full gap-2 bg-muted/50 backdrop-blur-sm p-2 rounded-lg min-h-[44px] box-border overflow-hidden">
        <TabsTrigger 
          value="aspect" 
          className="flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2.5 rounded-md transition-all duration-200 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:hover:text-foreground data-[state=inactive]:text-muted-foreground focus-visible:outline-none whitespace-nowrap flex-1 min-h-[36px] min-w-0 box-border"
          aria-label="Aspect Ratio"
        >
          Aspect
        </TabsTrigger>
        <TabsTrigger 
          value="background" 
          className="flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2.5 rounded-md transition-all duration-200 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:hover:text-foreground data-[state=inactive]:text-muted-foreground focus-visible:outline-none whitespace-nowrap flex-1 min-h-[36px] min-w-0 box-border"
          aria-label="Background"
        >
          Background
        </TabsTrigger>
        <TabsTrigger 
          value="image" 
          className="flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2.5 rounded-md transition-all duration-200 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:hover:text-foreground data-[state=inactive]:text-muted-foreground focus-visible:outline-none whitespace-nowrap flex-1 min-h-[36px] min-w-0 box-border"
          aria-label="Image"
        >
          Image
        </TabsTrigger>
        <TabsTrigger 
          value="text" 
          className="flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2.5 rounded-md transition-all duration-200 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:hover:text-foreground data-[state=inactive]:text-muted-foreground focus-visible:outline-none whitespace-nowrap flex-1 min-h-[36px] min-w-0 box-border"
          aria-label="Text"
        >
          Text
        </TabsTrigger>
      </TabsList>

      <TabsContent value="aspect" className="space-y-6 mt-6">
        <div className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Aspect Ratio</Label>
          <AspectRatioDropdown />
          
          {/* Selected Aspect Ratio Display */}
          {selectedAspectRatio && (() => {
            const selectedRatio = aspectRatios.find((ar) => ar.id === selectedAspectRatio);
            if (!selectedRatio) return null;
            
            return (
              <div className="mt-3">
                <Label className="text-xs text-gray-400 mb-2 block">Selected</Label>
                <GlassInputWrapper intensity="default">
                  <div
                    className="relative rounded-lg overflow-hidden bg-transparent"
                    style={{
                      aspectRatio: `${selectedRatio.width} / ${selectedRatio.height}`,
                      maxHeight: '120px',
                    }}
                  >
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-900 text-white">
                      {selectedRatio.width}:{selectedRatio.height}
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-gray-900/90 to-transparent">
                      <div className="text-[10px] font-semibold text-white">
                        {selectedRatio.name}
                      </div>
                      {selectedRatio.useCase && (
                        <div className="text-[9px] mt-0.5 text-gray-200">
                          {selectedRatio.useCase}
                        </div>
                      )}
                    </div>
                  </div>
                </GlassInputWrapper>
              </div>
            );
          })()}
        </div>
      </TabsContent>

      <TabsContent value="background" className="space-y-6 mt-6">
        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Background Type</Label>
            <div className="flex gap-2">
              <Button
                variant={backgroundConfig.type === 'gradient' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBackgroundType('gradient')}
                className={`flex-1 text-xs transition-all rounded-lg ${
                  backgroundConfig.type === 'gradient'
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
                    : 'border-border hover:border-border/80 hover:bg-accent text-foreground'
                }`}
              >
                Gradient
              </Button>
              <Button
                variant={backgroundConfig.type === 'solid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBackgroundType('solid')}
                className={`flex-1 text-xs transition-all rounded-lg ${
                  backgroundConfig.type === 'solid'
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
                    : 'border-border hover:border-border/80 hover:bg-accent text-foreground'
                }`}
              >
                Solid
              </Button>
              <Button
                variant={backgroundConfig.type === 'image' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBackgroundType('image')}
                className={`flex-1 text-xs transition-all rounded-lg ${
                  backgroundConfig.type === 'image'
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
                    : 'border-border hover:border-border/80 hover:bg-accent text-foreground'
                }`}
              >
                Image
              </Button>
            </div>
          </div>

          {backgroundConfig.type === 'gradient' && (
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Gradient</Label>
              <div className="grid grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {(Object.keys(gradientColors) as GradientKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setBackgroundValue(key)}
                    className={`h-16 rounded-lg border-2 transition-all ${
                      backgroundConfig.value === key
                        ? 'border-primary ring-2 ring-primary/20 shadow-sm'
                        : 'border-border hover:border-border/80'
                    }`}
                    style={{
                      background: gradientColors[key],
                    }}
                    title={key.replace(/_/g, ' ')}
                  />
                ))}
              </div>
            </div>
          )}

          {backgroundConfig.type === 'solid' && (
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Color</Label>
              <div className="grid grid-cols-4 gap-2.5">
                {(Object.keys(solidColors) as SolidColorKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setBackgroundValue(key)}
                    className={`h-10 rounded-lg border-2 transition-all ${
                      backgroundConfig.value === key
                        ? 'border-primary ring-2 ring-primary/20 shadow-sm'
                        : 'border-border hover:border-border/80'
                    }`}
                    style={{
                      backgroundColor: solidColors[key],
                    }}
                    title={key.replace(/_/g, ' ')}
                  />
                ))}
              </div>
            </div>
          )}

          {backgroundConfig.type === 'image' && (
            <div className="space-y-4">
              {/* Current Background Preview */}
              {backgroundConfig.value && 
               (backgroundConfig.value.startsWith('blob:') || 
                backgroundConfig.value.startsWith('http') || 
                backgroundConfig.value.startsWith('data:') ||
                cloudinaryPublicIds.includes(backgroundConfig.value)) && (
                <div className="space-y-3">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current Background</Label>
                  <div className="relative rounded-lg overflow-hidden border border-border aspect-video bg-gray-50">
                    {(() => {
                      // Check if it's a Cloudinary public ID
                      const isCloudinaryPublicId = typeof backgroundConfig.value === 'string' && 
                        !backgroundConfig.value.startsWith('blob:') && 
                        !backgroundConfig.value.startsWith('http') && 
                        !backgroundConfig.value.startsWith('data:') &&
                        cloudinaryPublicIds.includes(backgroundConfig.value);
                      
                      let imageUrl = backgroundConfig.value as string;
                      
                      // If it's a Cloudinary public ID, get the optimized URL
                      if (isCloudinaryPublicId) {
                        imageUrl = getCldImageUrl({
                          src: backgroundConfig.value as string,
                          width: 600,
                          height: 400,
                          quality: 'auto',
                          format: 'auto',
                          crop: 'fill',
                          gravity: 'auto',
                        });
                      }
                      
                      return (
                        <>
                          <img
                            src={imageUrl}
                            alt="Current background"
                            className="w-full h-full object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white border-0 shadow-md px-3 py-1.5 h-auto"
                            onClick={() => {
                              // Reset to default gradient
                              setBackgroundType('gradient');
                              setBackgroundValue('primary_gradient');
                              // If it's a blob URL, revoke it
                              if (backgroundConfig.value.startsWith('blob:')) {
                                URL.revokeObjectURL(backgroundConfig.value);
                              }
                            }}
                          >
                            <X size={14} weight="bold" />
                            <span className="text-xs font-medium">Remove</span>
                          </Button>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {cloudinaryPublicIds.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preset Backgrounds</Label>
                  <div className="grid grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                    {cloudinaryPublicIds.map((publicId, idx) => {
                      const thumbnailUrl = getCldImageUrl({
                        src: publicId,
                        width: 300,
                        height: 200,
                        quality: 'auto',
                        format: 'auto',
                        crop: 'fill',
                        gravity: 'auto',
                      });

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setBackgroundValue(publicId);
                            setBackgroundType('image');
                          }}
                          className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                            backgroundConfig.value === publicId
                              ? 'border-primary ring-2 ring-primary/20 shadow-sm'
                              : 'border-border hover:border-border/80'
                          }`}
                          title={`Use background ${idx + 1}`}
                        >
                          <img
                            src={thumbnailUrl}
                            alt={`Background ${idx + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Upload Background Image</Label>
                <div
                  {...getBgRootProps()}
                  className={`border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
                    isBgDragActive
                      ? 'border-gray-900 bg-gray-50 scale-[1.02]'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                  }`}
                >
                  <input {...getBgInputProps()} />
                  <div className={`mb-3 transition-colors flex items-center justify-center w-full ${isBgDragActive ? 'text-gray-900' : 'text-gray-400'}`}>
                    <ImageIcon size={40} weight="duotone" />
                  </div>
                  {isBgDragActive ? (
                    <p className="text-sm font-medium text-gray-900 text-center">Drop the image here...</p>
                  ) : (
                    <div className="space-y-1 text-center">
                      <p className="text-xs font-medium text-gray-700">
                        Drag & drop an image here
                      </p>
                      <p className="text-xs text-gray-500">
                        or click to browse • PNG, JPG, WEBP up to {MAX_IMAGE_SIZE / 1024 / 1024}MB
                      </p>
                    </div>
                  )}
                </div>
                {bgUploadError && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                    {bgUploadError}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-medium text-gray-700">Background Blur</Label>
                  <span className="text-xs text-gray-500">
                    {backgroundConfig.blur || 0}px
                  </span>
                </div>
                <Slider
                  value={[backgroundConfig.blur || 0]}
                  onValueChange={(value) => setBackgroundBlur(value[0])}
                  min={0}
                  max={100}
                  step={1}
                />
                <p className="text-xs text-gray-400">
                  Adjust the blur intensity for the background image
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Border Radius</Label>
            <div className="flex gap-2 mb-3">
              <Button
                variant={backgroundBorderRadius === 0 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBackgroundBorderRadius(0)}
                className={`flex-1 text-xs transition-all rounded-lg ${
                  backgroundBorderRadius === 0
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
                    : 'border-border hover:border-border/80 hover:bg-accent text-foreground'
                }`}
              >
                Sharp Edge
              </Button>
              <Button
                variant={backgroundBorderRadius > 0 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBackgroundBorderRadius(24)}
                className={`flex-1 text-xs transition-all rounded-lg ${
                  backgroundBorderRadius > 0
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
                    : 'border-border hover:border-border/80 hover:bg-accent text-foreground'
                }`}
              >
                Rounded
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <Label className="text-xs font-medium text-gray-700">Border Radius</Label>
              <span className="text-xs text-gray-500">{backgroundBorderRadius}px</span>
            </div>
            <Slider
              value={[backgroundBorderRadius]}
              onValueChange={(value) => setBackgroundBorderRadius(value[0])}
              min={0}
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-medium text-gray-700">Opacity</Label>
              <span className="text-xs text-gray-500">
                {Math.round((backgroundConfig.opacity || 1) * 100)}%
              </span>
            </div>
            <Slider
              value={[backgroundConfig.opacity || 1]}
              onValueChange={(value) => setBackgroundOpacity(value[0])}
              min={0}
              max={1}
              step={0.01}
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="image" className="space-y-6 mt-6">
        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Border Radius</Label>
            <div className="flex gap-2 mb-3">
              <Button
                variant={borderRadius === 0 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBorderRadius(0)}
                className={`flex-1 text-xs transition-all rounded-lg ${
                  borderRadius === 0
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
                    : 'border-border hover:border-border/80 hover:bg-accent text-foreground'
                }`}
              >
                Sharp Edge
              </Button>
              <Button
                variant={borderRadius > 0 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBorderRadius(24)}
                className={`flex-1 text-xs transition-all rounded-lg ${
                  borderRadius > 0
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
                    : 'border-border hover:border-border/80 hover:bg-accent text-foreground'
                }`}
              >
                Rounded
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <Label className="text-xs font-medium text-gray-700">Border Radius</Label>
              <span className="text-xs text-gray-500">{borderRadius}px</span>
            </div>
            <Slider
              value={[borderRadius]}
              onValueChange={(value) => setBorderRadius(value[0])}
              min={0}
              max={100}
              step={1}
            />
          </div>

          <BorderControls border={imageBorder} onBorderChange={setImageBorder} />

          <ShadowControls shadow={imageShadow} onShadowChange={setImageShadow} />

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-medium text-gray-700">Image Size</Label>
              <span className="text-xs text-gray-500">
                {imageScale}%
              </span>
            </div>
            <Slider
              value={[imageScale]}
              onValueChange={(value) => setImageScale(value[0])}
              min={10}
              max={200}
              step={1}
            />
            <p className="text-xs text-gray-400">
              Adjust the size of the image (10% - 200%)
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-medium text-gray-700">Image Opacity</Label>
              <span className="text-xs text-gray-500">
                {Math.round(imageOpacity * 100)}%
              </span>
            </div>
            <Slider
              value={[imageOpacity]}
              onValueChange={(value) => setImageOpacity(value[0])}
              min={0}
              max={1}
              step={0.01}
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="text" className="mt-6">
        <TextOverlayControls />
      </TabsContent>
    </Tabs>
  );
}
