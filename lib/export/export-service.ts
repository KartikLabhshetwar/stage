/**
 * Export service for handling image exports
 * Uses html2canvas for backgrounds and Konva for user-uploaded images
 */

import html2canvas from 'html2canvas';
import Konva from 'konva';
import {
  convertStylesToRGB,
  injectRGBOverrides,
  preserveImageStyles,
  convertSVGStyles,
  setupExportElement,
  waitForImages,  
} from './export-utils';
import { addWatermarkToCanvas } from './watermark';
import { getBackgroundCSS } from '@/lib/constants/backgrounds';
import { getFontCSS } from '@/lib/constants/fonts';

export interface ExportOptions {
  format: 'png' | 'jpg';
  quality: number;
  scale: number;
  exportWidth: number;
  exportHeight: number;
}

export interface ExportResult {
  dataURL: string;
  blob: Blob;
}

/**
 * Convert oklch color to RGB
 */
function convertOklchToRGB(oklchColor: string): string {
  // If it's not oklch, return as-is
  if (!oklchColor.includes('oklch')) {
    return oklchColor;
  }
  
  // Extract oklch values using regex
  const oklchMatch = oklchColor.match(/oklch\(([^)]+)\)/);
  if (!oklchMatch) {
    return oklchColor;
  }
  
  const values = oklchMatch[1].split(/\s+/).map(v => parseFloat(v.trim()));
  if (values.length < 3) {
    return oklchColor;
  }
  
  const [L, C, H] = values;
  const alpha = values[3] !== undefined ? values[3] : 1;
  
  // Convert oklch to RGB (simplified conversion)
  // This is a basic approximation - for production, consider using a library
  // For now, we'll use the browser's computed style to convert
  const tempEl = document.createElement('div');
  tempEl.style.color = oklchColor;
  document.body.appendChild(tempEl);
  const computed = window.getComputedStyle(tempEl).color;
  document.body.removeChild(tempEl);
  
  return computed || oklchColor;
}

/**
 * Convert CSS string that may contain oklch to RGB
 */
function convertCSSStringToRGB(cssString: string): string {
  // Handle gradients with oklch colors
  if (cssString.includes('oklch')) {
    // Replace oklch colors in the string
    return cssString.replace(/oklch\([^)]+\)/g, (match) => {
      return convertOklchToRGB(match);
    });
  }
  return cssString;
}

/**
 * Create a background-only DOM element for html2canvas to capture
 */
function createBackgroundElement(
  width: number,
  height: number,
  backgroundConfig: any,
  borderRadius: number
): HTMLElement {
  const bgElement = document.createElement('div');
  bgElement.id = 'export-background-temp';
  bgElement.style.width = `${width}px`;
  bgElement.style.height = `${height}px`;
  bgElement.style.position = 'absolute';
  bgElement.style.top = '0';
  bgElement.style.left = '0';
  bgElement.style.margin = '0';
  bgElement.style.padding = '0';
  bgElement.style.borderRadius = `${borderRadius}px`;
  bgElement.style.overflow = 'hidden';
  
  // Apply background styles
  const backgroundStyle = getBackgroundCSS(backgroundConfig);
  
  // Convert oklch colors to RGB before applying
  const convertedStyle: React.CSSProperties = {};
  Object.keys(backgroundStyle).forEach((key) => {
    const value = (backgroundStyle as any)[key];
    if (typeof value === 'string') {
      // Check if value contains oklch
      if (value.includes('oklch')) {
        // Convert oklch to RGB using browser's computed style
        const tempEl = document.createElement('div');
        (tempEl.style as any)[key] = value;
        document.body.appendChild(tempEl);
        const computed = window.getComputedStyle(tempEl).getPropertyValue(key);
        document.body.removeChild(tempEl);
        (convertedStyle as any)[key] = computed || value;
      } else {
        // Check for CSS variables that might resolve to oklch
        const tempEl = document.createElement('div');
        (tempEl.style as any)[key] = value;
        document.body.appendChild(tempEl);
        const computed = window.getComputedStyle(tempEl).getPropertyValue(key);
        document.body.removeChild(tempEl);
        // Use computed value if it doesn't contain oklch, otherwise use original
        if (computed && !computed.includes('oklch')) {
          (convertedStyle as any)[key] = computed;
        } else {
          (convertedStyle as any)[key] = value;
        }
      }
    } else {
      (convertedStyle as any)[key] = value;
    }
  });
  
  // Apply styles to element
  Object.assign(bgElement.style, convertedStyle);
  
  // Ensure element is visible
  bgElement.style.visibility = 'visible';
  bgElement.style.display = 'block';
  bgElement.style.zIndex = '1';
  
  return bgElement;
}

