/**
 * Export utility functions for style conversion and canvas configuration
 */

/**
 * Convert CSS variables and computed styles to RGB
 */
export function convertStylesToRGB(element: HTMLElement, doc: Document): void {
  const win = doc.defaultView || (doc as any).parentWindow;
  if (!win) return;

  try {
    const computedStyle = win.getComputedStyle(element);
    const allProps = [
      "color",
      "backgroundColor",
      "borderColor",
      "borderTopColor",
      "borderRightColor",
      "borderBottomColor",
      "borderLeftColor",
      "outlineColor",
      "boxShadow",
      "textShadow",
      "background",
      "backgroundImage",
      "backgroundColor",
      "fill",
      "stroke",
    ];

    // Convert all relevant CSS properties
    allProps.forEach((prop) => {
      try {
        const value = computedStyle.getPropertyValue(prop);
        if (value && (value.includes("oklch") || value.includes("var("))) {
          const computed = (computedStyle as any)[prop];
          if (
            computed &&
            computed !== "rgba(0, 0, 0, 0)" &&
            computed !== "transparent" &&
            computed !== "none" &&
            !computed.includes("oklch")
          ) {
            element.style.setProperty(prop, computed, "important");
          }
        }
      } catch (e) {
        // Ignore errors for individual properties
      }
    });

    // Also check inline styles
    if (element.style && element.style.cssText) {
      const cssText = element.style.cssText;
      if (cssText.includes("oklch") || cssText.includes("var(")) {
        // Re-apply computed styles
        allProps.forEach((prop) => {
          try {
            const computed = (computedStyle as any)[prop];
            if (computed && !computed.includes("oklch")) {
              element.style.setProperty(prop, computed, "important");
            }
          } catch (e) {
            // Ignore errors
          }
        });
      }
    }
  } catch (e) {
    // Ignore errors
  }

  // Convert all children recursively
  Array.from(element.children).forEach((child) => {
    if (child instanceof HTMLElement) {
      convertStylesToRGB(child, doc);
    }
  });
}

/**
 * Inject CSS overrides to replace oklch variables
 */
export function injectRGBOverrides(doc: Document): void {
  // Remove or disable stylesheets that might contain oklch
  const stylesheets = Array.from(doc.styleSheets);
  stylesheets.forEach((sheet) => {
    try {
      if (sheet.href && sheet.href.includes("globals.css")) {
        try {
          (sheet as any).disabled = true;
        } catch (e) {
          // Ignore
        }
      }
    } catch (e) {
      // Ignore cross-origin errors
    }
  });

  // Inject CSS overrides with high specificity
  const style = doc.createElement("style");
  style.id = "oklch-rgb-converter";
  style.textContent = `
    :root, :root * {
      --background: rgb(255, 255, 255) !important;
      --foreground: rgb(33, 33, 33) !important;
      --card: rgb(255, 255, 255) !important;
      --card-foreground: rgb(33, 33, 33) !important;
      --popover: rgb(255, 255, 255) !important;
      --popover-foreground: rgb(33, 33, 33) !important;
      --primary: rgb(37, 37, 37) !important;
      --primary-foreground: rgb(251, 251, 251) !important;
      --secondary: rgb(247, 247, 247) !important;
      --secondary-foreground: rgb(37, 37, 37) !important;
      --muted: rgb(247, 247, 247) !important;
      --muted-foreground: rgb(140, 140, 140) !important;
      --accent: rgb(247, 247, 247) !important;
      --accent-foreground: rgb(37, 37, 37) !important;
      --destructive: rgb(239, 68, 68) !important;
      --border: rgb(237, 237, 237) !important;
      --input: rgb(237, 237, 237) !important;
      --ring: rgb(180, 180, 180) !important;
      --sidebar: rgb(251, 251, 251) !important;
      --sidebar-foreground: rgb(33, 33, 33) !important;
      --sidebar-primary: rgb(37, 37, 37) !important;
      --sidebar-primary-foreground: rgb(251, 251, 251) !important;
      --sidebar-accent: rgb(247, 247, 247) !important;
      --sidebar-accent-foreground: rgb(37, 37, 37) !important;
      --sidebar-border: rgb(237, 237, 237) !important;
      --sidebar-ring: rgb(180, 180, 180) !important;
    }
    *:not(img) {
      border-color: rgb(237, 237, 237) !important;
      outline-color: rgba(180, 180, 180, 0.5) !important;
    }
  `;

  const head =
    doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement;
  if (head) {
    head.insertBefore(style, head.firstChild);
  }
}

