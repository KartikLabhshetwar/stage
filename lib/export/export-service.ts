/**
 * Export service for handling image exports (fully in-browser)
 *
 * Pure Canvas Architecture:
 * - Uses Konva canvas for ALL rendering (background, patterns, noise, images, text, overlays)
 * - Only uses modern-screenshot for 3D perspective transforms (HTML fallback)
 * - No html2canvas for backgrounds/overlays (everything is in Konva now)
 *
 * All export operations run client-side without external services.
 * Cloudinary is optional and only used for image optimization when configured.
 */

import html2canvas from 'html2canvas';
import Konva from 'konva';
import { domToCanvas } from 'modern-screenshot';
import {
  convertStylesToRGB,
  injectRGBOverrides,
  generateNoiseTexture,
} from './export-utils';
import { addWatermarkToCanvas } from './watermark';
import { getBackgroundCSS } from '@/lib/constants/backgrounds';
import { getFontCSS } from '@/lib/constants/fonts';

export interface ExportOptions {
  format: 'png';
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
  borderRadius: number,
  backgroundBlur: number = 0
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

  // Apply blur effect if specified
  if (backgroundBlur > 0) {
    bgElement.style.filter = `blur(${backgroundBlur}px)`;
  }

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
 * Apply blur effect to a canvas using Canvas 2D context filter
 * This is more reliable than relying on html2canvas to capture CSS filters
 * 
 * @param canvas - The canvas to apply blur to
 * @param blurAmount - Blur amount in pixels (should be scaled for high-DPI exports)
 * @returns A new canvas with the blur effect applied
 */
function applyBlurToCanvas(
  canvas: HTMLCanvasElement,
  blurAmount: number
): HTMLCanvasElement {
  if (blurAmount <= 0) {
    return canvas;
  }

  const blurredCanvas = document.createElement('canvas');
  blurredCanvas.width = canvas.width;
  blurredCanvas.height = canvas.height;
  const ctx = blurredCanvas.getContext('2d');

  if (!ctx) {
    return canvas;
  }

  // Apply blur filter using Canvas 2D context
  // This is the most reliable way to ensure blur is captured in exports
  ctx.filter = `blur(${blurAmount}px)`;
  ctx.drawImage(canvas, 0, 0);
  ctx.filter = 'none';

  return blurredCanvas;
}

/**
 * Apply opacity to a canvas
 * This ensures background opacity is correctly applied during export
 * 
 * @param canvas - The canvas to apply opacity to
 * @param opacity - Opacity value (0-1)
 * @returns A new canvas with the opacity applied
 */
function applyOpacityToCanvas(
  canvas: HTMLCanvasElement,
  opacity: number
): HTMLCanvasElement {
  if (opacity >= 1) {
    return canvas;
  }

  if (opacity <= 0) {
    const transparentCanvas = document.createElement('canvas');
    transparentCanvas.width = canvas.width;
    transparentCanvas.height = canvas.height;
    return transparentCanvas;
  }

  const opacityCanvas = document.createElement('canvas');
  opacityCanvas.width = canvas.width;
  opacityCanvas.height = canvas.height;
  const ctx = opacityCanvas.getContext('2d', { willReadFrequently: false });

  if (!ctx) {
    return canvas;
  }

  ctx.globalAlpha = opacity;
  ctx.drawImage(canvas, 0, 0);
  ctx.globalAlpha = 1;

  return opacityCanvas;
}

/**
 * Extract noise texture from preview element
 * This ensures the exported noise matches the preview exactly
 */
async function getNoiseTextureFromPreview(): Promise<HTMLCanvasElement | null> {
  // Find the noise overlay element by ID (most reliable)
  let noiseOverlay = document.getElementById('canvas-noise-overlay') as HTMLElement | null;

  // Fallback: try to find it by characteristics if ID doesn't exist
  if (!noiseOverlay) {
    const canvasBackground = document.getElementById('canvas-background');
    if (!canvasBackground) return null;

    const parent = canvasBackground.parentElement;
    if (!parent) return null;

    // Look for the noise overlay div - it has:
    // - backgroundImage with a data URL
    // - mixBlendMode: 'overlay'
    // - pointerEvents: 'none'
    const found = Array.from(parent.children).find((child) => {
      if (child instanceof HTMLElement) {
        const style = window.getComputedStyle(child);
        const bgImage = style.backgroundImage;
        const mixBlendMode = style.mixBlendMode;
        const pointerEvents = style.pointerEvents;

        // Match the noise overlay characteristics
        return bgImage &&
          bgImage.includes('data:image') &&
          bgImage.includes('base64') &&
          mixBlendMode === 'overlay' &&
          pointerEvents === 'none';
      }
      return false;
    }) as HTMLElement | undefined;

    if (!found) return null;
    noiseOverlay = found;
  }

  if (!noiseOverlay) return null;

  // Extract the data URL from the background image
  const style = window.getComputedStyle(noiseOverlay);
  const bgImage = style.backgroundImage;
  const urlMatch = bgImage.match(/url\(['"]?(.+?)['"]?\)/);

  if (!urlMatch || !urlMatch[1]) return null;

  const dataURL = urlMatch[1];

  // Convert data URL to canvas
  return new Promise<HTMLCanvasElement | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas);
      } else {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = dataURL;
  });
}

/**
 * Apply noise overlay to a canvas
 * The noise is composited on top of the existing canvas content
 * Matches preview exactly: same texture size, opacity, and blend mode
 * 
 * @param canvas - The canvas to apply noise to
 * @param noiseIntensity - Noise intensity (0-1), converted from percentage
 * @param width - Canvas width in pixels
 * @param height - Canvas height in pixels
 * @param scale - Export scale factor
 * @returns A new canvas with the noise overlay applied
 */
async function applyNoiseToCanvas(
  canvas: HTMLCanvasElement,
  noiseIntensity: number,
  width: number,
  height: number,
  scale: number
): Promise<HTMLCanvasElement> {
  if (noiseIntensity <= 0) {
    return canvas;
  }

  // Use the actual canvas dimensions (html2canvas may have scaled it)
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = canvasWidth;
  finalCanvas.height = canvasHeight;
  const ctx = finalCanvas.getContext('2d');

  if (!ctx) {
    return canvas;
  }

  // Draw the existing canvas first (this includes the blurred background)
  ctx.drawImage(canvas, 0, 0);

  // Try to extract the noise texture from the preview element first
  // This ensures we use the exact same noise pattern the user sees
  let noiseCanvas: HTMLCanvasElement | null = null;

  const previewNoiseTexture = await getNoiseTextureFromPreview();
  if (previewNoiseTexture) {
    noiseCanvas = previewNoiseTexture;
  } else {
    // Fallback: Generate noise texture if we can't extract from preview
    // This should rarely happen, but ensures export still works
    noiseCanvas = generateNoiseTexture(200, 200, noiseIntensity);
  }

  // Apply noise with overlay blend mode (matching preview's mix-blend-mode: overlay)
  // Use the exact same opacity calculation as preview: backgroundNoise / 100
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = noiseIntensity; // This matches preview's opacity: backgroundNoise / 100

  // Tile the noise texture across the canvas
  // Use imageSmoothingEnabled: false to preserve noise grain sharpness
  ctx.imageSmoothingEnabled = false;
  const pattern = ctx.createPattern(noiseCanvas, 'repeat');
  if (pattern) {
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }
  ctx.imageSmoothingEnabled = true; // Restore for future operations

  ctx.restore();

  return finalCanvas;
}

/**
 * Export overlays (text and image) separately to ensure they appear above user image
 *
 * NOTE: This function is deprecated and no longer used with pure canvas architecture.
 * Text and image overlays are now rendered in Konva canvas. Kept for backwards compatibility.
 */
async function exportOverlays(
  width: number,
  height: number,
  scale: number,
  textOverlays: any[],
  imageOverlays: any[] = []
): Promise<HTMLCanvasElement> {
  // Create export container for overlays only
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '0';
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.overflow = 'visible';
  container.style.background = 'transparent';
  container.style.zIndex = '999999';
  container.style.visibility = 'visible';
  container.style.opacity = '1';

  document.body.appendChild(container);

  try {
    const canvasContainer = document.getElementById('image-render-card');
    if (!canvasContainer) {
      throw new Error('Canvas container not found. Please ensure the canvas is properly initialized.');
    }

    // Get the actual canvas container dimensions
    // The inner div has explicit width/height set in pixels (canvasW, canvasH)
    const innerCanvasDiv = canvasContainer.querySelector('div[style*="position: relative"]') as HTMLElement;
    let actualCanvasWidth = 0;
    let actualCanvasHeight = 0;

    if (innerCanvasDiv) {
      // Try inline style first (most reliable)
      const inlineWidth = innerCanvasDiv.style.width;
      const inlineHeight = innerCanvasDiv.style.height;
      if (inlineWidth && inlineWidth.endsWith('px')) {
        actualCanvasWidth = parseFloat(inlineWidth);
      }
      if (inlineHeight && inlineHeight.endsWith('px')) {
        actualCanvasHeight = parseFloat(inlineHeight);
      }

      // Fallback to computed style
      if (!actualCanvasWidth || !actualCanvasHeight) {
        const computedStyle = window.getComputedStyle(innerCanvasDiv);
        actualCanvasWidth = actualCanvasWidth || parseFloat(computedStyle.width) || 0;
        actualCanvasHeight = actualCanvasHeight || parseFloat(computedStyle.height) || 0;
      }
    }

    // Final fallback to container bounding rect
    const canvasRect = canvasContainer.getBoundingClientRect();
    if (!actualCanvasWidth || !actualCanvasHeight) {
      actualCanvasWidth = canvasRect.width;
      actualCanvasHeight = canvasRect.height;
    }

    // Calculate uniform scale factor to maintain aspect ratio
    // This ensures overlays maintain their relative positions and sizes
    let scaleX = 1;
    let scaleY = 1;
    if (actualCanvasWidth > 0 && actualCanvasHeight > 0) {
      // Use uniform scaling - same scale for both X and Y to prevent distortion
      const scaleX_calc = width / actualCanvasWidth;
      const scaleY_calc = height / actualCanvasHeight;
      // Use the smaller scale to ensure everything fits within export dimensions
      const uniformScale = Math.min(scaleX_calc, scaleY_calc);
      scaleX = uniformScale;
      scaleY = uniformScale;
    }

    // Try to clone existing text overlay elements from DOM first (most reliable)
    let clonedTextElements = false;

    if (canvasContainer) {
      const textOverlayElements = canvasContainer.querySelectorAll('[data-text-overlay-id]');
      if (textOverlayElements.length > 0) {
        for (const originalElement of Array.from(textOverlayElements)) {
          const overlayId = (originalElement as HTMLElement).getAttribute('data-text-overlay-id');
          const overlay = textOverlays.find(o => o.id === overlayId);
          if (!overlay || !overlay.isVisible || overlay.opacity <= 0) continue;

          const clonedElement = originalElement.cloneNode(true) as HTMLElement;
          const computedStyle = window.getComputedStyle(originalElement);

          // Convert percentage-based positioning to pixel-based for export
          const leftPercent = overlay.position.x;
          const topPercent = overlay.position.y;
          clonedElement.style.left = `${(leftPercent / 100) * width}px`;
          clonedElement.style.top = `${(topPercent / 100) * height}px`;

          // Preserve transform (translate(-50%, -50%))
          clonedElement.style.transform = 'translate(-50%, -50%)';

          // Scale font size
          const originalFontSize = parseFloat(computedStyle.fontSize) || overlay.fontSize;
          clonedElement.style.fontSize = `${originalFontSize * scaleX}px`;

          // Scale text shadow if present
          if (overlay.textShadow?.enabled) {
            const shadow = computedStyle.textShadow;
            if (shadow && shadow !== 'none') {
              clonedElement.style.textShadow = shadow.replace(/(\d+\.?\d*)px/g, (match, value) => {
                return `${parseFloat(value) * scaleX}px`;
              });
            }
          }

          clonedElement.style.position = 'absolute';
          clonedElement.style.zIndex = '2000';
          clonedElement.style.visibility = 'visible';
          clonedElement.style.display = 'block';
          clonedElement.style.pointerEvents = 'none';
          clonedElement.style.overflow = 'visible';

          container.appendChild(clonedElement);
        }
        clonedTextElements = true;
      }
    }

    // Fallback: Create text overlays programmatically if cloning failed
    if (!clonedTextElements) {
      for (const overlay of textOverlays) {
        if (!overlay.isVisible) continue;
        if (overlay.opacity <= 0) continue;

        const textElement = document.createElement('div');
        textElement.style.position = 'absolute';
        textElement.style.left = `${(overlay.position.x / 100) * width}px`;
        textElement.style.top = `${(overlay.position.y / 100) * height}px`;
        textElement.style.transform = 'translate(-50%, -50%)';
        textElement.style.fontSize = `${overlay.fontSize * scaleX}px`;
        textElement.style.fontWeight = overlay.fontWeight;
        textElement.style.fontFamily = getFontCSS(overlay.fontFamily);

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
        textElement.style.zIndex = '2000';
        textElement.style.visibility = 'visible';
        textElement.style.display = 'block';
        textElement.style.overflow = 'visible';
        textElement.textContent = overlay.text || '';

        if (overlay.orientation === 'vertical') {
          textElement.style.writingMode = 'vertical-rl';
        }

        if (overlay.textShadow?.enabled) {
          let shadowColor = overlay.textShadow.color;
          if (shadowColor && shadowColor.includes('oklch')) {
            const tempEl = document.createElement('div');
            tempEl.style.color = shadowColor;
            document.body.appendChild(tempEl);
            const computed = window.getComputedStyle(tempEl).color;
            document.body.removeChild(tempEl);
            shadowColor = computed || shadowColor;
          }
          textElement.style.textShadow = `${overlay.textShadow.offsetX * scaleX}px ${overlay.textShadow.offsetY * scaleY}px ${overlay.textShadow.blur * scaleX}px ${shadowColor}`;
        }

        container.appendChild(textElement);
      }
    }

    // Add image overlays with highest z-index
    for (const overlay of imageOverlays) {
      if (!overlay.isVisible) continue;

      const overlayElement = document.createElement('div');
      overlayElement.style.position = 'absolute';
      overlayElement.style.opacity = overlay.opacity.toString();
      overlayElement.style.transformOrigin = 'center center';
      overlayElement.style.pointerEvents = 'none';
      overlayElement.style.overflow = 'visible'; // Allow overlays to extend beyond bounds
      overlayElement.style.zIndex = '3000'; // Highest z-index for image overlays
      overlayElement.style.visibility = 'visible';
      overlayElement.style.display = 'block';

      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      img.style.objectFit = 'contain';
      img.style.display = 'block';

      let imageSrc = overlay.src;
      if (typeof overlay.src === 'string' && !overlay.isCustom) {
        const isCloudinaryId = overlay.src.startsWith('overlays/');

        if (isCloudinaryId) {
          const cloudName = typeof window !== 'undefined'
            ? (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
            (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string)
            : (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string);

          // If Cloudinary is not configured, log warning but use src directly
          if (!cloudName) {
            console.warn(`Cloudinary cloud name not found. Image overlay "${overlay.src}" will be used as-is. For optimized images, set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in your environment variables.`);
            // Use the src directly - it might be a local URL or uploaded image
          } else {
            // Calculate export size based on uniform scale to maintain aspect ratio
            // Use overlay.size scaled by the uniform scale factor, with 2x for high-res export
            const exportSize = Math.max(Math.round(overlay.size * scaleX * 2), 200);

            try {
              const { getCldImageUrl } = await import('@/lib/cloudinary');
              // Request square dimensions from Cloudinary to match the square container
              // The 'fit' crop will maintain the image's aspect ratio within the square
              const generatedUrl = getCldImageUrl({
                src: overlay.src,
                width: exportSize,
                height: exportSize,
                quality: 'auto',
                format: 'auto',
                crop: 'fit', // Maintain aspect ratio, fit within square bounds
              });

              if (generatedUrl && (generatedUrl.startsWith('http://') || generatedUrl.startsWith('https://'))) {
                imageSrc = generatedUrl;
              } else {
                // Fallback: construct Cloudinary URL manually with 'fit' crop
                imageSrc = `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto,c_fit,w_${exportSize},h_${exportSize}/${overlay.src}`;
              }
            } catch (error) {
              console.warn(`getCldImageUrl failed for ${overlay.src}, using manual URL construction:`, error);
              // Fallback: construct Cloudinary URL manually with 'fit' crop
              imageSrc = `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto,c_fit,w_${exportSize},h_${exportSize}/${overlay.src}`;
            }
          }
        }
      }

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`Timeout loading overlay image: ${overlay.src} (URL: ${imageSrc})`));
        }, 30000); // 30 second timeout

