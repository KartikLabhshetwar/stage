'use client';

import { Image as KonvaImage } from 'react-konva';
import { useEffect, useState } from 'react';
import { ShadowProps } from '../utils/shadow-utils';

export interface FrameConfig {
  enabled: boolean;
  type: 'none' | 'arc-light' | 'arc-dark' | 'macos-dark' | 'macos-light' | 'windows-dark' | 'windows-light' | 'photograph';
  width: number;
  color: string;
  theme?: 'light' | 'dark';
  padding?: number;
  title?: string;
}

const borderImageMap: Record<string, string> = {
  'arc-light': '/border/arc-light.webp',
  'arc-dark': '/border/arc-dark.webp',
  'macos-dark': '/border/macos-black.webp',
  'macos-light': '/border/macos-black.webp',
  'windows-dark': '/border/macos-black.webp',
  'windows-light': '/border/macos-black.webp',
  'photograph': '/border/photograph.webp',
};

interface FrameRendererProps {
  frame: FrameConfig;
  showFrame: boolean;
  framedW: number;
  framedH: number;
  frameOffset: number;
  windowPadding: number;
  windowHeader: number;
  eclipseBorder: number;
  imageScaledW: number;
  imageScaledH: number;
  screenshotRadius: number;
  shadowProps: ShadowProps | Record<string, never>;
  has3DTransform: boolean;
}

function ImageFrame({ 
  imageUrl, 
  width, 
  height, 
  cornerRadius 
}: { 
  imageUrl: string; 
  width: number; 
  height: number; 
  cornerRadius: number;
}) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setImage(img);
    img.onerror = () => setImage(null);
    img.src = imageUrl;
  }, [imageUrl]);

  if (!image) return null;

  return (
    <KonvaImage
      image={image}
      width={width}
      height={height}
      cornerRadius={cornerRadius}
    />
  );
}

export function FrameRenderer({
  frame,
  showFrame,
  framedW,
  framedH,
  frameOffset,
  windowPadding,
  windowHeader,
  eclipseBorder,
  imageScaledW,
  imageScaledH,
  screenshotRadius,
  shadowProps,
  has3DTransform,
}: FrameRendererProps) {
  if (!showFrame || frame.type === 'none' || has3DTransform) {
    return null;
  }

  if (frame.type === 'arc-light' || frame.type === 'arc-dark') {
    return null;
  }

  const imageUrl = borderImageMap[frame.type];
  if (imageUrl) {
    return (
      <ImageFrame
        imageUrl={imageUrl}
        width={framedW}
        height={framedH}
        cornerRadius={screenshotRadius}
      />
    );
  }

  switch (frame.type) {
    default:
      return null;
  }
}

