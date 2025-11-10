export interface FontFamily {
  id: string;
  name: string;
  category: "system" | "custom";
  file?: string; // TTF file path for custom fonts
  fallback?: string; // Fallback font stack
  availableWeights?: string[]; // Available font weights for this font
}

export const fontFamilies: FontFamily[] = [
  // System fonts
  {
    id: "system",
    name: "System Default",
    category: "system",
    fallback:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    availableWeights: ["normal", "bold"],
  },
  {
    id: "arial",
    name: "Arial",
    category: "system",
    fallback: "Arial, Helvetica, sans-serif",
    availableWeights: ["normal", "bold"],
  },
  {
    id: "helvetica",
    name: "Helvetica",
    category: "system",
    fallback: "Helvetica, Arial, sans-serif",
    availableWeights: ["normal", "bold"],
  },
  {
    id: "times",
    name: "Times New Roman",
    category: "system",
    fallback: "Times New Roman, Times, serif",
    availableWeights: ["normal", "bold"],
  },
  {
    id: "georgia",
    name: "Georgia",
    category: "system",
    fallback: "Georgia, Times, serif",
    availableWeights: ["normal", "bold"],
  },
  {
    id: "verdana",
    name: "Verdana",
    category: "system",
    fallback: "Verdana, Geneva, sans-serif",
    availableWeights: ["normal", "bold"],
  },
  {
    id: "courier",
    name: "Courier New",
    category: "system",
    fallback: "Courier New, Courier, monospace",
    availableWeights: ["normal", "bold"],
  },
  {
    id: "impact",
    name: "Impact",
    category: "system",
    fallback: "Impact, Charcoal, sans-serif",
    availableWeights: ["normal"],
  },
  {
    id: "tahoma",
    name: "Tahoma",
    category: "system",
    fallback: "Tahoma, Geneva, sans-serif",
    availableWeights: ["normal", "bold"],
  },
  {
    id: "trebuchet",
    name: "Trebuchet MS",
    category: "system",
    fallback: "Trebuchet MS, Geneva, sans-serif",
    availableWeights: ["normal", "bold"],
  },
  // Google Fonts examples
  {
    id: "ubuntu",
    name: "Ubuntu",
    category: "custom",
    fallback: "Ubuntu, Arial, sans-serif",
    availableWeights: ["normal", "bold"],
  },
  // we will add custom fonts here
];

export const getFontFamily = (id: string): FontFamily | undefined => {
  return fontFamilies.find((font) => font.id === id);
};

export const getFontCSS = (fontId: string): string => {
  const font = getFontFamily(fontId);
  if (!font) return fontFamilies[0].fallback || "system-ui, sans-serif";

  if (font.category === "custom") {
    if (font.file) {
      // Local custom font
      return `"${font.name}", ${font.fallback}`;
    } else {
      // Google Font
      return `"${font.name}", ${font.fallback}`;
    }
  }

  return font.fallback || "system-ui, sans-serif";
};

export const getAvailableFontWeights = (fontId: string): string[] => {
  const font = getFontFamily(fontId);
  if (!font) return ["normal", "bold"];

  return font.availableWeights || ["normal", "bold"];
};