        img.onload = () => {
          clearTimeout(timeout);
          overlayElement.style.width = `${overlay.size * scaleX}px`;
          overlayElement.style.height = `${overlay.size * scaleY}px`;
          overlayElement.style.left = `${overlay.position.x * scaleX}px`;
          overlayElement.style.top = `${overlay.position.y * scaleY}px`;

          overlayElement.style.transform = `
            rotate(${overlay.rotation}deg)
            scaleX(${overlay.flipX ? -1 : 1})
            scaleY(${overlay.flipY ? -1 : 1})
          `;

          img.style.width = '100%';
          img.style.height = '100%';
          overlayElement.appendChild(img);
          resolve();
        };
        img.onerror = (error) => {
          clearTimeout(timeout);
          reject(new Error(`Failed to load overlay image: ${overlay.src} (URL: ${imageSrc}). Error: ${error}`));
        };
        img.src = imageSrc;
      });

      container.appendChild(overlayElement);
    }

    // Wait for fonts to load
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    // Wait longer for text elements to render and fonts to apply
    await new Promise(resolve => setTimeout(resolve, 300));

    // Force multiple reflows to ensure all styles are applied
    void container.offsetHeight;
    void container.offsetWidth;
    void container.scrollHeight;

    // Capture overlays with html2canvas
    const overlaysCanvas = await html2canvas(container, {
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
      },
    });

    document.body.removeChild(container);
    return overlaysCanvas;
  } catch (error) {
    // Clean up container on error
    if (container.parentNode) {
      document.body.removeChild(container);
    }
    throw error;
  }
}

