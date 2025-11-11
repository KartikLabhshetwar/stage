import { useCanvasContext } from '@/components/canvas/CanvasContext'
import type { CanvasOperations } from '@/types/editor'

export function useCanvas(): {
  canvas: any // For backward compatibility, returns stage
  operations: CanvasOperations
  selectedObject: any
  undo: () => void
  redo: () => void
} {
  const { stage, operations, selectedObject, history } = useCanvasContext()

  return {
    canvas: stage, // Return stage for backward compatibility
    operations,
    selectedObject,
    undo: history.undo,
    redo: history.redo,
  }
}
