import { useImageStore } from "@/lib/store";
import { exportSlideFrame } from "./export-slideFrame";

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function renderSlidesToFrames() {
  const store = useImageStore.getState();
  const { slides, setActiveSlide, slideshow } = store;

  const frames: { img: HTMLImageElement; duration: number }[] = [];
  // console.log("slides current ", slides);
  // console.log("slideshow current", slideshow);

  for (const slide of slides) {
    setActiveSlide(slide.id);

    // let React + Konva flush
    await wait(120);

    const img = await exportSlideFrame();

    frames.push({
      img,
      duration: slideshow.defaultDuration || 2,
      // duration: 3,
    });
  }

  return frames;
}
