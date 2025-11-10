"use client";

import { OptimizedImage } from "@/components/ui/optimized-image";
import { demoImagePublicIds } from "@/lib/cloudinary-demo-images";

interface MasonryItem {
  id: number;
  image: string;
  alt: string;
  aspectRatio: string;
}

// Get aspect ratio based on demo image number
const getAspectRatio = (index: number): string => {
  // Get demo number from index (1-based)
  const demoNumber = index + 1;

  // demo-1: long vertical card (tall portrait)
  if (demoNumber === 1) {
    return "aspect-[2/3]"; // Long vertical card
  }

  // demo-3 and demo-8: Social media posts/profile pages (horizontal/landscape)
  if (demoNumber === 3 || demoNumber === 8) {
    return "aspect-[4/3]"; // Horizontal/landscape for social media posts
  }

  // Landing pages: demo-2, 4, 5, 6, 9, 10, 11, 13, 14 (rectangle/landscape boxes)
  const landingPageNumbers = [2, 4, 5, 6, 9, 10, 11, 13, 14];
  if (landingPageNumbers.includes(demoNumber)) {
    return "aspect-[16/9]"; // Rectangle/landscape box for landing pages
  }

  // Default ratios for other images (demo-7, 12, 15)
  const defaultRatios = [
    "aspect-[4/3]", // Classic
    "aspect-square", // Square
    "aspect-[3/4]", // Portrait
    "aspect-[3/2]", // Landscape
    "aspect-[5/4]", // Slightly tall
  ];
  return defaultRatios[(demoNumber - 1) % defaultRatios.length];
};

// Use demo image Cloudinary public IDs directly with specific sizes
const sampleItems: MasonryItem[] = demoImagePublicIds.map(
  (publicId, index) => ({
    id: index + 1,
    image: publicId,
    alt: `Gallery image ${index + 1}`,
    aspectRatio: getAspectRatio(index),
  }),
);

export function MasonryGrid() {
  return (
    <section className="w-full py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="container mx-auto max-w-7xl">
        {/* CSS Columns masonry layout */}
        <div
          className="columns-1 sm:columns-2 lg:columns-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8"
          style={{
            columnFill: "balance" as const,
          }}
        >
          {sampleItems.map((item) => (
            <div
              key={item.id}
              className="relative bg-card rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border group mb-3 sm:mb-4 md:mb-6 break-inside-avoid"
            >
              <div
                className={`relative w-full ${item.aspectRatio} overflow-hidden`}
              >
                <OptimizedImage
                  src={item.image}
                  alt={item.alt}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  quality="auto"
                  crop="fill"
                  gravity="auto"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
