'use client';

import * as React from 'react';
import { ColorPicker, ColorStop } from './color-picker';
import { GradientBar } from './gradient-bar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RotateCw, X, Download, Copy, Code, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { exportGradientAsJSON, exportGradientAsCSS, copyGradientToClipboard } from '@/lib/gradient-export';

interface GradientEditorProps {
  gradient: string;
  onChange: (gradient: string) => void;
}

// Parse gradient string to extract stops
function parseGradient(gradient: string): { stops: ColorStop[]; type: 'linear' | 'radial'; angle: number } {
  const stops: ColorStop[] = [];
  let type: 'linear' | 'radial' = 'linear';
  let angle = 90;

  // Try to parse linear gradient
  const linearMatch = gradient.match(/linear-gradient\((\d+)deg,\s*(.+)\)/);
  if (linearMatch) {
    type = 'linear';
    angle = parseInt(linearMatch[1], 10);
    const stopsString = linearMatch[2];
    // Match both hex and rgb colors
    const stopMatches = stopsString.matchAll(/(#[0-9A-Fa-f]{6}|rgb\([^)]+\))\s+(\d+)%/g);
    let index = 0;
    for (const match of stopMatches) {
      stops.push({
        id: `stop-${index}`,
        color: match[1],
        position: parseInt(match[2], 10),
      });
      index++;
    }
  } else {
    // Try radial gradient
    const radialMatch = gradient.match(/radial-gradient\([^,]+,\s*(.+)\)/);
    if (radialMatch) {
      type = 'radial';
      const stopsString = radialMatch[1];
      const stopMatches = stopsString.matchAll(/(#[0-9A-Fa-f]{6}|rgb\([^)]+\))\s+(\d+)%/g);
      let index = 0;
      for (const match of stopMatches) {
        stops.push({
          id: `stop-${index}`,
          color: match[1],
          position: parseInt(match[2], 10),
        });
        index++;
      }
    }
  }

  // If no stops found, create default
  if (stops.length === 0) {
    stops.push(
      { id: 'stop-0', color: '#000000', position: 0 },
      { id: 'stop-1', color: '#ffffff', position: 100 }
    );
  }

  return { stops, type, angle };
}

// Generate gradient string from stops
function generateGradientString(stops: ColorStop[], type: 'linear' | 'radial', angle: number): string {
  const sortedStops = [...stops].sort((a, b) => a.position - b.position);
  const stopStrings = sortedStops.map((stop) => `${stop.color} ${stop.position}%`).join(', ');
  
  if (type === 'linear') {
    return `linear-gradient(${angle}deg, ${stopStrings})`;
  } else {
    return `radial-gradient(circle at center, ${stopStrings})`;
  }
}

interface GradientEditorDialogProps {
  gradient: string;
  onChange: (gradient: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GradientEditorDialog({ gradient, onChange, open, onOpenChange }: GradientEditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6" showCloseButton={true}>
        <DialogTitle className="text-lg font-semibold mb-4">Custom Gradient Editor</DialogTitle>
        <GradientEditor gradient={gradient} onChange={onChange} />
      </DialogContent>
    </Dialog>
  );
}

export function GradientEditor({ gradient, onChange }: GradientEditorProps) {
  const parsed = React.useMemo(() => parseGradient(gradient), [gradient]);
  const [stops, setStops] = React.useState<ColorStop[]>(parsed.stops);
  const [selectedStopId, setSelectedStopId] = React.useState<string | null>(stops[0]?.id || null);
  const [gradientType, setGradientType] = React.useState<'linear' | 'radial'>(parsed.type);
  const [angle, setAngle] = React.useState(parsed.angle);
  const [copySuccess, setCopySuccess] = React.useState(false);

  React.useEffect(() => {
    const parsed = parseGradient(gradient);
    setStops(parsed.stops);
    setGradientType(parsed.type);
    setAngle(parsed.angle);
    if (parsed.stops.length > 0 && !selectedStopId) {
      setSelectedStopId(parsed.stops[0].id);
    }
  }, [gradient]);

  const selectedStop = stops.find((s) => s.id === selectedStopId);

  const updateGradient = React.useCallback((newStops: ColorStop[], newType?: 'linear' | 'radial', newAngle?: number) => {
    const finalType = newType ?? gradientType;
    const finalAngle = newAngle ?? angle;
    const gradientString = generateGradientString(newStops, finalType, finalAngle);
    onChange(gradientString);
  }, [onChange, gradientType, angle]);

  // Debounce gradient updates for smoother performance
  const debounceTimer = React.useRef<NodeJS.Timeout | null>(null);
  
  const debouncedUpdateGradient = React.useCallback((newStops: ColorStop[], newType?: 'linear' | 'radial', newAngle?: number) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      updateGradient(newStops, newType, newAngle);
    }, 16); // ~60fps
  }, [updateGradient]);

  React.useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleStopSelect = (stopId: string) => {
    setSelectedStopId(stopId);
  };

  const handleStopMove = React.useCallback((stopId: string, position: number) => {
    const newStops = stops.map((stop) =>
      stop.id === stopId ? { ...stop, position: Math.max(0, Math.min(100, position)) } : stop
    );
    setStops(newStops);
    // Use immediate update for stop movement for better UX
    updateGradient(newStops);
  }, [stops, updateGradient]);

  const handleStopColorChange = React.useCallback((color: string) => {
    if (!selectedStopId) return;
    const newStops = stops.map((stop) =>
      stop.id === selectedStopId ? { ...stop, color } : stop
    );
    setStops(newStops);
    // Use immediate update for color changes
    updateGradient(newStops);
  }, [selectedStopId, stops, updateGradient]);

  const handleAddStop = () => {
    const newStop: ColorStop = {
      id: `stop-${Date.now()}`,
      color: selectedStop?.color || '#808080',
      position: 50,
    };
    const newStops = [...stops, newStop].sort((a, b) => a.position - b.position);
    setStops(newStops);
    setSelectedStopId(newStop.id);
    updateGradient(newStops);
  };

  const handleRemoveStop = (stopId: string) => {
    if (stops.length <= 2) return; // Keep at least 2 stops
    const newStops = stops.filter((stop) => stop.id !== stopId);
    setStops(newStops);
    if (selectedStopId === stopId) {
      setSelectedStopId(newStops[0]?.id || null);
    }
    updateGradient(newStops);
  };

  const handleTypeChange = (type: 'linear' | 'radial') => {
    setGradientType(type);
    updateGradient(stops, type);
  };

  const handleAngleChange = (newAngle: number) => {
    const clampedAngle = Math.max(0, Math.min(360, newAngle));
    setAngle(clampedAngle);
    updateGradient(stops, gradientType, clampedAngle);
  };

  const handleResetAngle = () => {
    setAngle(90);
    updateGradient(stops, gradientType, 90);
  };

  const handleCopy = async () => {
    try {
      await copyGradientToClipboard(gradient);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy gradient:', error);
    }
  };

  const handleExportJSON = () => {
    exportGradientAsJSON(gradient, 'custom-gradient');
  };

  const handleExportCSS = () => {
    exportGradientAsCSS(gradient, 'custom-gradient');
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-end gap-2">
        {/* Export Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs font-medium rounded-lg border-border/50 hover:bg-accent"
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              {copySuccess ? 'Copied!' : 'Copy Gradient'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExportJSON}>
              <Code className="h-4 w-4 mr-2" />
              Export as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportCSS}>
              <Code className="h-4 w-4 mr-2" />
              Export as CSS
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Gradient Bar */}
      <div className="space-y-3">
        <GradientBar
          stops={stops}
          selectedStopId={selectedStopId}
          onStopSelect={handleStopSelect}
          onStopMove={handleStopMove}
          gradientType={gradientType}
          angle={angle}
        />

        {/* Controls Row */}
        <div className="flex items-center gap-3">
          {/* Type Toggle */}
          <div className="flex gap-1 border border-border rounded-lg p-0.5 bg-background">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleTypeChange('linear')}
              className={cn(
                'h-7 px-3 text-xs font-medium rounded-md transition-all',
                gradientType === 'linear'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              Linear
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleTypeChange('radial')}
              className={cn(
                'h-7 px-3 text-xs font-medium rounded-md transition-all',
                gradientType === 'radial'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              Radial
            </Button>
          </div>

          {/* Angle Control */}
          {gradientType === 'linear' && (
            <div className="flex items-center gap-2 flex-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetAngle}
                className="h-7 w-7 p-0 hover:bg-accent shrink-0"
                title="Reset angle to 90°"
              >
                <RotateCw className="h-4 w-4 text-muted-foreground" />
              </Button>
              <div className="flex items-center border border-border rounded-lg bg-background">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAngleChange(angle - 1)}
                  className="h-7 w-6 p-0 hover:bg-accent rounded-l-lg rounded-r-none"
                  disabled={angle <= 0}
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  value={angle}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    handleAngleChange(value);
                  }}
                  onBlur={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    const clamped = Math.max(0, Math.min(360, value));
                    if (clamped !== value) {
                      setAngle(clamped);
                      updateGradient(stops, gradientType, clamped);
                    }
                  }}
                  className="h-7 w-16 text-xs text-center border-0 rounded-none focus-visible:ring-0"
                  min={0}
                  max={360}
                  step={1}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAngleChange(angle + 1)}
                  className="h-7 w-6 p-0 hover:bg-accent rounded-r-lg rounded-l-none"
                  disabled={angle >= 360}
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Color Picker */}
        <div>
          {selectedStop && (
            <ColorPicker
              color={selectedStop.color}
              onChange={handleStopColorChange}
              label="PICKER"
            />
          )}
        </div>

        {/* Gradient Stops */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-foreground uppercase tracking-wide">STOPS</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddStop}
              className="h-7 px-2 text-xs"
            >
              + Add
            </Button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {stops
              .sort((a, b) => a.position - b.position)
              .map((stop) => (
                <div
                  key={stop.id}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-lg border transition-colors',
                    stop.id === selectedStopId
                      ? 'border-primary bg-accent'
                      : 'border-border hover:border-border/80'
                  )}
                  onClick={() => handleStopSelect(stop.id)}
                >
                  <div
                    className="w-8 h-8 rounded border border-border shrink-0"
                    style={{ backgroundColor: stop.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono text-foreground truncate">{stop.color}</div>
                    <Input
                      type="number"
                      value={stop.position}
                      onChange={(e) => {
                        const position = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                        handleStopMove(stop.id, position);
                      }}
                      className="h-6 w-16 text-xs mt-1"
                      min={0}
                      max={100}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  {stops.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveStop(stop.id);
                      }}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

