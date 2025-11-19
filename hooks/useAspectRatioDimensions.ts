/**
 * Hook for getting aspect ratio dimensions
 * Provides reactive dimensions based on selected aspect ratio
 */

import { useMemo, useState, useEffect } from 'react';
import { useImageStore } from '@/lib/store';
import { getAspectRatioPreset, calculateFitDimensions, getAspectRatioCSS } from '@/lib/aspect-ratio-utils';

/**
 * Hook to get canvas dimensions based on selected aspect ratio
 * Returns dimensions that fit within viewport constraints
 */
export function useAspectRatioDimensions(options?: {
  maxWidth?: number;
  maxHeight?: number;
}) {
  const { selectedAspectRatio } = useImageStore();
  
  const dimensions = useMemo(() => {
    const preset = getAspectRatioPreset(selectedAspectRatio);
    if (!preset) {
      return { width: 1920, height: 1080, aspectRatio: '16/9' };
    }
    
    const { maxWidth, maxHeight } = options || {};
    
    // If constraints provided, calculate fit dimensions
    if (maxWidth || maxHeight) {
      const fitDimensions = calculateFitDimensions(
        preset.width,
        preset.height,
        maxWidth,
        maxHeight
      );
      return {
        ...fitDimensions,
        aspectRatio: getAspectRatioCSS(preset.width, preset.height),
        originalWidth: preset.width,
        originalHeight: preset.height,
      };
    }
    
    // Return original dimensions
    return {
      width: preset.width,
      height: preset.height,
      aspectRatio: getAspectRatioCSS(preset.width, preset.height),
      originalWidth: preset.width,
      originalHeight: preset.height,
    };
  }, [selectedAspectRatio, options]);
  
  return dimensions;
}

/**
 * Hook to get responsive canvas dimensions that fit within viewport
 * Automatically calculates max dimensions based on viewport size
 * Reactively updates when window is resized
 */
export function useResponsiveCanvasDimensions() {
  const { selectedAspectRatio } = useImageStore();
  const [viewportSize, setViewportSize] = useState({ width: 1920, height: 1080 });
  
  // Track viewport size changes
  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    // Set initial size
    updateViewportSize();
    
    // Listen for resize events
    window.addEventListener('resize', updateViewportSize);
    return () => window.removeEventListener('resize', updateViewportSize);
  }, []);
  
  const dimensions = useMemo(() => {
    const preset = getAspectRatioPreset(selectedAspectRatio);
    if (!preset) {
      return { width: 1920, height: 1080, aspectRatio: '16/9' };
    }
    
    // Calculate viewport constraints
    // Account for side panels (left: ~320px, right: ~320px) and padding
    // More conservative values to ensure canvas always fits
    const sidePanelsWidth = 640; // Approximate width of left + right panels
    const padding = 48; // Container padding (24px * 2)
    const availableWidth = viewportSize.width - sidePanelsWidth - padding;
    const availableHeight = viewportSize.height - 200; // Account for header/bottom bar
    
    // Increased percentages and max dimensions for larger canvas
    const maxWidth = Math.min(availableWidth * 1.1, 3000);
    const maxHeight = Math.min(availableHeight * 1.1, 1500);
    
    const fitDimensions = calculateFitDimensions(
      preset.width,
      preset.height,
      maxWidth,
      maxHeight
    );
    
    return {
      ...fitDimensions,
      aspectRatio: getAspectRatioCSS(preset.width, preset.height),
      originalWidth: preset.width,
      originalHeight: preset.height,
    };
  }, [selectedAspectRatio, viewportSize.width, viewportSize.height]);
  
  return dimensions;
}

