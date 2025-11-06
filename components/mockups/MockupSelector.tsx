'use client';

import { templates } from '@/lib/canvas/templates';
import { useImageStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function MockupSelector() {
  const { currentTemplate, setCurrentTemplate } = useImageStore();
  
  // Filter only mockup templates
  const mockupTemplates = templates.filter(t => t.background.type === 'mockup');

  const handleSelectMockup = (template: typeof templates[0]) => {
    if (currentTemplate?.id === template.id) {
      // Deselect if clicking the same template
      setCurrentTemplate(null);
    } else {
      setCurrentTemplate(template);
    }
  };

  if (mockupTemplates.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Label className="text-sm font-semibold text-foreground">Mockups</Label>
      <p className="text-xs text-muted-foreground">
        Choose a mockup to showcase your image
      </p>
      <div className="grid grid-cols-2 gap-2">
        {mockupTemplates.map((template) => {
          const isSelected = currentTemplate?.id === template.id;
          const previewImage = template.preview || template.background.mockup?.imageUrl;

          return (
            <Button
              key={template.id}
              variant="outline"
              onClick={() => handleSelectMockup(template)}
              className={cn(
                "h-auto p-2 flex flex-col items-center gap-2 border-2 transition-all",
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="w-full h-20 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt={template.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>
              <span className="text-xs font-medium">{template.name}</span>
            </Button>
          );
        })}
      </div>
      {currentTemplate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentTemplate(null)}
          className="w-full text-xs"
        >
          Remove Mockup
        </Button>
      )}
    </div>
  );
}

