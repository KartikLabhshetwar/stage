'use client'

import dynamic from 'next/dynamic'
import { useEditorStore } from '@/lib/store'
import { useImageStore } from '@/lib/store'
import { UploadDropzone } from '@/components/controls/UploadDropzone'
import { Button } from '@/components/ui/button'
import { Download, Copy, Trash2 } from 'lucide-react'
import { useExport } from '@/hooks/useExport'
import { useState } from 'react'
import { ExportDialog } from '@/components/canvas/dialogs/ExportDialog'

const ClientCanvas = dynamic(() => import('@/components/canvas/ClientCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
})

export function EditorCanvas() {
  const { screenshot } = useEditorStore()
  const { uploadedImageUrl, selectedAspectRatio, clearImage } = useImageStore()
  const [copySuccess, setCopySuccess] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const { copyImage, isExporting, settings: exportSettings, exportImage, updateScale } = useExport(selectedAspectRatio)

  if (!screenshot.src) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="w-full max-w-md">
          <UploadDropzone />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col h-full w-full">
        <div className="flex items-center justify-center gap-2 p-3 border-b border-border bg-background/95 backdrop-blur-sm shrink-0">
          <Button
            onClick={() => setExportDialogOpen(true)}
            disabled={!uploadedImageUrl}
            className="h-9 justify-center gap-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all font-medium px-4"
          >
            <Download className="size-4" />
            <span>Download</span>
          </Button>
          <Button
            onClick={() => {
              copyImage()
                .then(() => {
                  setCopySuccess(true)
                  setTimeout(() => setCopySuccess(false), 2000)
                })
                .catch((error) => {
                  console.error('Failed to copy:', error)
                  alert('Failed to copy image to clipboard. Please try again.')
                })
            }}
            disabled={!uploadedImageUrl || isExporting}
            className="h-9 justify-center gap-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground shadow-sm hover:shadow-md transition-all font-medium border border-border px-4"
          >
            <Copy className="size-4" />
            <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
          </Button>
          <Button
            onClick={clearImage}
            disabled={!uploadedImageUrl}
            variant="outline"
            className="h-9 justify-center gap-2 rounded-lg hover:bg-destructive/10 text-destructive hover:text-destructive border-destructive/20 hover:border-destructive/40 transition-all font-medium px-4"
          >
            <Trash2 className="size-4" />
            <span>Remove Image</span>
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center overflow-auto p-3 sm:p-4 md:p-6">
          <ClientCanvas />
        </div>
      </div>
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        onExport={() => exportImage().then(() => {})}
        scale={exportSettings.scale}
        isExporting={isExporting}
        onScaleChange={updateScale}
      />
    </>
  )
}

