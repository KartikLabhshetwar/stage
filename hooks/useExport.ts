/**
 * Hook for managing export functionality
 */

import { useState, useEffect, useCallback } from 'react';
import Konva from 'konva';
import { getAspectRatioPreset } from '@/lib/aspect-ratio-utils';
import { exportElement, type ExportOptions } from '@/lib/export/export-service';
import { saveExportPreferences, getExportPreferences, saveExportedImage } from '@/lib/export-storage';
import { useImageStore, useEditorStore } from '@/lib/store';
import { getKonvaStage } from '@/components/canvas/ClientCanvas';
import { trackEvent } from '@/lib/analytics';

export interface ExportSettings {
  format: 'png';
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
  const { backgroundConfig, backgroundBorderRadius, backgroundBlur, backgroundNoise, textOverlays, imageOverlays, perspective3D } = useImageStore();
  const backgroundOpacity = backgroundConfig?.opacity !== undefined ? backgroundConfig.opacity : 1;
  const { screenshot } = useEditorStore();

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

  const updateFormat = useCallback(async (format: 'png') => {
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
        textOverlays,
        imageOverlays,
        perspective3D,
        screenshot.src || undefined,
        screenshot.radius,
        backgroundBlur,
        backgroundNoise,
        backgroundOpacity
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

      // Track export event
      trackEvent('image_exported', {
        format: settings.format,
        quality: settings.quality,
        scale: settings.scale,
        aspectRatio: selectedAspectRatio,
        width: preset.width,
        height: preset.height,
      });

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
  }, [selectedAspectRatio, settings, backgroundConfig, backgroundBorderRadius, backgroundBlur, backgroundNoise, backgroundOpacity, textOverlays, imageOverlays, perspective3D, screenshot.src, screenshot.radius]);

  const copyImage = useCallback(async (): Promise<void> => {
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
        format: 'png', // Always use PNG for clipboard to preserve transparency
        quality: 1.0,
        scale: 5,
        exportWidth: preset.width,
        exportHeight: preset.height,
      };

      const result = await exportElement(
        'image-render-card',
        exportOptions,
        konvaStage,
        backgroundConfig,
        backgroundBorderRadius,
        textOverlays,
        imageOverlays,
        perspective3D,
        screenshot.src || undefined,
        screenshot.radius,
        backgroundBlur,
        backgroundNoise,
        backgroundOpacity
      );

      if (!result.dataURL || result.dataURL === 'data:,') {
        throw new Error('Invalid image data generated');
      }

      // Copy to clipboard using Clipboard API
      // Ensure we have a PNG blob for clipboard
      const blob = result.blob.type === 'image/png'
        ? result.blob
        : await new Promise<Blob>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Failed to get canvas context'));
              return;
            }
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob'));
                return;
              }
              resolve(blob);
            }, 'image/png');
          };
          img.onerror = reject;
          img.src = result.dataURL;
        });

      // Write to clipboard
      if (navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ]);

        // Track copy event
        trackEvent('image_copied', {
          aspectRatio: selectedAspectRatio,
          width: preset.width,
          height: preset.height,
        });
      } else {
        throw new Error('Clipboard API not supported');
      }
    } catch (error) {
      console.error('Copy failed:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to copy image to clipboard. Please try again.';
      throw new Error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  }, [selectedAspectRatio, settings, backgroundConfig, backgroundBorderRadius, backgroundBlur, backgroundNoise, backgroundOpacity, textOverlays, imageOverlays, perspective3D, screenshot.src, screenshot.radius]);

  return {
    settings,
    isExporting,
    updateFormat,
    updateQuality,
    updateScale,
    exportImage,
    copyImage,
  };
}

