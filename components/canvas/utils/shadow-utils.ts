export interface ShadowProps {
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowOpacity?: number;
}

export interface ShadowConfig {
  enabled: boolean;
  elevation: number;
  side: 'bottom' | 'right' | 'bottom-right';
  softness: number;
  color: string;
  intensity: number;
}

export function getShadowProps(shadow: ShadowConfig): ShadowProps | Record<string, never> {
  if (!shadow.enabled) return {};

  const { elevation, side, softness, color, intensity } = shadow;
  const diag = elevation * 0.707;
  const offset =
    side === 'bottom'
      ? { x: 0, y: elevation }
      : side === 'right'
      ? { x: elevation, y: 0 }
      : side === 'bottom-right'
      ? { x: diag, y: diag }
      : { x: 0, y: 0 };

  return {
    shadowColor: color,
    shadowBlur: softness,
    shadowOffsetX: offset.x,
    shadowOffsetY: offset.y,
    shadowOpacity: intensity,
  };
}