/**
 * Export background and text overlays using html2canvas
 */
async function exportBackground(
  width: number,
  height: number,
  scale: number,
  backgroundConfig: any,
  borderRadius: number,
  textOverlays: any[]
): Promise<HTMLCanvasElement> {
  // Try to use the existing canvas-background element from the DOM
  const existingBgElement = document.getElementById('canvas-background');
  
  if (existingBgElement) {
    // Use the existing element - clone it for export
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    container.style.overflow = 'hidden';
    container.style.isolation = 'isolate';
    container.style.background = 'transparent';
    
    document.body.appendChild(container);
    
    // Clone the background element and resize to export dimensions
    const bgElement = existingBgElement.cloneNode(true) as HTMLElement;
    bgElement.style.width = `${width}px`;
    bgElement.style.height = `${height}px`;
    bgElement.style.position = 'absolute';
    bgElement.style.top = '0';
    bgElement.style.left = '0';
    bgElement.id = 'export-background-temp';
    container.appendChild(bgElement);
    
    // Add text overlays
    textOverlays.forEach((overlay) => {
      if (!overlay.isVisible) return;
      
      const textElement = document.createElement('div');
      textElement.style.position = 'absolute';
      textElement.style.left = `${(overlay.position.x / 100) * width}px`;
      textElement.style.top = `${(overlay.position.y / 100) * height}px`;
      textElement.style.transform = 'translate(-50%, -50%)';
      textElement.style.fontSize = `${overlay.fontSize}px`;
      textElement.style.fontWeight = overlay.fontWeight;
      textElement.style.fontFamily = getFontCSS(overlay.fontFamily);
      
      // Convert oklch color to RGB
      let textColor = overlay.color;
      if (textColor && textColor.includes('oklch')) {
        const tempEl = document.createElement('div');
        tempEl.style.color = textColor;
        document.body.appendChild(tempEl);
        const computed = window.getComputedStyle(tempEl).color;
        document.body.removeChild(tempEl);
        textColor = computed || textColor;
      }
      textElement.style.color = textColor;
      
      textElement.style.opacity = overlay.opacity.toString();
      textElement.style.whiteSpace = 'nowrap';
      textElement.style.pointerEvents = 'none';
      textElement.textContent = overlay.text;
      
      if (overlay.orientation === 'vertical') {
        textElement.style.writingMode = 'vertical-rl';
      }
      
      if (overlay.textShadow?.enabled) {
        // Convert shadow color if it contains oklch
        let shadowColor = overlay.textShadow.color;
        if (shadowColor && shadowColor.includes('oklch')) {
          const tempEl = document.createElement('div');
          tempEl.style.color = shadowColor;
          document.body.appendChild(tempEl);
          const computed = window.getComputedStyle(tempEl).color;
          document.body.removeChild(tempEl);
          shadowColor = computed || shadowColor;
        }
        textElement.style.textShadow = `${overlay.textShadow.offsetX}px ${overlay.textShadow.offsetY}px ${overlay.textShadow.blur}px ${shadowColor}`;
      }
      
      container.appendChild(textElement);
    });
    
    try {
      // Wait for background image to load if it's an image background
      if (backgroundConfig.type === 'image' && backgroundConfig.value) {
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            setTimeout(() => resolve(), 100);
          };
          img.onerror = () => resolve();
          const bgStyle = getBackgroundCSS(backgroundConfig);
          if (bgStyle.backgroundImage) {
            const urlMatch = bgStyle.backgroundImage.match(/url\(['"]?(.+?)['"]?\)/);
            if (urlMatch && urlMatch[1]) {
              img.src = urlMatch[1];
            } else {
              resolve();
            }
          } else {
            resolve();
          }
        });
      }
      
      // Convert all oklch colors in the container to RGB before capture
      const allElements = container.querySelectorAll('*');
      allElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          const computedStyle = window.getComputedStyle(el);
          const styleProps = ['color', 'backgroundColor', 'background', 'backgroundImage', 'textShadow'];
          
          styleProps.forEach((prop) => {
            try {
              const value = (computedStyle as any)[prop];
              if (value && typeof value === 'string' && value.includes('oklch')) {
                const computed = window.getComputedStyle(el).getPropertyValue(prop);
                if (computed && !computed.includes('oklch')) {
                  (el.style as any)[prop] = computed;
                        }
                      }
                    } catch (e) {
              // Ignore errors
            }
          });
        }
      });
      
      // Wait a moment for styles to apply
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Capture background and text overlays with html2canvas
      const canvas = await html2canvas(container, {
        backgroundColor: null,
        scale: scale,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: width,
        height: height,
        windowWidth: width,
        windowHeight: height,
        removeContainer: false,
        onclone: (clonedDoc, clonedElement) => {
          // Disable stylesheets that contain oklch
          try {
            const stylesheets = Array.from(clonedDoc.styleSheets);
            stylesheets.forEach((sheet) => {
              try {
                if (sheet.href && (sheet.href.includes('globals.css') || sheet.href.includes('tailwind'))) {
                  (sheet as any).disabled = true;
                }
              } catch (e) {
                // Ignore cross-origin errors
                    }
                  });
                } catch (e) {
                  // Ignore errors
                }
          
          // Inject RGB overrides to prevent oklch colors
          injectRGBOverrides(clonedDoc);
          
          // Convert any remaining oklch colors in the cloned document
          const clonedElements = clonedElement.querySelectorAll('*');
          clonedElements.forEach((el) => {
            if (el instanceof HTMLElement) {
              convertStylesToRGB(el, clonedDoc);
            }
          });
          convertStylesToRGB(clonedElement as HTMLElement, clonedDoc);
          
          // Force recompute all styles to ensure RGB conversion
          clonedElements.forEach((el) => {
            if (el instanceof HTMLElement) {
              void clonedDoc.defaultView?.getComputedStyle(el);
            }
          });
          void clonedDoc.defaultView?.getComputedStyle(clonedElement);
        },
      });
      
      document.body.removeChild(container);
      return canvas;
    } catch (error) {
      document.body.removeChild(container);
      throw error;
    }
  }
  
  // Fallback: Create temporary container - isolated from main document styles
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.overflow = 'hidden';
  container.style.isolation = 'isolate'; // Isolate from parent styles
  container.style.background = 'transparent'; // Ensure transparent background
  
  document.body.appendChild(container);
  
  // Create background element
  const bgElement = createBackgroundElement(width, height, backgroundConfig, borderRadius);
  container.appendChild(bgElement);
  
  // Add text overlays if any
  textOverlays.forEach((overlay) => {
    if (!overlay.isVisible) return;
    
    const textElement = document.createElement('div');
    textElement.style.position = 'absolute';
    textElement.style.left = `${(overlay.position.x / 100) * width}px`;
    textElement.style.top = `${(overlay.position.y / 100) * height}px`;
    textElement.style.transform = 'translate(-50%, -50%)';
    textElement.style.fontSize = `${overlay.fontSize}px`;
    textElement.style.fontWeight = overlay.fontWeight;
    textElement.style.fontFamily = getFontCSS(overlay.fontFamily);
    
    // Convert oklch color to RGB
    let textColor = overlay.color;
    if (textColor && textColor.includes('oklch')) {
      const tempEl = document.createElement('div');
      tempEl.style.color = textColor;
      document.body.appendChild(tempEl);
      const computed = window.getComputedStyle(tempEl).color;
      document.body.removeChild(tempEl);
      textColor = computed || textColor;
    }
    textElement.style.color = textColor;
    
    textElement.style.opacity = overlay.opacity.toString();
    textElement.style.whiteSpace = 'nowrap';
    textElement.style.pointerEvents = 'none';
    textElement.textContent = overlay.text;
    
    if (overlay.orientation === 'vertical') {
      textElement.style.writingMode = 'vertical-rl';
    }
    
    if (overlay.textShadow?.enabled) {
      // Convert shadow color if it contains oklch
      let shadowColor = overlay.textShadow.color;
      if (shadowColor && shadowColor.includes('oklch')) {
        const tempEl = document.createElement('div');
        tempEl.style.color = shadowColor;
        document.body.appendChild(tempEl);
        const computed = window.getComputedStyle(tempEl).color;
        document.body.removeChild(tempEl);
        shadowColor = computed || shadowColor;
      }
      textElement.style.textShadow = `${overlay.textShadow.offsetX}px ${overlay.textShadow.offsetY}px ${overlay.textShadow.blur}px ${shadowColor}`;
    }
    
    container.appendChild(textElement);
  });
  
  try {
    // Wait for background image to load if it's an image background
    if (backgroundConfig.type === 'image' && backgroundConfig.value) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          setTimeout(() => resolve(), 100);
        };
        img.onerror = () => resolve(); // Continue even if image fails
        const bgStyle = getBackgroundCSS(backgroundConfig);
        if (bgStyle.backgroundImage) {
          const urlMatch = bgStyle.backgroundImage.match(/url\(['"]?(.+?)['"]?\)/);
          if (urlMatch && urlMatch[1]) {
            img.src = urlMatch[1];
          } else {
            resolve();
          }
        } else {
          resolve();
        }
      });
    }
    
    // Convert all oklch colors in the container to RGB before capture
    const allElements = container.querySelectorAll('*');
    allElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        const computedStyle = window.getComputedStyle(el);
        const styleProps = ['color', 'backgroundColor', 'background', 'backgroundImage', 'textShadow'];
        
        styleProps.forEach((prop) => {
          try {
            const value = (computedStyle as any)[prop];
            if (value && typeof value === 'string' && value.includes('oklch')) {
              // Set the computed RGB value
              const computed = window.getComputedStyle(el).getPropertyValue(prop);
              if (computed && !computed.includes('oklch')) {
                (el.style as any)[prop] = computed;
              }
            }
          } catch (e) {
            // Ignore errors
          }
        });
      }
    });
    
    // Also convert the container itself
    const containerComputed = window.getComputedStyle(container);
    const containerProps = ['color', 'backgroundColor', 'background'];
    containerProps.forEach((prop) => {
      try {
        const value = (containerComputed as any)[prop];
        if (value && typeof value === 'string' && value.includes('oklch')) {
          const computed = containerComputed.getPropertyValue(prop);
          if (computed && !computed.includes('oklch')) {
            (container.style as any)[prop] = computed;
          }
        }
      } catch (e) {
        // Ignore errors
      }
    });
    
    // Wait a moment for styles to apply
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Capture background and text overlays with html2canvas
    // Use ignoreElements to exclude any elements that might have oklch
    const canvas = await html2canvas(container, {
      backgroundColor: null,
      scale: scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: width,
      height: height,
      windowWidth: width,
      windowHeight: height,
      removeContainer: false,
      ignoreElements: (element) => {
        // Don't ignore our elements, but this helps html2canvas skip problematic ones
        return false;
      },
      onclone: (clonedDoc, clonedElement) => {
        // Disable stylesheets that contain oklch
        try {
          const stylesheets = Array.from(clonedDoc.styleSheets);
          stylesheets.forEach((sheet) => {
            try {
              if (sheet.href && (sheet.href.includes('globals.css') || sheet.href.includes('tailwind'))) {
                (sheet as any).disabled = true;
              }
            } catch (e) {
              // Ignore cross-origin errors
            }
          });
        } catch (e) {
          // Ignore errors
        }
        
        // Inject RGB overrides to prevent oklch colors
        injectRGBOverrides(clonedDoc);
        
        // Convert any remaining oklch colors in the cloned document
        const clonedElements = clonedElement.querySelectorAll('*');
        clonedElements.forEach((el) => {
          if (el instanceof HTMLElement) {
            convertStylesToRGB(el, clonedDoc);
          }
        });
        convertStylesToRGB(clonedElement as HTMLElement, clonedDoc);
        
        // Force recompute all styles to ensure RGB conversion
        clonedElements.forEach((el) => {
          if (el instanceof HTMLElement) {
            void clonedDoc.defaultView?.getComputedStyle(el);
          }
        });
        void clonedDoc.defaultView?.getComputedStyle(clonedElement);
    },
  });

    return canvas;
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
}

