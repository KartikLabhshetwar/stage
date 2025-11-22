'use client';

import { useEffect, useRef, useState } from 'react';
import {
  useEditorStore,
  useImageStore,
  OmitFunctions,
  EditorState,
  ImageState,
} from '@/lib/store';
import {
  saveDraft,
  getDraft,
  blobUrlToBase64,
  deleteDraft,
} from '@/lib/draft-storage';

const AUTOSAVE_DELAY = 1000;

export function useAutosaveDraft() {
  const editorStore = useEditorStore();
  const imageStore = useImageStore();
  const saveTimeoutRef = useRef<NodeJS.Timeout>(null);
  const hasLoadedRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      if (hasLoadedRef.current) return;

      try {
        const draft = await getDraft();
        if (!draft) {
          hasLoadedRef.current = true;
          return;
        }

        // CRITICAL: Restore imageStore.uploadedImageUrl FIRST
        const img = draft.imageState;
        if (img?.uploadedImageUrl) {
          imageStore.setUploadedImageUrl(img.uploadedImageUrl, img.imageName);
        }

        // Then restore editor state
        if (draft.editorState?.screenshot) {
          editorStore.setScreenshot(draft.editorState.screenshot);
        }
        if (draft.editorState?.background) {
          editorStore.setBackground(draft.editorState.background);
        }
        if (draft.editorState?.shadow) {
          editorStore.setShadow(draft.editorState.shadow);
        }
        if (draft.editorState?.pattern) {
          editorStore.setPattern(draft.editorState.pattern);
        }
        if (draft.editorState?.frame) {
          editorStore.setFrame(draft.editorState.frame);
        }
        if (draft.editorState?.canvas) {
          editorStore.setCanvas(draft.editorState.canvas);
        }
        if (draft.editorState?.noise) {
          editorStore.setNoise(draft.editorState.noise);
        }

        // Restore rest of image state
        if (img) {
          if (img.selectedGradient)
            imageStore.setGradient(img.selectedGradient);
          if (img.borderRadius !== undefined)
            imageStore.setBorderRadius(img.borderRadius);
          if (img.backgroundBorderRadius !== undefined)
            imageStore.setBackgroundBorderRadius(img.backgroundBorderRadius);
          if (img.selectedAspectRatio)
            imageStore.setAspectRatio(img.selectedAspectRatio);
          if (img.backgroundConfig)
            imageStore.setBackgroundConfig(img.backgroundConfig);
          if (img.backgroundBlur !== undefined)
            imageStore.setBackgroundBlur(img.backgroundBlur);
          if (img.backgroundNoise !== undefined)
            imageStore.setBackgroundNoise(img.backgroundNoise);
          if (img.imageOpacity !== undefined)
            imageStore.setImageOpacity(img.imageOpacity);
          if (img.imageScale !== undefined)
            imageStore.setImageScale(img.imageScale);
          if (img.imageBorder) imageStore.setImageBorder(img.imageBorder);
          if (img.imageShadow) imageStore.setImageShadow(img.imageShadow);
          if (img.perspective3D) imageStore.setPerspective3D(img.perspective3D);

          imageStore.clearTextOverlays();
          imageStore.clearImageOverlays();
          imageStore.clearMockups();

          img.textOverlays?.forEach((overlay) => {
            imageStore.addTextOverlay(overlay);
          });
          img.imageOverlays?.forEach((overlay) => {
            imageStore.addImageOverlay(overlay);
          });
          img.mockups?.forEach((mockup) => {
            imageStore.addMockup(mockup);
          });
        }

        setLastSaved(new Date(draft.timestamp));
        hasLoadedRef.current = true;
      } catch (error) {
        console.error('Failed to load draft:', error);
        hasLoadedRef.current = true;
      }
    };

    loadDraft();
  }, [editorStore, imageStore]);

  // Auto-save on state changes
  useEffect(() => {
    if (!hasLoadedRef.current) {
      return;
    }

    const debouncedSave = async () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        setIsSaving(true);
        try {
          const {
            screenshot,
            background,
            shadow,
            pattern,
            frame,
            canvas,
            noise,
          } = editorStore;

          const {
            imageName,
            selectedGradient,
            borderRadius,
            backgroundBorderRadius,
            selectedAspectRatio,
            backgroundConfig,
            backgroundBlur,
            backgroundNoise,
            textOverlays,
            imageOverlays,
            mockups,
            imageOpacity,
            imageScale,
            imageBorder,
            imageShadow,
            perspective3D,
          } = imageStore;

          // Convert screenshot blob URL to base64
          let processedScreenshotSrc = screenshot.src;
          if (screenshot.src && screenshot.src.startsWith('blob:')) {
            processedScreenshotSrc = await blobUrlToBase64(screenshot.src);
          }

          // Convert background config blob URL to base64
          const processedBackgroundConfig = { ...backgroundConfig };
          if (
            backgroundConfig.type === 'image' &&
            typeof backgroundConfig.value === 'string' &&
            backgroundConfig.value.startsWith('blob:')
          ) {
            processedBackgroundConfig.value = await blobUrlToBase64(
              backgroundConfig.value,
            );
          }

          // Process image overlays
          const processedImageOverlays = await Promise.all(
            imageOverlays.map(async (overlay) => {
              if (overlay.src.startsWith('blob:') && overlay.isCustom) {
                const base64Src = await blobUrlToBase64(overlay.src);
                return { ...overlay, src: base64Src };
              }
              return overlay;
            }),
          );

          const editorState: OmitFunctions<EditorState> = {
            screenshot: {
              ...screenshot,
              src: processedScreenshotSrc,
            },
            background,
            shadow,
            pattern,
            frame,
            canvas,
            noise,
          };

          const imageState: OmitFunctions<ImageState> = {
            uploadedImageUrl: processedScreenshotSrc,
            imageName,
            selectedGradient,
            borderRadius,
            backgroundBorderRadius,
            selectedAspectRatio,
            backgroundConfig: processedBackgroundConfig,
            backgroundBlur,
            backgroundNoise,
            textOverlays,
            imageOverlays: processedImageOverlays,
            mockups,
            imageOpacity,
            imageScale,
            imageBorder,
            imageShadow,
            perspective3D,
          };

          await saveDraft(editorState, imageState);
          setLastSaved(new Date());
        } catch (error) {
          console.error('Failed to auto-save draft:', error);
        } finally {
          setIsSaving(false);
        }
      }, AUTOSAVE_DELAY);
    };

    debouncedSave();

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    editorStore.screenshot,
    editorStore.background,
    editorStore.shadow,
    editorStore.pattern,
    editorStore.frame,
    editorStore.canvas,
    editorStore.noise,
    imageStore.uploadedImageUrl,
    imageStore.selectedGradient,
    imageStore.borderRadius,
    imageStore.backgroundBorderRadius,
    imageStore.selectedAspectRatio,
    imageStore.backgroundConfig,
    imageStore.backgroundBlur,
    imageStore.backgroundNoise,
    imageStore.textOverlays,
    imageStore.imageOverlays,
    imageStore.mockups,
    imageStore.imageOpacity,
    imageStore.imageScale,
    imageStore.imageBorder,
    imageStore.imageShadow,
    imageStore.perspective3D,
    editorStore,
    imageStore,
  ]);

  // Warn before closing if saving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSaving) {
        e.preventDefault();
        e.returnValue =
          'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSaving]);

  const clearDraft = async () => {
    try {
      await deleteDraft();

      // Clear all stores
      editorStore.setScreenshot({
        src: null,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        rotation: 0,
        radius: 10,
      });

      imageStore.clearImage();
      imageStore.clearTextOverlays();
      imageStore.clearImageOverlays();
      imageStore.clearMockups();

      setLastSaved(null);
    } catch (error) {
      console.error('Failed to clear draft:', error);
      throw error;
    }
  };

  return { isSaving, lastSaved, clearDraft };
}
