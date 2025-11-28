'use client';

import { useEffect, useState } from 'react';

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

interface Frame3DOverlayProps {
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
}

function ImageFrame3D({ 
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
    <img
      src={imageUrl}
      alt="frame"
      style={{
        position: 'absolute',
        inset: 0,
        width: `${width}px`,
        height: `${height}px`,
        objectFit: 'cover',
        borderRadius: `${cornerRadius}px`,
      }}
    />
  );
}

export function Frame3DOverlay({
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
}: Frame3DOverlayProps) {
  if (!showFrame || frame.type === 'none') {
    return null;
  }

  if (frame.type === 'arc-light' || frame.type === 'arc-dark') {
    return null;
  }

  const imageUrl = borderImageMap[frame.type];
  if (imageUrl) {
    return (
      <ImageFrame3D
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

