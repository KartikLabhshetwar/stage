'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface ColorStop {
  color: string;
  position: number;
  id: string;
}

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

// Convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

// Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

// Convert HSL to RGB
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export function ColorPicker({ color, onChange, label = 'PICKER' }: ColorPickerProps) {
  const [hex, setHex] = React.useState(color);
  const [rgb, setRgb] = React.useState(() => hexToRgb(color) || { r: 0, g: 0, b: 0 });
  const [alpha, setAlpha] = React.useState(100);
  const [hsl, setHsl] = React.useState(() => {
    const rgb = hexToRgb(color) || { r: 0, g: 0, b: 0 };
    return rgbToHsl(rgb.r, rgb.g, rgb.b);
  });

  const [isDragging, setIsDragging] = React.useState(false);
  const pickerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const rgb = hexToRgb(color);
    if (rgb) {
      setRgb(rgb);
      setHsl(rgbToHsl(rgb.r, rgb.g, rgb.b));
    }
  }, [color]);

  const updateColor = React.useCallback((newRgb: { r: number; g: number; b: number }, newAlpha: number = alpha) => {
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setHex(newHex);
    setRgb(newRgb);
    setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
    setAlpha(newAlpha);
    onChange(newHex);
  }, [onChange, alpha]);

  const handlePickerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pickerRef.current) return;
    const rect = pickerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const s = (x / rect.width) * 100;
    const l = 100 - (y / rect.height) * 100;
    const newRgb = hslToRgb(hsl.h, s, l);
    updateColor(newRgb);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !pickerRef.current) return;
    const rect = pickerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    const s = (x / rect.width) * 100;
    const l = 100 - (y / rect.height) * 100;
    const newRgb = hslToRgb(hsl.h, s, l);
    updateColor(newRgb);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', () => setIsDragging(false));
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', () => setIsDragging(false));
      };
    }
  }, [isDragging, hsl.h]);

  const handleHueChange = (value: number[]) => {
    const newH = value[0];
    setHsl((prev) => ({ ...prev, h: newH }));
    const newRgb = hslToRgb(newH, hsl.s, hsl.l);
    updateColor(newRgb);
  };

  const handleAlphaChange = (value: number[]) => {
    const newAlpha = value[0];
    setAlpha(newAlpha);
  };

  const handleHexChange = (value: string) => {
    setHex(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      const rgb = hexToRgb(value);
      if (rgb) {
        updateColor(rgb);
      }
    }
  };

  const handleRgbChange = (channel: 'r' | 'g' | 'b', value: number) => {
    const newRgb = { ...rgb, [channel]: Math.max(0, Math.min(255, value)) };
    updateColor(newRgb);
  };

  // Generate hue gradient
  const hueGradient = `linear-gradient(to right, ${Array.from({ length: 360 }, (_, i) => {
    const rgb = hslToRgb(i, 100, 50);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  }).join(', ')})`;

  // Generate saturation/lightness gradient
  const slGradient = `linear-gradient(to top, 
    hsl(${hsl.h}, 0%, 0%) 0%,
    hsl(${hsl.h}, 0%, 50%) 50%,
    hsl(${hsl.h}, 0%, 100%) 100%
  ), linear-gradient(to right,
    hsl(${hsl.h}, 0%, 50%) 0%,
    hsl(${hsl.h}, 100%, 50%) 100%
  )`;

  return (
    <div className="space-y-3">
      <Label className="text-xs font-semibold text-foreground uppercase tracking-wide">{label}</Label>
      
      {/* Color Picker Area */}
      <div
        ref={pickerRef}
        className="relative w-full h-48 rounded-lg overflow-hidden border border-border cursor-crosshair"
        style={{ background: slGradient }}
        onClick={handlePickerClick}
        onMouseDown={() => setIsDragging(true)}
      >
        {/* Color selector */}
        <div
          className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg pointer-events-none"
          style={{
            left: `${hsl.s}%`,
            top: `${100 - hsl.l}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      {/* Hex Input */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-muted-foreground">HEX</Label>
        <Input
          type="text"
          value={hex}
          onChange={(e) => handleHexChange(e.target.value)}
          className="h-8 text-xs font-mono"
          placeholder="#000000"
        />
      </div>

      {/* RGB Inputs */}
      <div className="grid grid-cols-4 gap-2">
        <div className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">R</Label>
          <Input
            type="number"
            value={rgb.r}
            onChange={(e) => handleRgbChange('r', parseInt(e.target.value) || 0)}
            className="h-8 text-xs"
            min={0}
            max={255}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">G</Label>
          <Input
            type="number"
            value={rgb.g}
            onChange={(e) => handleRgbChange('g', parseInt(e.target.value) || 0)}
            className="h-8 text-xs"
            min={0}
            max={255}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">B</Label>
          <Input
            type="number"
            value={rgb.b}
            onChange={(e) => handleRgbChange('b', parseInt(e.target.value) || 0)}
            className="h-8 text-xs"
            min={0}
            max={255}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">A</Label>
          <Input
            type="number"
            value={alpha}
            onChange={(e) => handleAlphaChange([parseInt(e.target.value) || 0])}
            className="h-8 text-xs"
            min={0}
            max={100}
          />
        </div>
      </div>

      {/* Hue Slider */}
      <div className="space-y-2">
        <Slider
          value={[hsl.h]}
          onValueChange={handleHueChange}
          min={0}
          max={360}
          step={1}
          className="w-full"
        />
      </div>

      {/* Alpha Slider */}
      <div className="space-y-2">
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `linear-gradient(to right, 
                ${rgbToHex(rgb.r, rgb.g, rgb.b)}00 0%,
                ${rgbToHex(rgb.r, rgb.g, rgb.b)}FF 100%
              )`,
            }}
          />
          <Slider
            value={[alpha]}
            onValueChange={handleAlphaChange}
            min={0}
            max={100}
            step={1}
            className="w-full relative"
          />
        </div>
      </div>
    </div>
  );
}