/**
 * Export Konva stage as canvas (excluding background layer)
 */
async function exportKonvaStage(
  stage: Konva.Stage | null,
  targetWidth: number,
  targetHeight: number,
  scale: number,
  format: 'png' | 'jpg',
  quality: number
): Promise<HTMLCanvasElement> {
  if (!stage) {
    throw new Error('Konva stage not found');
  }
  
  // Get current stage dimensions (display dimensions)
  const originalWidth = stage.width();
  const originalHeight = stage.height();
  
  // Get all layers
  const layers = stage.getLayers();
  
  // Find background layer (first layer typically contains backgrounds)
  const backgroundLayer = layers[0];
  const wasBackgroundVisible = backgroundLayer ? backgroundLayer.visible() : true;
  
  try {
    // Temporarily hide background layer
    if (backgroundLayer) {
      backgroundLayer.visible(false);
    }
    
    // Calculate scale factor to match export dimensions
    const scaleX = targetWidth / originalWidth;
    const scaleY = targetHeight / originalHeight;
    
    // Export Konva stage at its current dimensions with high pixelRatio
    // This preserves exact positioning
    const exportPixelRatio = scale * Math.max(scaleX, scaleY);
    const dataURL = stage.toDataURL({
      mimeType: format === 'jpg' ? 'image/jpeg' : 'image/png',
      quality: quality,
      pixelRatio: exportPixelRatio,
    });
    
    // Convert data URL to canvas
    const tempCanvas = document.createElement('canvas');
    const tempImg = new Image();
    await new Promise<void>((resolve, reject) => {
      tempImg.onload = () => {
        tempCanvas.width = tempImg.width;
        tempCanvas.height = tempImg.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        tempCtx.drawImage(tempImg, 0, 0);
        resolve();
      };
      tempImg.onerror = reject;
      tempImg.src = dataURL;
    });
    
    // Now scale the canvas to match export dimensions
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = targetWidth * scale;
    finalCanvas.height = targetHeight * scale;
    const ctx = finalCanvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    
    // Use high-quality image scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Draw the scaled image
    ctx.drawImage(
      tempCanvas,
      0, 0, tempCanvas.width, tempCanvas.height,
      0, 0, targetWidth * scale, targetHeight * scale
    );
    
    return finalCanvas;
  } finally {
    // Restore visibility
    if (backgroundLayer) {
      backgroundLayer.visible(wasBackgroundVisible);
    }
    stage.getLayers().forEach(layer => layer.draw());
  }
}

