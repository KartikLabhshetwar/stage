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
import {  Trash2, Eye, EyeOff } from 'lucide-react';
import { fontFamilies, getAvailableFontWeights } from '@/lib/constants/fonts';
import { useWheelInput } from '@/hooks/useWheelInput';

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
  
  const { ref: fontSizeRef } = useWheelInput({
    value: selectedOverlay?.fontSize ?? 24,
    onChange: (val) => handleUpdateFontSize([val]),
    min: 12,
    max: 150,
    step: 1,
  });
  
  const { ref: opacityRef } = useWheelInput({
    value: selectedOverlay?.opacity ?? 1,
    onChange: (val) => handleUpdateOpacity([val]),
    min: 0,
    max: 1,
    step: 0.01,
  });
  
  const { ref: shadowBlurRef } = useWheelInput({
    value: selectedOverlay?.textShadow.blur ?? 0,
    onChange: (val) => handleUpdateTextShadow({ blur: val }),
    min: 0,
    max: 20,
    step: 1,
  });
  
  const { ref: shadowOffsetXRef } = useWheelInput({
    value: selectedOverlay?.textShadow.offsetX ?? 0,
    onChange: (val) => handleUpdateTextShadow({ offsetX: val }),
    min: -20,
    max: 20,
    step: 1,
  });
  
  const { ref: shadowOffsetYRef } = useWheelInput({
    value: selectedOverlay?.textShadow.offsetY ?? 0,
    onChange: (val) => handleUpdateTextShadow({ offsetY: val }),
    min: -20,
    max: 20,
    step: 1,
  });
  
  const { ref: positionXRef } = useWheelInput({
    value: selectedOverlay?.position.x ?? 50,
    onChange: (val) => handleUpdatePosition('x', [val]),
    min: 0,
    max: 100,
    step: 1,
  });
  
  const { ref: positionYRef } = useWheelInput({
    value: selectedOverlay?.position.y ?? 50,
    onChange: (val) => handleUpdatePosition('y', [val]),
    min: 0,
    max: 100,
    step: 1,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-foreground">Text Overlays</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={clearTextOverlays}
          disabled={textOverlays.length === 0}
          className="h-8 px-3 text-xs font-medium rounded-lg"
        >
          Clear All
        </Button>
      </div>

      <div className="space-y-3">
        <Input
          placeholder="Enter text..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddText()}
          className="h-11 rounded-xl border-border focus:border-primary focus:ring-2 focus:ring-ring"
        />
      </div>

      {textOverlays.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-foreground">
            Manage Overlays
          </p>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {textOverlays.map((overlay) => (
              <div
                key={overlay.id}
                className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-colors ${
                  selectedOverlayId === overlay.id
                    ? 'bg-accent border-primary'
                    : 'bg-background hover:bg-accent border-border'
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
        <div className="space-y-5 border-t pt-5">
          <div className="space-y-5">
            <p className="text-sm font-semibold text-foreground">
              {`Edit: "${selectedOverlay.text}"`}
            </p>

            <Input
              placeholder="Edit text..."
              value={selectedOverlay.text}
              onChange={(e) => handleUpdateText(e.target.value)}
              className="h-11 rounded-xl border-border focus:border-primary focus:ring-2 focus:ring-ring"
            />

            <div className="flex gap-2 items-center">
              <Input
                type="color"
                value={selectedOverlay.color}
                onChange={(e) => handleUpdateColor(e.target.value)}
                className="w-12 h-12 rounded-xl border border-border cursor-pointer"
              />
              <Input
                placeholder="#ffffff"
                value={selectedOverlay.color}
                onChange={(e) => handleUpdateColor(e.target.value)}
                className="flex-1 h-11 rounded-xl border-border focus:border-primary focus:ring-2 focus:ring-ring font-mono text-sm"
              />
            </div>

            <Select
              value={selectedOverlay.fontFamily}
              onValueChange={handleUpdateFontFamily}
            >
              <SelectTrigger className="w-full h-11 rounded-xl border-border focus:border-primary focus:ring-2 focus:ring-ring">
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
            </div>

            <Select
              value={selectedOverlay.fontWeight}
              onValueChange={handleUpdateFontWeight}
            >
              <SelectTrigger className="w-full h-11 rounded-xl border-border focus:border-primary focus:ring-2 focus:ring-ring">
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

            <p className="text-xs text-muted-foreground">
              {getAvailableFontWeights(selectedOverlay.fontFamily).length}{' '}
              weight
              {getAvailableFontWeights(selectedOverlay.fontFamily).length !== 1
                ? 's'
                : ''}{' '}
              available
            </p>

            <Select
              value={selectedOverlay.orientation}
              onValueChange={handleUpdateOrientation}
            >
              <SelectTrigger className="w-full h-11 rounded-xl border-border focus:border-primary focus:ring-2 focus:ring-ring">
                <SelectValue placeholder="Text orientation" />
              </SelectTrigger>
                <SelectContent>
                  <SelectItem value="horizontal">Horizontal</SelectItem>
                  <SelectItem value="vertical">Vertical</SelectItem>
                </SelectContent>
              </Select>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted border border-border">
              <span className="text-sm font-medium text-foreground whitespace-nowrap">Font Size</span>
              <div ref={fontSizeRef} className="flex-1 flex items-center gap-3">
                <Slider
                  value={[selectedOverlay.fontSize]}
                  onValueChange={handleUpdateFontSize}
                  max={150}
                  min={12}
                  step={1}
                />
                <span className="text-sm text-foreground font-medium whitespace-nowrap">{selectedOverlay.fontSize}px</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted border border-border">
              <span className="text-sm font-medium text-foreground whitespace-nowrap">Opacity</span>
              <div ref={opacityRef} className="flex-1 flex items-center gap-3">
                <Slider
                  value={[selectedOverlay.opacity]}
                  onValueChange={handleUpdateOpacity}
                  max={1}
                  min={0}
                  step={0.01}
                />
                <span className="text-sm text-foreground font-medium whitespace-nowrap">{Math.round(selectedOverlay.opacity * 100)}%</span>
              </div>
            </div>

            {/* Text Shadow Controls */}
            <div className="space-y-4 border-t pt-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
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
                <div className="space-y-4">
                  {/* Shadow Color */}
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={selectedOverlay.textShadow.color}
                      onChange={(e) =>
                        handleUpdateTextShadow({ color: e.target.value })
                      }
                      className="w-12 h-10 p-1 rounded-lg border border-border"
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
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                    <span className="text-sm font-medium text-foreground whitespace-nowrap">Blur</span>
                    <div ref={shadowBlurRef} className="flex-1 flex items-center gap-3">
                      <Slider
                        value={[selectedOverlay.textShadow.blur]}
                        onValueChange={(value) =>
                          handleUpdateTextShadow({ blur: value[0] })
                        }
                        max={20}
                        min={0}
                        step={1}
                      />
                      <span className="text-sm text-foreground font-medium whitespace-nowrap">{selectedOverlay.textShadow.blur}px</span>
                    </div>
                  </div>

                  {/* Shadow Offset X */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                    <span className="text-sm font-medium text-foreground whitespace-nowrap">Offset X</span>
                    <div ref={shadowOffsetXRef} className="flex-1 flex items-center gap-3">
                      <Slider
                        value={[selectedOverlay.textShadow.offsetX]}
                        onValueChange={(value) =>
                          handleUpdateTextShadow({ offsetX: value[0] })
                        }
                        max={20}
                        min={-20}
                        step={1}
                      />
                      <span className="text-sm text-foreground font-medium whitespace-nowrap">{selectedOverlay.textShadow.offsetX}px</span>
                    </div>
                  </div>

                  {/* Shadow Offset Y */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                    <span className="text-sm font-medium text-foreground whitespace-nowrap">Offset Y</span>
                    <div ref={shadowOffsetYRef} className="flex-1 flex items-center gap-3">
                      <Slider
                        value={[selectedOverlay.textShadow.offsetY]}
                        onValueChange={(value) =>
                          handleUpdateTextShadow({ offsetY: value[0] })
                        }
                        max={20}
                        min={-20}
                        step={1}
                      />
                      <span className="text-sm text-foreground font-medium whitespace-nowrap">{selectedOverlay.textShadow.offsetY}px</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold text-foreground">
                Position
              </p>
              {/* X position */}
              <div ref={positionXRef} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <Slider
                  value={[selectedOverlay.position.x]}
                  onValueChange={(value) => handleUpdatePosition('x', value)}
                  max={100}
                  min={0}
                  step={1}
                  label="X Position"
                  valueDisplay={`${Math.round(selectedOverlay.position.x)}%`}
                />
              </div>

              {/* Y position */}
              <div ref={positionYRef} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <Slider
                  value={[selectedOverlay.position.y]}
                  onValueChange={(value) => handleUpdatePosition('y', value)}
                  max={100}
                  min={0}
                  step={1}
                  label="Y Position"
                  valueDisplay={`${Math.round(selectedOverlay.position.y)}%`}
                />
              </div>
            </div>
          </div>
      )}
    </div>
  );
};

