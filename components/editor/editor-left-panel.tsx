'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TextOverlayControls } from '@/components/text-overlay/text-overlay-controls';
import { OverlayGallery, OverlayControls } from '@/components/overlays';
import { MockupGallery, MockupControls } from '@/components/mockups';
import { StyleTabs } from './style-tabs';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Trash2, Copy, ImageIcon, Type, Sticker } from 'lucide-react';
import { useImageStore } from '@/lib/store';
import { ExportDialog } from '@/components/canvas/dialogs/ExportDialog';
import { useExport } from '@/hooks/useExport';
import { PresetSelector } from '@/components/presets/PresetSelector';
import { FaXTwitter } from 'react-icons/fa6';

export function EditorLeftPanel() {
  const { 
    uploadedImageUrl, 
    selectedAspectRatio, 
    clearImage,
  } = useImageStore();
  
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);
  const [copySuccess, setCopySuccess] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('image');

  const {
    settings: exportSettings,
    isExporting,
    updateScale,
    exportImage,
    copyImage,
  } = useExport(selectedAspectRatio);

  return (
    <>
      <div className="w-full h-full bg-background flex flex-col overflow-hidden md:w-80 border-r border-border">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Link href="/landing" className="flex items-center hover:opacity-80 transition-opacity shrink-0">
              <Image 
                src="/logo.png" 
                alt="Stage" 
                width={32} 
                height={32}
                className="h-8 w-8"
              />
            </Link>
            <div className="flex-1 min-w-0 max-w-[calc(100%-120px)]">
              <PresetSelector />
            </div>
            <a
              href="https://x.com/code_kartik"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground shrink-0"
              aria-label="Twitter/X"
            >
              <FaXTwitter className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full grid grid-cols-3 rounded-none border-b border-border bg-muted/50 h-12">
            <TabsTrigger 
              value="image" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <ImageIcon className="size-4 mr-2" />
              Image
            </TabsTrigger>
            <TabsTrigger 
              value="text"
              className="data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Type className="size-4 mr-2" />
              Text
            </TabsTrigger>
            <TabsTrigger 
              value="stickers"
              className="data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Sticker className="size-4 mr-2" />
              Stickers
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            <TabsContent value="image" className="m-0 p-4 space-y-6">
              {/* Style Controls */}
              <StyleTabs />
              
              {/* Mockup Gallery */}
              <MockupGallery />
              
              {/* Mockup Controls */}
              <MockupControls />
            </TabsContent>

            <TabsContent value="text" className="m-0 p-4 space-y-6">
              {/* Text Overlays Section */}
              <TextOverlayControls />
            </TabsContent>

            <TabsContent value="stickers" className="m-0 p-4 space-y-6">
              {/* Overlay Gallery */}
              <OverlayGallery />
              
              {/* Image Overlays Section */}
              <OverlayControls />
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-background space-y-2">
          <div className="flex gap-2">
            <Button
              onClick={() => setExportDialogOpen(true)}
              disabled={!uploadedImageUrl}
              className="flex-1 h-11 justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all font-medium"
            >
              <Download className="size-4" />
              <span>Download</span>
            </Button>
            <Button
              onClick={() => {
                copyImage()
                  .then(() => {
                    setCopySuccess(true);
                    setTimeout(() => setCopySuccess(false), 2000);
                  })
                  .catch((error) => {
                    console.error('Failed to copy:', error);
                    alert('Failed to copy image to clipboard. Please try again.');
                  });
              }}
              disabled={!uploadedImageUrl || isExporting}
              className="flex-1 h-11 justify-center gap-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground shadow-sm hover:shadow-md transition-all font-medium border border-border"
            >
              <Copy className="size-4" />
              <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
            </Button>
          </div>
          <Button
            onClick={clearImage}
            disabled={!uploadedImageUrl}
            variant="outline"
            className="w-full h-10 justify-center gap-2 rounded-xl border-border hover:bg-accent text-foreground transition-all"
          >
            <Trash2 className="size-4" />
            <span>Remove Image</span>
          </Button>
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
  );
}

