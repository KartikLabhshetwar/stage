import { useExportProgress } from "@/hooks/useExportProgress";
import { renderSlidesToFrames } from "./render-slideFrame";

const FPS = 60;
const VIDEO_BITRATE = 25_000_000;

function raf(): Promise<number> {
  return new Promise(requestAnimationFrame);
}

export async function exportSlideshowVideo() {
  const progress = useExportProgress.getState();

  progress.start();

  const frames = await renderSlidesToFrames();

  if (!frames.length) {
    progress.done();
    throw new Error("No frames to export");
  }

  const totalDuration = frames.reduce((a, f) => a + f.duration, 0);
  let elapsed = 0;

  const width = frames[0].img.width;
  const height = frames[0].img.height;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.style.position = "fixed";
  canvas.style.left = "-99999px";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  const stream = canvas.captureStream(FPS);

  const recorder = new MediaRecorder(stream, {
    mimeType: "video/webm; codecs=vp8",
    videoBitsPerSecond: VIDEO_BITRATE,
  });

  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);

  recorder.start();

  for (const frame of frames) {
    const totalFrames = Math.round(frame.duration * FPS);

    for (let i = 0; i < totalFrames; i++) {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(frame.img, 0, 0, width, height);
      await new Promise((r) => setTimeout(r, 1000 / FPS));

      elapsed += 1 / FPS;
      progress.set(Math.min(100, (elapsed / totalDuration) * 100));
    }
  }

  await new Promise((r) => setTimeout(r, 300));
  recorder.stop();

  await new Promise((r) => (recorder.onstop = r));

  progress.done();

  stream.getTracks().forEach((t) => t.stop());
  canvas.remove();

  const blob = new Blob(chunks, { type: "video/webm" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `slideshow-${Date.now()}.webm`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
