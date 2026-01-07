import { exportElement, type ExportOptions } from "@/lib/export/export-service";

import { getKonvaStage } from "@/components/canvas/ClientCanvas";
import { getAspectRatioPreset } from "@/lib/aspect-ratio-utils";

import { useEditorStore, useImageStore } from "@/lib/store";

export async function exportSlideFrame(): Promise<HTMLImageElement> {
  const imageStore = useImageStore.getState();
  const editorStore = useEditorStore.getState();

  const preset = getAspectRatioPreset(imageStore.selectedAspectRatio);
  if (!preset) throw new Error("Invalid aspect ratio");

  const result = await exportElement(
    "image-render-card",
    {
      format: "png",
      quality: 1,
      scale: 1,
      exportWidth: preset.width,
      exportHeight: preset.height,
    },
    getKonvaStage(),
    imageStore.backgroundConfig,
    imageStore.backgroundBorderRadius,
    imageStore.textOverlays,
    imageStore.imageOverlays,
    imageStore.perspective3D,
    editorStore.screenshot.src || undefined,
    editorStore.screenshot.radius,
    imageStore.backgroundBlur,
    imageStore.backgroundNoise,
    imageStore.backgroundConfig.opacity ?? 1
  );

  const img = new Image();
  img.src = result.dataURL;
  await img.decode();

  return img;
}