/**
 * Composite background and Konva stage into final canvas
 */
function compositeCanvases(
  backgroundCanvas: HTMLCanvasElement,
  konvaCanvas: HTMLCanvasElement,
  width: number,
  height: number,
  scale: number
): HTMLCanvasElement {
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = width * scale;
  finalCanvas.height = height * scale;
  const ctx = finalCanvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  // Draw background first
  ctx.drawImage(backgroundCanvas, 0, 0, width * scale, height * scale);
  
  // Draw Konva canvas on top
  ctx.drawImage(konvaCanvas, 0, 0, width * scale, height * scale);
  
  return finalCanvas;
}

/**
 * Export element using hybrid approach: html2canvas for background, Konva for images
 */
export async function exportElement(
  elementId: string,
  options: ExportOptions,
  konvaStage: Konva.Stage | null,
  backgroundConfig: any,
  backgroundBorderRadius: number,
  textOverlays: any[] = []
): Promise<ExportResult> {
  // Wait a bit to ensure DOM is ready
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Image render card not found. Please ensure an image is uploaded.');
  }

  if (!konvaStage) {
    throw new Error('Konva stage not found');
  }

  try {
    // Step 1: Export background and text overlays using html2canvas
    const backgroundCanvas = await exportBackground(
      options.exportWidth,
      options.exportHeight,
      options.scale,
      backgroundConfig,
      backgroundBorderRadius,
      textOverlays
    );

    // Step 2: Export Konva stage (user images, frames, patterns, etc.) - excluding backgrounds
    const konvaCanvas = await exportKonvaStage(
      konvaStage,
      options.exportWidth,
      options.exportHeight,
      options.scale,
      options.format,
      options.quality
    );

    // Step 3: Composite both canvases
    const finalCanvas = compositeCanvases(
      backgroundCanvas,
      konvaCanvas,
      options.exportWidth,
      options.exportHeight,
      options.scale
    );

    // Step 4: Add watermark
    addWatermarkToCanvas(finalCanvas, {
      text: 'stage',
      position: 'bottom-right',
      backgroundColor: 'transparent',
      textColor: 'rgba(255, 255, 255, 0.7)',
    });

    // Step 5: Convert to blob and data URL
  const mimeType = options.format === 'jpg' ? 'image/jpeg' : 'image/png';
  
  const blob = await new Promise<Blob>((resolve, reject) => {
      finalCanvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create blob from canvas'));
        return;
      }
      resolve(blob);
    }, mimeType, options.quality);
  });
  
    const dataURL = finalCanvas.toDataURL(mimeType, options.quality);
  
  if (!dataURL || dataURL === 'data:,') {
    throw new Error('Failed to generate image data URL');
  }

  return { dataURL, blob };
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}

