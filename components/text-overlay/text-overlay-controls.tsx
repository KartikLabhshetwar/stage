'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GlassInputWrapper } from '@/components/ui/glass-input-wrapper';
import { useImageStore } from '@/lib/store';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { fontFamilies, getAvailableFontWeights } from '@/lib/constants/fonts';

export const TextOverlayControls = () => {
  const {
    textOverlays,
    addTextOverlay,
    updateTextOverlay,
    removeTextOverlay,
    clearTextOverlays,
  } = useImageStore();

  const [newText, setNewText] = useState('');
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(
    null
  );

  const selectedOverlay = textOverlays.find(
    (overlay) => overlay.id === selectedOverlayId
  );

  const handleAddText = () => {
    if (newText.trim()) {
      const defaultFont = 'system';
      const availableWeights = getAvailableFontWeights(defaultFont);
      addTextOverlay({
        text: newText.trim(),
        position: { x: 50, y: 50 },
        fontSize: 24,
        fontWeight: availableWeights[0] || 'normal',
        fontFamily: defaultFont,
        color: '#ffffff',
        opacity: 1,
        isVisible: true,
        orientation: 'horizontal',
        textShadow: {
          enabled: true,
          color: 'rgba(0, 0, 0, 0.5)',
          blur: 4,
          offsetX: 2,
          offsetY: 2,
        },
      });
      setNewText('');
    }
  };

  const handleUpdatePosition = (axis: 'x' | 'y', value: number[]) => {
    if (selectedOverlay) {
      updateTextOverlay(selectedOverlay.id, {
        position: {
          ...selectedOverlay.position,
          [axis]: value[0],
        },
      });
    }
  };

  const handleUpdateFontSize = (value: number[]) => {
    if (selectedOverlay) {
      updateTextOverlay(selectedOverlay.id, {
        fontSize: value[0],
      });
    }
  };

  const handleUpdateOpacity = (value: number[]) => {
    if (selectedOverlay) {
      updateTextOverlay(selectedOverlay.id, {
        opacity: value[0],
      });
    }
  };

  const handleUpdateText = (text: string) => {
    if (selectedOverlay) {
      updateTextOverlay(selectedOverlay.id, { text });
    }
  };

  const handleUpdateColor = (color: string) => {
    if (selectedOverlay) {
      updateTextOverlay(selectedOverlay.id, { color });
    }
  };

  const handleUpdateFontWeight = (weight: string) => {
    if (selectedOverlay) {
      updateTextOverlay(selectedOverlay.id, { fontWeight: weight });
    }
  };

  const handleUpdateFontFamily = (fontFamily: string) => {
    if (selectedOverlay) {
      const availableWeights = getAvailableFontWeights(fontFamily);
      const currentWeight = selectedOverlay.fontWeight;
      // If the current weight is not available for the new font, default to the first available weight
      const newWeight = availableWeights.includes(currentWeight)
        ? currentWeight
        : availableWeights[0] || 'normal';

      updateTextOverlay(selectedOverlay.id, {
        fontFamily,
        fontWeight: newWeight,
      });
    }
  };

  const handleUpdateOrientation = (orientation: 'horizontal' | 'vertical') => {
    if (selectedOverlay) {
      updateTextOverlay(selectedOverlay.id, { orientation });
    }
  };

  const handleUpdateTextShadow = (
    updates: Partial<{
      enabled: boolean;
      color: string;
      blur: number;
      offsetX: number;
      offsetY: number;
    }>
  ) => {
    if (selectedOverlay) {
      updateTextOverlay(selectedOverlay.id, {
        textShadow: {
          ...selectedOverlay.textShadow,
          ...updates,
        },
      });
    }
  };

  const handleToggleVisibility = (id: string) => {
    const overlay = textOverlays.find((o) => o.id === id);
    if (overlay) {
      updateTextOverlay(id, { isVisible: !overlay.isVisible });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Text Overlays</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={clearTextOverlays}
          disabled={textOverlays.length === 0}
        >
          Clear All
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <GlassInputWrapper className="flex-1">
            <Input
              placeholder="Enter text..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddText()}
              className="border-0 bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </GlassInputWrapper>
          <Button size="sm" onClick={handleAddText} disabled={!newText.trim()} className="h-9">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {textOverlays.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">
            Manage Overlays
          </p>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {textOverlays.map((overlay) => (
              <div
                key={overlay.id}
                className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                  selectedOverlayId === overlay.id
                    ? 'bg-accent border-accent-foreground'
                    : 'bg-background hover:bg-accent/50'
                }`}
                onClick={() => setSelectedOverlayId(overlay.id)}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleVisibility(overlay.id);
                  }}
                  className="h-6 w-6 p-0"
                >
                  {overlay.isVisible ? (
                    <Eye className="h-3 w-3" />
                  ) : (
                    <EyeOff className="h-3 w-3" />
                  )}
                </Button>
                <span className="flex-1 text-xs truncate">{overlay.text}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTextOverlay(overlay.id);
                    if (selectedOverlayId === overlay.id) {
                      setSelectedOverlayId(null);
                    }
                  }}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedOverlay && (
        <div className="space-y-4 border-t pt-4">
          <div className="space-y-4">
            <p className="text-xs font-medium text-muted-foreground">
              {`Edit: "${selectedOverlay.text}"`}
            </p>

            <GlassInputWrapper>
              <Input
                placeholder="Edit text..."
                value={selectedOverlay.text}
                onChange={(e) => handleUpdateText(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </GlassInputWrapper>

            <div className="flex gap-2">
              <Input
                type="color"
                value={selectedOverlay.color}
                onChange={(e) => handleUpdateColor(e.target.value)}
                className="w-12 h-8 p-1"
              />
              <GlassInputWrapper className="flex-1">
                <Input
                  placeholder="#ffffff"
                  value={selectedOverlay.color}
                  onChange={(e) => handleUpdateColor(e.target.value)}
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </GlassInputWrapper>
            </div>

            <GlassInputWrapper intensity="default">
              <Select
                value={selectedOverlay.fontFamily}
                onValueChange={handleUpdateFontFamily}
              >
                <SelectTrigger className="w-full border-0 bg-transparent">
                  <SelectValue placeholder="Font family" />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilies.map((font) => (
                    <SelectItem key={font.id} value={font.id}>
                      {font.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </GlassInputWrapper>

            <GlassInputWrapper intensity="default">
              <Select
                value={selectedOverlay.fontWeight}
                onValueChange={handleUpdateFontWeight}
              >
                <SelectTrigger className="w-full border-0 bg-transparent">
                  <SelectValue placeholder="Font weight" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableFontWeights(selectedOverlay.fontFamily).map(
                    (weight) => (
                      <SelectItem key={weight} value={weight}>
                        {weight === 'normal'
                          ? 'Normal'
                          : weight === 'bold'
                            ? 'Bold'
                            : weight === '100'
                              ? 'Thin (100)'
                              : weight === '300'
                                ? 'Light (300)'
                                : weight === '500'
                                  ? 'Medium (500)'
                                  : weight === '600'
                                    ? 'Semi Bold (600)'
                                    : weight === '700'
                                      ? 'Bold (700)'
                                      : weight === '800'
                                        ? 'Extra Bold (800)'
                                        : weight === '900'
                                          ? 'Black (900)'
                                          : weight}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </GlassInputWrapper>

            <p className="text-xs text-muted-foreground">
              {getAvailableFontWeights(selectedOverlay.fontFamily).length}{' '}
              weight
              {getAvailableFontWeights(selectedOverlay.fontFamily).length !== 1
                ? 's'
                : ''}{' '}
              available
            </p>

            <GlassInputWrapper intensity="default">
              <Select
                value={selectedOverlay.orientation}
                onValueChange={handleUpdateOrientation}
              >
                <SelectTrigger className="w-full border-0 bg-transparent">
                  <SelectValue placeholder="Text orientation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="horizontal">Horizontal</SelectItem>
                  <SelectItem value="vertical">Vertical</SelectItem>
                </SelectContent>
              </Select>
            </GlassInputWrapper>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Font Size</span>
                <span className="text-xs text-muted-foreground">
                  {selectedOverlay.fontSize}px
                </span>
              </div>
              <Slider
                value={[selectedOverlay.fontSize]}
                onValueChange={handleUpdateFontSize}
                max={150}
                min={12}
                step={1}
                className="w-full cursor-grab"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Opacity</span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(selectedOverlay.opacity * 100)}%
                </span>
              </div>
              <Slider
                value={[selectedOverlay.opacity]}
                onValueChange={handleUpdateOpacity}
                max={1}
                min={0}
                step={0.01}
                className="w-full cursor-grab"
              />
            </div>

            {/* Text Shadow Controls */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  Text Shadow
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleUpdateTextShadow({
                      enabled: !selectedOverlay.textShadow.enabled,
                    })
                  }
                  className="h-6 px-2 text-xs"
                >
                  {selectedOverlay.textShadow.enabled ? 'Disable' : 'Enable'}
                </Button>
              </div>

              {selectedOverlay.textShadow.enabled && (
                <div className="space-y-3">
                  {/* Shadow Color */}
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={selectedOverlay.textShadow.color}
                      onChange={(e) =>
                        handleUpdateTextShadow({ color: e.target.value })
                      }
                      className="w-12 h-8 p-1"
                    />
                    <GlassInputWrapper className="flex-1">
                      <Input
                        placeholder="rgba(0, 0, 0, 0.5)"
                        value={selectedOverlay.textShadow.color}
                        onChange={(e) =>
                          handleUpdateTextShadow({ color: e.target.value })
                        }
                        className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </GlassInputWrapper>
                  </div>

                  {/* Shadow Blur */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Blur
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {selectedOverlay.textShadow.blur}px
                      </span>
                    </div>
                    <Slider
                      value={[selectedOverlay.textShadow.blur]}
                      onValueChange={(value) =>
                        handleUpdateTextShadow({ blur: value[0] })
                      }
                      max={20}
                      min={0}
                      step={1}
                      className="w-full cursor-grab"
                    />
                  </div>

                  {/* Shadow Offset X */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Offset X
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {selectedOverlay.textShadow.offsetX}px
                      </span>
                    </div>
                    <Slider
                      value={[selectedOverlay.textShadow.offsetX]}
                      onValueChange={(value) =>
                        handleUpdateTextShadow({ offsetX: value[0] })
                      }
                      max={20}
                      min={-20}
                      step={1}
                      className="w-full cursor-grab"
                    />
                  </div>

                  {/* Shadow Offset Y */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Offset Y
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {selectedOverlay.textShadow.offsetY}px
                      </span>
                    </div>
                    <Slider
                      value={[selectedOverlay.textShadow.offsetY]}
                      onValueChange={(value) =>
                        handleUpdateTextShadow({ offsetY: value[0] })
                      }
                      max={20}
                      min={-20}
                      step={1}
                      className="w-full cursor-grab"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Position
              </p>
              {/* X position */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">
                    X Position
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(selectedOverlay.position.x)}%
                  </span>
                </div>
                <Slider
                  value={[selectedOverlay.position.x]}
                  onValueChange={(value) => handleUpdatePosition('x', value)}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full cursor-grab"
                />
              </div>

              {/* Y position */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">
                    Y Position
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(selectedOverlay.position.y)}%
                  </span>
                </div>
                <Slider
                  value={[selectedOverlay.position.y]}
                  onValueChange={(value) => handleUpdatePosition('y', value)}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full cursor-grab"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

