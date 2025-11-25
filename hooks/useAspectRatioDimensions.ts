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
    
    // Determine layout constraints based on viewport size.
    // On mobile the side panels are hidden inside sheets, so we should not
    // subtract their desktop width (otherwise calculations go negative and
    // the canvas collapses). This keeps the preview and export canvases in sync.
    const MOBILE_BREAKPOINT = 768;
    const isMobileViewport = viewportSize.width < MOBILE_BREAKPOINT;
    const sidePanelsWidth = isMobileViewport ? 0 : 640; // left + right panels on desktop
    const horizontalPadding = isMobileViewport ? 32 : 48; // reduce padding on small screens
    const verticalPadding = isMobileViewport ? 140 : 200; // header + footer allowance

    const rawAvailableWidth = viewportSize.width - sidePanelsWidth - horizontalPadding;
    const rawAvailableHeight = viewportSize.height - verticalPadding;

    // Prevent negative/too-small values so fit calculations remain stable.
    const MIN_AVAILABLE = 320;
    const availableWidth = Math.max(rawAvailableWidth, MIN_AVAILABLE);
    const availableHeight = Math.max(rawAvailableHeight, MIN_AVAILABLE);

    // Allow a little breathing room on larger screens without over-scaling mobile.
    const widthScale = isMobileViewport ? 1 : 1.1;
    const heightScale = isMobileViewport ? 1 : 1.1;
    const maxWidth = Math.min(availableWidth * widthScale, 3000);
    const maxHeight = Math.min(availableHeight * heightScale, 1500);
    
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