/**
 * Export background only (without overlays) using html2canvas
 *
 * NOTE: This function is deprecated and no longer used with pure canvas architecture.
 * Background is now rendered in Konva canvas. Kept for backwards compatibility.
 */
async function exportBackground(
  width: number,
  height: number,
  scale: number,
  backgroundConfig: any,
  borderRadius: number,
  backgroundBlur: number = 0,
  backgroundNoise: number = 0,
  backgroundOpacity: number = 1
): Promise<HTMLCanvasElement> {
  // Get the existing canvas-background element from the DOM - required for export
  const existingBgElement = document.getElementById('canvas-background');

  if (!existingBgElement) {
    throw new Error('Canvas background element not found. Please ensure the canvas is properly initialized.');
  }

  // Create export container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '0';
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.overflow = 'visible';
  container.style.isolation = 'isolate';
  container.style.background = 'transparent';
  container.style.zIndex = '999999';
  container.style.visibility = 'visible';
  container.style.opacity = '1';

  document.body.appendChild(container);

  try {
    // Clone the background element and resize to export dimensions
    const bgElement = existingBgElement.cloneNode(true) as HTMLElement;
    bgElement.style.width = `${width}px`;
    bgElement.style.height = `${height}px`;
    bgElement.style.position = 'absolute';
    bgElement.style.top = '0';
    bgElement.style.left = '0';
    bgElement.id = 'export-background-temp';

    // Remove blur from CSS - we'll apply it via canvas after capture
    // This ensures we can blur background without blurring noise
    bgElement.style.setProperty('filter', 'none', 'important');

    container.appendChild(bgElement);

    // Get actual canvas container dimensions for proper scaling
    const canvasContainer = document.getElementById('image-render-card');
    if (!canvasContainer) {
      throw new Error('Canvas container not found. Please ensure the canvas is properly initialized.');
    }

    const canvasRect = canvasContainer.getBoundingClientRect();
    let scaleX = 1;
    let scaleY = 1;
    if (canvasRect.width > 0 && canvasRect.height > 0) {
      scaleX = width / canvasRect.width;
      scaleY = height / canvasRect.height;
    }

    // Note: Text and image overlays are now exported separately in exportOverlays()
    // to ensure they appear above the user image in the final export

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

    // Wait for fonts to load and styles to apply
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    // Wait longer for all elements to render properly
    await new Promise(resolve => setTimeout(resolve, 300));

    // Force a reflow to ensure all styles are applied
    void container.offsetHeight;

    // Capture background and text overlays with html2canvas
    // Exclude noise overlay - we'll apply it via canvas after blur
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
        // Ignore noise overlay if it exists - we'll apply it via canvas
        return element.id === 'export-noise-overlay' || element.id === 'canvas-noise-overlay';
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

        // Preserve filter styles (blur, etc.) in cloned document
        const clonedBgElement = clonedElement.querySelector('#export-background-temp') as HTMLElement;
        if (clonedBgElement) {
          // Ensure filter is preserved in cloned document
          if (backgroundBlur > 0) {
            clonedBgElement.style.setProperty('filter', `blur(${backgroundBlur}px)`, 'important');
          } else {
            // Clear filter if blur is 0
            clonedBgElement.style.setProperty('filter', 'none', 'important');
          }
        }

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

    // Step 1: Apply blur to background (noise was excluded from capture)
    const blurredCanvas = backgroundBlur > 0
      ? applyBlurToCanvas(canvas, backgroundBlur * scale)
      : canvas;

    // Step 2: Apply noise overlay on top of blurred background
    // This matches the preview exactly: sharp noise on top of blurred background
    const canvasWithNoise = backgroundNoise > 0
      ? await applyNoiseToCanvas(blurredCanvas, backgroundNoise / 100, width, height, scale)
      : blurredCanvas;

    // Step 3: Apply opacity to the final background
    // This ensures opacity is correctly applied during export, matching the preview
    return applyOpacityToCanvas(canvasWithNoise, backgroundOpacity);
  } catch (error) {
    // Clean up container on error
    if (container.parentNode) {
      document.body.removeChild(container);
    }
    throw error;
  }
}

