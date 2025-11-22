"use client";

import { Instrument_Serif } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  subsets: ["latin"],
});

interface VideoTestimonial {
  videoId: string;
  startTime?: number;
  endTime?: number;
  title?: string;
  author?: string;
}

interface VideoTestimonialsProps {
  testimonials: VideoTestimonial[];
  title?: string;
}

function VideoTestimonialCard({ videoId, startTime, endTime, title, author }: VideoTestimonial) {
  const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
  if (startTime) embedUrl.searchParams.set("start", startTime.toString());
  if (endTime) embedUrl.searchParams.set("end", endTime.toString());
  embedUrl.searchParams.set("rel", "0");

  return (
    <div className="space-y-3">
      <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border bg-card group">
        <iframe
          width="100%"
          height="100%"
          src={embedUrl.toString()}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0"
          loading="lazy"
        />
      </div>
      {(title || author) && (
        <div className="space-y-1 px-1">
          {title && <h3 className="font-semibold text-base sm:text-lg">{title}</h3>}
          {author && <p className="text-sm text-muted-foreground">{author}</p>}
        </div>
      )}
    </div>
  );
}

export function VideoTestimonials({ testimonials, title }: VideoTestimonialsProps) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="w-full py-12 sm:py-16 px-4 sm:px-6 bg-background">
      <div className="container mx-auto max-w-7xl">
        {title && (
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 px-2 tracking-tight ${instrumentSerif.className}`}>
            {title}
          </h2>
        )}
        <div className="flex flex-wrap justify-center gap-8 sm:gap-10">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="w-full md:w-[calc(50%-1.25rem)] max-w-2xl">
              <VideoTestimonialCard {...testimonial} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

