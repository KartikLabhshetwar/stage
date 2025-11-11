/**
 * Format selector component for export options
 */

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface FormatSelectorProps {
  format: 'png'
  onFormatChange: (format: 'png') => void
}

export function FormatSelector({ format, onFormatChange }: FormatSelectorProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-foreground">Format</Label>
      <div className="flex gap-2">
        <Button
          variant="default"
          onClick={() => onFormatChange('png')}
          className="flex-1 h-11 touch-manipulation bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          PNG
        </Button>
      </div>
    </div>
  )
}