/**
 * Capture 3D transformed element using modern-screenshot
 * This properly captures CSS 3D transforms including perspective
 */
async function capture3DTransformWithModernScreenshot(
  elementId: string,
  scale: number
): Promise<HTMLCanvasElement> {
  // Find the 3D overlay element
  const container = document.getElementById(elementId);
  if (!container) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  const overlayElement = container.querySelector('[data-3d-overlay="true"]') as HTMLElement;
  if (!overlayElement) {
    throw new Error('3D overlay element not found');
  }

  // Get the bounding box of the overlay element
  const rect = overlayElement.getBoundingClientRect();
  const overlayComputedStyle = window.getComputedStyle(overlayElement);

  // Create a temporary container for capture
  // Position it off-screen to avoid affecting the viewport
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '-9999px';
  tempContainer.style.width = `${rect.width}px`;
  tempContainer.style.height = `${rect.height}px`;
  tempContainer.style.overflow = 'visible';

  // Clone the overlay element with all its styles
  // The overlay element itself has perspective, which applies to its children
  const clonedOverlay = overlayElement.cloneNode(true) as HTMLElement;

  // Preserve all computed styles from the original overlay
  clonedOverlay.style.position = 'relative';
  clonedOverlay.style.left = '0';
  clonedOverlay.style.top = '0';
  clonedOverlay.style.width = overlayComputedStyle.width;
  clonedOverlay.style.height = overlayComputedStyle.height;
  clonedOverlay.style.perspective = overlayComputedStyle.perspective;
  clonedOverlay.style.transformStyle = overlayComputedStyle.transformStyle;

  // Clone the image inside with all its transform styles
  const originalImg = overlayElement.querySelector('img');
  if (originalImg) {
    const clonedImg = originalImg.cloneNode(true) as HTMLImageElement;
    const imgComputedStyle = window.getComputedStyle(originalImg);

    // Preserve all image styles including the 3D transform
    clonedImg.style.width = imgComputedStyle.width;
    clonedImg.style.height = imgComputedStyle.height;
    clonedImg.style.objectFit = imgComputedStyle.objectFit;
    clonedImg.style.opacity = imgComputedStyle.opacity;
    clonedImg.style.borderRadius = imgComputedStyle.borderRadius;
    clonedImg.style.transform = imgComputedStyle.transform; // This contains the 3D transform
    clonedImg.style.transformOrigin = imgComputedStyle.transformOrigin;
    clonedImg.style.willChange = imgComputedStyle.willChange;

    // Clear the cloned overlay and add the cloned image
    clonedOverlay.innerHTML = '';
    clonedOverlay.appendChild(clonedImg);
  }

  tempContainer.appendChild(clonedOverlay);
  document.body.appendChild(tempContainer);

  try {
    // Wait for any images to load and styles to apply
    await new Promise(resolve => setTimeout(resolve, 100));

    // Use modern-screenshot to capture the 3D transformed element
    // Capture the overlay element which has perspective and contains the transformed image
    // modern-screenshot properly handles CSS 3D transforms including perspective
    const canvas = await domToCanvas(clonedOverlay, {
      scale: scale,
      width: rect.width,
      height: rect.height,
    });

    return canvas;
  } finally {
    // Clean up temporary container
    document.body.removeChild(tempContainer);
  }
}

