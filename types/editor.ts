import { Template } from './canvas'

// Editor state
export interface EditorState {
  currentTemplate: Template | null
  uploadedImage: {
    file: File
    url: string
  } | null
  textOverlays: Array<{
    id: string
    text: string
    x: number
    y: number
    fontSize: number
    color: string
    fontFamily?: string
    align?: 'left' | 'center' | 'right'
  }>
  canvasHistory: {
    past: string[] // Array of canvas JSON states
    present: string // Current canvas state
    future: string[] // Redo stack
  }
}

// Editor actions
export type EditorAction =
  | { type: 'SET_TEMPLATE'; payload: Template }
  | { type: 'UPLOAD_IMAGE'; payload: { file: File; url: string } }
  | { type: 'REMOVE_IMAGE' }
  | { type: 'ADD_TEXT_OVERLAY'; payload: EditorState['textOverlays'][0] }
  | {
      type: 'UPDATE_TEXT_OVERLAY'
      payload: { id: string; updates: Partial<EditorState['textOverlays'][0]> }
    }
  | { type: 'REMOVE_TEXT_OVERLAY'; payload: string }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SAVE_STATE'; payload: string } // Save current canvas state

// Canvas operations
export interface CanvasOperations {
  addImage: (
    imageUrl: string,
    options?: { width?: number; height?: number; x?: number; y?: number }
  ) => Promise<void>
  addText: (
    text: string,
    options?: { fontSize?: number; color?: string; x?: number; y?: number }
  ) => Promise<void>
  transformObject: (
    objectId: string | undefined,
    properties: Partial<{
      left: number
      top: number
      scaleX: number
      scaleY: number
      angle: number
      elevationX?: number
      elevationY?: number
      text?: string
    }>
  ) => void
  deleteObject: (objectId: string | undefined) => void
  exportCanvas: (format: 'png', quality?: number) => Promise<string>
  getSelectedObject: () => any
  clearSelection: () => void
  selectObject?: (objectId: string) => void
}
