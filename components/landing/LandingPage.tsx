import { Navigation } from "./Navigation";
import { Hero } from "./Hero";
import { Features } from "./Features";
import { Footer } from "./Footer";
import { MasonryGrid } from "./MasonryGrid";
import { FAQ } from "./FAQ";
import { Sponsors, Sponsor } from "./Sponsors";
import { SponsorButton } from "@/components/SponsorButton";
import { VideoTestimonials } from "./VideoTestimonials";

interface Feature {
  title: string;
  description: string;
}

interface VideoTestimonial {
  videoId: string;
  startTime?: number;
  endTime?: number;
  title?: string;
  author?: string;
}

interface LandingPageProps {
  heroTitle: string;
  heroSubtitle?: string;
  heroDescription: string;
  ctaLabel?: string;
  ctaHref?: string;
  features: Feature[];
  featuresTitle?: string;
  sponsors?: Sponsor[];
  sponsorsTitle?: string;
  brandName?: string;
  footerText?: string;
  videoTestimonials?: VideoTestimonial[];
  videoTestimonialsTitle?: string;
}

export function LandingPage({
  heroTitle,
  heroSubtitle,
  heroDescription,
  ctaLabel = "Get Started",
  ctaHref = "/home",
  features,
  featuresTitle,
  sponsors,
  sponsorsTitle,
  brandName = "Stage",
  videoTestimonials,
  videoTestimonialsTitle,
}: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation ctaLabel="Editor" ctaHref={ctaHref} />
      <Hero
        title={heroTitle}
        subtitle={heroSubtitle}
        description={heroDescription}
        ctaLabel={ctaLabel}
        ctaHref={ctaHref}
      />
      <MasonryGrid />
      {videoTestimonials && videoTestimonials.length > 0 && (
        <>
          <VideoTestimonials testimonials={videoTestimonials} title={videoTestimonialsTitle} />
          <div className="w-full border-t border-border" />
        </>
      )}
      <Features features={features} title={featuresTitle} />
      {/* <Pricing /> */}
      <Sponsors sponsors={sponsors} title={sponsorsTitle} />
      <FAQ />
      <Footer brandName={brandName}/>
      <SponsorButton variant="floating" />
    </div>
  );
}