/**
 * Export Konva stage as canvas (including all layers - background, patterns, images, overlays)
 * Now that everything is rendered in Konva, we export the complete stage
 */
async function exportKonvaStage(
  stage: Konva.Stage | null,
  targetWidth: number,
  targetHeight: number,
  scale: number,
  format: 'png',
  quality: number
): Promise<HTMLCanvasElement> {
  if (!stage) {
    throw new Error('Konva stage not found');
  }

  // Get current stage dimensions (display dimensions)
  const originalWidth = stage.width();
  const originalHeight = stage.height();

  // Calculate scale factor to match export dimensions
  const scaleX = targetWidth / originalWidth;
  const scaleY = targetHeight / originalHeight;

  // Export Konva stage at its current dimensions with high pixelRatio
  // This preserves exact positioning and includes ALL layers (background, patterns, images, text, overlays)
  const exportPixelRatio = scale * Math.max(scaleX, scaleY);
  const dataURL = stage.toDataURL({
    mimeType: 'image/png',
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
}


/**
 * Composite background, Konva stage, and overlays into final canvas
 * Layer order: background -> user image (Konva) -> text overlays -> image overlays
 *
 * NOTE: This function is deprecated and no longer used with pure canvas architecture.
 * Kept for backwards compatibility. Everything is now in Konva stage.
 */
function compositeCanvases(
  backgroundCanvas: HTMLCanvasElement,
  konvaCanvas: HTMLCanvasElement,
  overlaysCanvas: HTMLCanvasElement | null,
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

  // Use high-quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Layer 1: Draw background first (lowest layer)
  ctx.drawImage(backgroundCanvas, 0, 0, width * scale, height * scale);

  // Layer 2: Draw Konva canvas (user image) on top of background
  ctx.drawImage(konvaCanvas, 0, 0, width * scale, height * scale);

  // Layer 3: Draw overlays on top of user image (highest layer)
  if (overlaysCanvas) {
    ctx.drawImage(overlaysCanvas, 0, 0, width * scale, height * scale);
  }

  return finalCanvas;
}

/**
 * Export element using pure canvas approach: Konva stage contains everything
 * (background, patterns, noise, main image, text overlays, image overlays)
 * Only 3D transforms use HTML fallback since Konva doesn't support CSS 3D transforms
 */
export async function exportElement(
  elementId: string,
  options: ExportOptions,
  konvaStage: Konva.Stage | null,
  backgroundConfig: any,
  backgroundBorderRadius: number,
  textOverlays: any[] = [],
  imageOverlays: any[] = [],
  perspective3D?: any,
  imageSrc?: string,
  screenshotRadius?: number,
  backgroundBlur: number = 0,
  backgroundNoise: number = 0,
  backgroundOpacity: number = 1
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
    // Step 1: Export Konva stage (includes ALL layers: background, patterns, noise, main image, text overlays, image overlays)
    // Since we moved to pure canvas rendering, everything is in the Konva stage
    let konvaCanvas = await exportKonvaStage(
      konvaStage,
      options.exportWidth,
      options.exportHeight,
      options.scale,
      options.format,
      options.quality
    );

    // Step 2: If 3D transforms are active, capture using modern-screenshot and composite on top
    if (perspective3D && imageSrc) {
      const has3DTransform =
        perspective3D.rotateX !== 0 ||
        perspective3D.rotateY !== 0 ||
        perspective3D.rotateZ !== 0 ||
        perspective3D.translateX !== 0 ||
        perspective3D.translateY !== 0 ||
        perspective3D.scale !== 1;

      if (has3DTransform) {
        try {
          // Find the parent container that holds both Konva Stage and 3D overlay
          // This is the div with position: relative that contains everything
          const parentContainer = element.querySelector('div[style*="position: relative"]') as HTMLElement;

          if (parentContainer) {
            // Get the Konva stage dimensions (canvas dimensions)
            const containerW = konvaStage.width();
            const containerH = konvaStage.height();

            // Calculate the scale needed to match export dimensions
            const captureScale = Math.max(
              (options.exportWidth * options.scale) / containerW,
              (options.exportHeight * options.scale) / containerH
            );

            // Capture the entire parent container (Konva + 3D overlay) at the correct scale
            const transformedCanvas = await domToCanvas(parentContainer, {
              scale: captureScale,
              backgroundColor: null,
            });

            // The captured canvas should now match the export dimensions
            // and includes both the Konva background and the 3D transformed image
            if (transformedCanvas.width > 0 && transformedCanvas.height > 0) {
              konvaCanvas = transformedCanvas;
            }
          }
        } catch (error) {
          console.warn('Failed to capture 3D transform with modern-screenshot, using Konva canvas instead:', error);
          console.error('Error details:', error);
        }
      }
    }

    // Step 3: Use the Konva canvas as the final canvas (it already contains everything)
    // No need to composite multiple layers since everything is in Konva now
    const finalCanvas = konvaCanvas;

    // Step 4: Add watermark
    addWatermarkToCanvas(finalCanvas, {
      text: 'stagee.art',
      position: 'bottom-right',
      backgroundColor: 'transparent',
      textColor: 'rgba(255, 255, 255, 0.7)',
    });

    // Step 5: Convert to blob and data URL
    const mimeType = 'image/png';

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

