/**
 * ColorProcessor - Handles OKLCH to RGB color conversion
 */
export class ColorProcessor {
  /**
   * Convert oklch color to RGB
   */
  static convertOklchToRGB(oklchColor: string): string {
    // If it's not oklch, return as-is
    if (!oklchColor.includes('oklch')) {
      return oklchColor
    }

    // Extract oklch values using regex
    const oklchMatch = oklchColor.match(/oklch\(([^)]+)\)/)
    if (!oklchMatch) {
      return oklchColor
    }

    const values = oklchMatch[1].split(/\s+/).map((v) => parseFloat(v.trim()))
    if (values.length < 3) {
      return oklchColor
    }

    // Use the browser's computed style to convert
    const tempEl = document.createElement('div')
    tempEl.style.color = oklchColor
    document.body.appendChild(tempEl)
    const computed = window.getComputedStyle(tempEl).color
    document.body.removeChild(tempEl)

    return computed || oklchColor
  }

  /**
   * Convert CSS string that may contain oklch to RGB
   */
  static convertCSSStringToRGB(cssString: string): string {
    // Handle gradients with oklch colors
    if (cssString.includes('oklch')) {
      // Replace oklch colors in the string
      return cssString.replace(/oklch\([^)]+\)/g, (match) => {
        return this.convertOklchToRGB(match)
      })
    }
    return cssString
  }
}
