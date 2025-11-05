/**
 * Hook for managing export functionality
 */

import { useState, useEffect, useCallback } from 'react';
import Konva from 'konva';
import { getAspectRatioPreset } from '@/lib/aspect-ratio-utils';
import { exportElement, type ExportOptions } from '@/lib/export/export-service';
import { saveExportPreferences, getExportPreferences, saveExportedImage } from '@/lib/export-storage';
import { useImageStore } from '@/lib/store';
import { getKonvaStage } from '@/components/canvas/ClientCanvas';

export interface ExportSettings {
  format: 'png' | 'jpg';
  quality: number;
  scale: number;
}

const DEFAULT_SETTINGS: ExportSettings = {
  format: 'png',
  quality: 0.95,
  scale: 3,
};

export function useExport(selectedAspectRatio: string) {
  const [settings, setSettings] = useState<ExportSettings>(DEFAULT_SETTINGS);
  const [isExporting, setIsExporting] = useState(false);
  const { backgroundConfig, backgroundBorderRadius, textOverlays } = useImageStore();

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await getExportPreferences();
        if (prefs) {
          setSettings({
            format: prefs.format,
            quality: prefs.quality,
            scale: prefs.scale,
          });
        }
      } catch (error) {
        console.error('Failed to load export preferences:', error);
      }
    };
    
    loadPreferences();
  }, []);

  // Save preferences when they change
  const savePreferences = useCallback(async (newSettings: ExportSettings) => {
    try {
      await saveExportPreferences({
        format: newSettings.format,
        quality: newSettings.quality,
        scale: newSettings.scale,
      });
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }, []);

  const updateFormat = useCallback(async (format: 'png' | 'jpg') => {
    const newSettings = { ...settings, format };
    setSettings(newSettings);
    await savePreferences(newSettings);
  }, [settings, savePreferences]);

  const updateQuality = useCallback(async (quality: number) => {
    const newSettings = { ...settings, quality };
    setSettings(newSettings);
    await savePreferences(newSettings);
  }, [settings, savePreferences]);

  const updateScale = useCallback(async (scale: number) => {
    const newSettings = { ...settings, scale };
    setSettings(newSettings);
    await savePreferences(newSettings);
  }, [settings, savePreferences]);

  const exportImage = useCallback(async (): Promise<void> => {
    setIsExporting(true);
    
    try {
      // Get Konva stage
      const konvaStage = getKonvaStage();
      
      // Get actual pixel dimensions from aspect ratio preset
      const preset = getAspectRatioPreset(selectedAspectRatio);
      if (!preset) {
        throw new Error('Invalid aspect ratio selected');
      }

      const exportOptions: ExportOptions = {
        format: settings.format,
        quality: settings.quality,
        scale: settings.scale,
        exportWidth: preset.width,
        exportHeight: preset.height,
      };

      const result = await exportElement(
        'image-render-card',
        exportOptions,
        konvaStage,
        backgroundConfig,
        backgroundBorderRadius,
        textOverlays
      );

      if (!result.dataURL || result.dataURL === 'data:,') {
        throw new Error('Invalid image data generated');
      }

      // Save blob to IndexedDB for high-quality storage
      const fileName = `stage-${Date.now()}.${settings.format}`;
      try {
        await saveExportedImage(
          result.blob,
          settings.format,
          settings.quality,
          settings.scale,
          fileName
        );
      } catch (error) {
        console.warn('Failed to save export to IndexedDB:', error);
        // Continue with download even if storage fails
      }

      // Download the file
      const link = document.createElement('a');
      link.download = fileName;
      link.href = result.dataURL;
      
      document.body.appendChild(link);
      link.click();
      
      // Small delay before removing to ensure download starts
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
    } catch (error) {
      console.error('Export failed:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to export image. Please try again.';
      throw new Error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  }, [selectedAspectRatio, settings, backgroundConfig, backgroundBorderRadius, textOverlays]);

  return {
    settings,
    isExporting,
    updateFormat,
    updateQuality,
    updateScale,
    exportImage,
  };
}

