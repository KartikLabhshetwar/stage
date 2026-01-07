import { useImageStore } from "@/lib/store";

export async function renderSlidesToFrames() {
  const { slides, slideshow } = useImageStore.getState();

  const duration = slideshow.defaultDuration; // ✅ SOURCE OF TRUTH

  const frames: {
    img: HTMLImageElement;
    duration: number;
  }[] = [];

  for (const slide of slides) {
    const img = new Image();
    img.src = slide.src;

    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
    });

    frames.push({
      img,
      duration, // ✅ ALWAYS USE CURRENT USER VALUE
    });
  }

  return frames;
}
