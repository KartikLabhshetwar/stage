"use client";

interface FooterProps {
  brandName?: string;
  additionalText?: string;
}

export function Footer({ 
  brandName = "Stage", 
  additionalText = "" 
}: FooterProps) {
  return (
    <footer className="w-full border-t border-border shrink-0 bg-background">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {brandName}. {additionalText}
          </p>
          <a
            href="https://www.producthunt.com/products/stage-4/reviews/new?utm_source=badge-product_review&utm_medium=badge&utm_source=badge-stage&#0045;4"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-80"
          >
            <img
              src="https://api.producthunt.com/widgets/embed-image/v1/product_review.svg?product_id=1127654&theme=dark"
              alt="Stage - browser canvas editor that brings your ideas to life | Product Hunt"
              style={{ width: "250px", height: "54px" }}
              width="250"
              height="54"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}

