interface Feature {
  title: string;
  description: string;
}

interface FeaturesProps {
  features: Feature[];
  title?: string;
}

export function Features({ features, title }: FeaturesProps) {
  return (
    <section className="w-full py-12 sm:py-16 px-4 sm:px-6 border-t border-border bg-background">
      <div className="container mx-auto max-w-6xl">
        {title && (
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 px-2">
            {title}
          </h2>
        )}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div key={index} className="space-y-2 sm:space-y-3 px-2 sm:px-0">
              <h3 className="font-semibold text-lg sm:text-xl">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
