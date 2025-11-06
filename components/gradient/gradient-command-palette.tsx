'use client';

import * as React from 'react';
import { CommandPalette, type CommandPaletteItem } from '@/components/ui/command-palette';
import { gradientColors, type GradientKey } from '@/lib/constants/gradient-colors';
import { Button } from '@/components/ui/button';
import { Command } from 'lucide-react';

/**
 * Generate a random RGB color
 */
function randomColor(): string {
  return `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
}

/**
 * Generate a random gradient
 */
export function generateRandomGradient(): string {
  const type = Math.random() > 0.5 ? 'linear' : 'radial';
  const angle = Math.floor(Math.random() * 360);
  const colorCount = Math.floor(Math.random() * 3) + 2; // 2-4 colors
  
  const colors: string[] = [];
  for (let i = 0; i < colorCount; i++) {
    colors.push(randomColor());
  }
  
  const stops = colors.map((color, index) => {
    const stop = Math.floor((index / (colors.length - 1)) * 100);
    return `${color} ${stop}%`;
  }).join(', ');
  
  if (type === 'linear') {
    return `linear-gradient(${angle}deg, ${stops})`;
  } else {
    return `radial-gradient(circle at center, ${stops})`;
  }
}

interface GradientCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectGradient: (gradientKey: GradientKey) => void;
  onSelectRandomGradient: (gradientValue: string) => void;
  currentGradient?: GradientKey;
}

export function GradientCommandPalette({
  open,
  onOpenChange,
  onSelectGradient,
  onSelectRandomGradient,
  currentGradient,
}: GradientCommandPaletteProps) {
  const items: CommandPaletteItem[] = React.useMemo(() => {
    return (Object.keys(gradientColors) as GradientKey[]).map((key) => ({
      id: key,
      label: key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
      keywords: [key, ...key.split('_')],
      action: () => onSelectGradient(key),
    }));
  }, [onSelectGradient]);

  const handleGenerateRandom = () => {
    const randomGradient = generateRandomGradient();
    onSelectRandomGradient(randomGradient);
  };

  return (
    <CommandPalette
      open={open}
      onOpenChange={onOpenChange}
      items={items}
      searchPlaceholder="Search gradients..."
      title="Gradient Palette"
      emptyMessage="No gradients found"
      generateRandomLabel="Generate Random Gradient"
      onGenerateRandom={handleGenerateRandom}
    />
  );
}

interface GradientCommandPaletteTriggerProps {
  onClick: () => void;
}

export function GradientCommandPaletteTrigger({ onClick }: GradientCommandPaletteTriggerProps) {
  const [isMac, setIsMac] = React.useState(false);

  React.useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      className="w-full h-8 text-xs font-medium rounded-lg border-border/50 hover:bg-accent text-foreground bg-background hover:border-border flex items-center justify-center gap-2"
    >
      <Command className="h-3.5 w-3.5" />
      <span>Open Gradient Palette</span>
      <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
        {isMac ? '⌘K' : 'Ctrl+K'}
      </kbd>
    </Button>
  );
}