/**
 * Preserve image styles from original document
 */
export function preserveImageStyles(
  img: HTMLImageElement,
  clonedDoc: Document,
): void {
  // Force display for images that might be hidden
  if (img.style.display === "none") {
    img.style.display = "";
  }

  // Preserve border styles - get from original document and apply with !important
  const originalImg = document.querySelector(
    `img[src="${img.getAttribute("src")}"]`,
  );
  if (originalImg && originalImg instanceof HTMLElement) {
    const originalStyle = window.getComputedStyle(originalImg);

    // Get border properties
    const borderTop = originalStyle.borderTop;
    const borderRight = originalStyle.borderRight;
    const borderBottom = originalStyle.borderBottom;
    const borderLeft = originalStyle.borderLeft;
    const borderRadius = originalStyle.borderRadius;
    const boxShadow = originalStyle.boxShadow;
    const opacity = originalStyle.opacity;
    const transform = originalStyle.transform;

    // Get border colors separately
    const borderTopColor = originalStyle.borderTopColor;
    const borderRightColor = originalStyle.borderRightColor;
    const borderBottomColor = originalStyle.borderBottomColor;
    const borderLeftColor = originalStyle.borderLeftColor;

    if (
      borderTop &&
      borderTop !== "0px none rgb(0, 0, 0)" &&
      borderTop !== "0px none"
    ) {
      const borderTopWidth = originalStyle.borderTopWidth;
      const borderTopStyle = originalStyle.borderTopStyle;
      if (borderTopWidth !== "0px" && borderTopStyle !== "none") {
        const borderValue = `${borderTopWidth} ${borderTopStyle} ${borderTopColor}`;
        img.style.setProperty("border-top", borderValue, "important");
      }
    }
    if (
      borderRight &&
      borderRight !== "0px none rgb(0, 0, 0)" &&
      borderRight !== "0px none"
    ) {
      const borderRightWidth = originalStyle.borderRightWidth;
      const borderRightStyle = originalStyle.borderRightStyle;
      if (borderRightWidth !== "0px" && borderRightStyle !== "none") {
        const borderValue = `${borderRightWidth} ${borderRightStyle} ${borderRightColor}`;
        img.style.setProperty("border-right", borderValue, "important");
      }
    }
    if (
      borderBottom &&
      borderBottom !== "0px none rgb(0, 0, 0)" &&
      borderBottom !== "0px none"
    ) {
      const borderBottomWidth = originalStyle.borderBottomWidth;
      const borderBottomStyle = originalStyle.borderBottomStyle;
      if (borderBottomWidth !== "0px" && borderBottomStyle !== "none") {
        const borderValue = `${borderBottomWidth} ${borderBottomStyle} ${borderBottomColor}`;
        img.style.setProperty("border-bottom", borderValue, "important");
      }
    }
    if (
      borderLeft &&
      borderLeft !== "0px none rgb(0, 0, 0)" &&
      borderLeft !== "0px none"
    ) {
      const borderLeftWidth = originalStyle.borderLeftWidth;
      const borderLeftStyle = originalStyle.borderLeftStyle;
      if (borderLeftWidth !== "0px" && borderLeftStyle !== "none") {
        const borderValue = `${borderLeftWidth} ${borderLeftStyle} ${borderLeftColor}`;
        img.style.setProperty("border-left", borderValue, "important");
      }
    }
    if (borderRadius && borderRadius !== "0px") {
      img.style.setProperty("border-radius", borderRadius, "important");
    }
    if (boxShadow && boxShadow !== "none") {
      img.style.setProperty("box-shadow", boxShadow, "important");
    }
    if (opacity && opacity !== "1") {
      img.style.setProperty("opacity", opacity, "important");
    }
    if (transform && transform !== "none") {
      img.style.setProperty("transform", transform, "important");
    }
  }
}

