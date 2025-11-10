import { aspectRatios } from "@/lib/constants/aspect-ratios";
import { useImageStore } from "@/lib/store";

interface AspectRatioPickerProps {
  onSelect?: () => void;
}

export const AspectRatioPicker = (
  { onSelect }: AspectRatioPickerProps = {} as AspectRatioPickerProps,
) => {
  const { selectedAspectRatio, setAspectRatio } = useImageStore();

  // Group aspect ratios by category
  const groupedRatios = aspectRatios.reduce(
    (acc, ratio) => {
      if (!acc[ratio.category]) {
        acc[ratio.category] = [];
      }
      acc[ratio.category].push(ratio);
      return acc;
    },
    {} as Record<string, typeof aspectRatios>,
  );

  const categories = Object.keys(groupedRatios);

  const handleSelect = (id: string) => {
    setAspectRatio(id);
    onSelect?.();
  };

  return (
    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
      {categories.map((category) => (
        <div key={category} className="space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
            {category}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {groupedRatios[category].map((aspectRatio) => {
              const isSelected = selectedAspectRatio === aspectRatio.id;
              return (
                <button
                  key={aspectRatio.id}
                  onClick={() => handleSelect(aspectRatio.id)}
                  className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all group ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-primary/60"
                  }`}
                  style={{
                    aspectRatio: `${aspectRatio.width} / ${aspectRatio.height}`,
                    maxHeight: "100px",
                  }}
                  title={aspectRatio.description}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/20" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />

                  <div
                    className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-card/90 text-muted-foreground"
                    }`}
                  >
                    {aspectRatio.width}:{aspectRatio.height}
                  </div>

                  <div
                    className={`absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t ${
                      isSelected
                        ? "from-primary/90 to-transparent"
                        : "from-black/60 to-transparent"
                    }`}
                  >
                    <div
                      className={`text-[10px] font-semibold ${
                        isSelected ? "text-primary-foreground" : "text-white"
                      }`}
                    >
                      {aspectRatio.name}
                    </div>
                    {aspectRatio.useCase && (
                      <div
                        className={`text-[9px] mt-0.5 ${
                          isSelected
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground"
                        }`}
                      >
                        {aspectRatio.useCase}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
