import { LandingPage } from "@/components/landing/LandingPage";

const features = [
  {
    title: "Image Upload & Customization",
    description:
      "Upload images and customize size, opacity, borders, shadows, and border radius for complete control over your visuals.",
  },
  {
    title: "Text Overlays & Backgrounds",
    description:
      "Add multiple text layers with custom fonts, colors, and shadows. Choose from gradients, solid colors, or upload your own backgrounds.",
  },
  {
    title: "Professional Export",
    description:
      "Export as PNG (with transparency) with adjustable quality and scale up to 5x. All processing happens in your browser—no external services required. Perfect for social media and high-resolution output.",
  },
];

const videoTestimonials = [
  {
    videoId: "NAS4BEP2KtA",
    startTime: 3562,
    endTime: 3768,
  },
];

export default function Landing() {
  return (
    <LandingPage
      heroTitle="Create stunning visual designs"
      heroSubtitle="with Stage"
      heroDescription="A fully in-browser canvas editor that brings your ideas to life. Add images, text, backgrounds, and export your creations in high quality—all without external services. Built for designers and creators."
      ctaLabel="Try now it's free"
      ctaHref="/home"
      features={features}
      videoTestimonials={videoTestimonials}
      videoTestimonialsTitle="What People Are Saying"
    />
  );
}

