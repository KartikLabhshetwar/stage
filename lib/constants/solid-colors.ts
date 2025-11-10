export const solidColors = {
  // Row 1
  white: "#ffffff",
  very_light_gray: "#e5e5e5",
  medium_light_gray: "#b3b3b3",
  dark_gray: "#333333",

  // Row 2
  dark_charcoal: "#4a4a4a",
  darker_charcoal: "#2a2a2a",
  black: "#000000",
  coral_red: "#ff6b6b",
  bright_lime: "#32cd32",

  // Row 3
  orange: "#ffa500",
  bright_yellow: "#ffff00",
  light_olive_green: "#b8d433",
  medium_green: "#4caf50",
  light_pastel_pink: "#ffb3d9",

  // Row 4
  medium_green_2: "#66bb6a",
  light_pastel_pink_2: "#ffc0e1",
  light_peach: "#ffd9b3",
  light_beige: "#fff5e6",
  light_teal: "#80d4c7",

  // Row 5
  light_yellow: "#fffacd",
  light_mint_green: "#c8f7c8",
  light_teal_2: "#7fcdcd",
  medium_blue: "#4a90e2",
  medium_purple_blue: "#8b7ec8",

  // Row 6
  medium_blue_2: "#5dade2",
  medium_purple_blue_2: "#9b7ec8",
  darker_purple: "#6a5acd",
  bright_fuchsia: "#ff00ff",
  light_mint_green_2: "#b3ffb3",

  // Row 7
  light_pastel_blue: "#b3d9ff",
  light_lavender: "#d4b3ff",
  light_pastel_pink_3: "#ffb3d9",
  light_pastel_pink_4: "#ffc0e1",
} as const;

export type SolidColorKey = keyof typeof solidColors;
