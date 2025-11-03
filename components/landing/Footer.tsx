interface FooterProps {
  brandName?: string;
  additionalText?: string;
}

export function Footer({ 
  brandName = "Stage", 
  additionalText = "" 
}: FooterProps) {
  return (
    <footer className="w-full border-t border-border py-4 sm:py-6 shrink-0">
      <div className="container mx-auto px-4 sm:px-6 text-center text-xs sm:text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} {brandName}. {additionalText}
        </p>
      </div>
    </footer>
  );
}

