import { useCanvasContext } from "@/components/canvas/CanvasContext";
import type { CanvasOperations } from "@/types/editor";

export function useCanvas(): {
  canvas: any;
  operations: CanvasOperations;
  selectedObject: any;
  undo: () => void;
  redo: () => void;
} {
  const { canvas, operations, selectedObject, history } = useCanvasContext();

  return {
    canvas,
    operations,
    selectedObject,
    undo: history.undo,
    redo: history.redo,
  };
}