/**
 * Convert SVG elements fill/stroke attributes
 */
export function convertSVGStyles(
  targetElement: HTMLElement,
  clonedDoc: Document,
): void {
  const svgElements = targetElement.querySelectorAll("svg, [fill], [stroke]");
  svgElements.forEach((svg) => {
    if (svg instanceof HTMLElement || svg instanceof SVGElement) {
      const fill = svg.getAttribute("fill");
      const stroke = svg.getAttribute("stroke");

      if (fill && (fill.includes("oklch") || fill.includes("var("))) {
        const temp = clonedDoc.createElement("div");
        temp.style.color = fill;
        const computed = clonedDoc.defaultView?.getComputedStyle(temp).color;
        if (computed && !computed.includes("oklch")) {
          svg.setAttribute("fill", computed);
        }
        temp.remove();
      }

      if (stroke && (stroke.includes("oklch") || stroke.includes("var("))) {
        const temp = clonedDoc.createElement("div");
        temp.style.color = stroke;
        const computed = clonedDoc.defaultView?.getComputedStyle(temp).color;
        if (computed && !computed.includes("oklch")) {
          svg.setAttribute("stroke", computed);
        }
        temp.remove();
      }
    }
  });
}

/**
 * Setup element for export with proper dimensions
 */
export function setupExportElement(
  targetElement: HTMLElement,
  exportWidth: number,
  exportHeight: number,
  clonedDoc: Document,
): void {
  targetElement.style.width = `${exportWidth}px`;
  targetElement.style.height = `${exportHeight}px`;
  targetElement.style.maxWidth = "none";
  targetElement.style.maxHeight = "none";

  // Also ensure parent containers don't constrain the size
  let parent = targetElement.parentElement;
  while (parent && parent !== clonedDoc.body) {
    if (parent.style) {
      parent.style.width = "auto";
      parent.style.height = "auto";
      parent.style.maxWidth = "none";
      parent.style.maxHeight = "none";
      parent.style.display = "flex";
      parent.style.alignItems = "center";
      parent.style.justifyContent = "center";
    }
    parent = parent.parentElement;
  }
}

/**
 * Wait for all images to load
 */
export async function waitForImages(element: HTMLElement): Promise<void> {
  const images = element.getElementsByTagName("img");
  const imagePromises = Array.from(images).map((img) => {
    if (img.complete) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Image failed to load"));
      setTimeout(() => reject(new Error("Image load timeout")), 5000);
    });
  });

  try {
    await Promise.all(imagePromises);
  } catch (error) {
    console.warn("Some images failed to load, continuing with export:", error);
  }
}

/**
 * Generate Gaussian (normal) distributed random number using Box-Muller transform
 * This creates more natural-looking noise compared to uniform random
 */
function gaussianRandom(mean: number = 0, stdDev: number = 1): number {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdDev + mean;
}

/**
 * Generate a noise texture canvas with Gaussian-distributed noise
 * This creates realistic image grain/noise similar to film grain or sensor noise
 *
 * @param width - Canvas width in pixels
 * @param height - Canvas height in pixels
 * @param intensity - Noise intensity (0-1), controls the standard deviation
 * @returns Canvas element with noise texture
 */
export function generateNoiseTexture(
  width: number,
  height: number,
  intensity: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) return canvas;

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  // Intensity controls the standard deviation of the Gaussian distribution
  // Higher intensity = more variation in pixel values
  const stdDev = intensity * 50; // Scale to reasonable range (0-50)

  // Generate Gaussian noise for each pixel
  for (let i = 0; i < data.length; i += 4) {
    // Generate Gaussian noise value centered at 128 (mid-gray)
    const noise = gaussianRandom(128, stdDev);

    // Clamp to valid RGB range [0, 255]
    const value = Math.max(0, Math.min(255, Math.round(noise)));

    // Apply same value to R, G, B for grayscale noise
    data[i] = value; // R
    data[i + 1] = value; // G
    data[i + 2] = value; // B
    data[i + 3] = 255; // A (fully opaque)
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}
