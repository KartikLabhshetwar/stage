'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TextOverlayControls } from '@/components/text-overlay/text-overlay-controls';
import { OverlayGallery, OverlayControls, ArrowGallery, OverlayShadowsGallery } from '@/components/overlays';
import { MockupGallery, MockupControls } from '@/components/mockups';
import { StyleTabs } from './style-tabs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageIcon, Type, Sticker } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';

export function EditorLeftPanel() {
  const [activeTab, setActiveTab] = React.useState('image');

  return (
    <>
      <div className="w-full h-full bg-[rgb(26,26,26)] flex flex-col overflow-hidden md:w-80 border-r border-border">
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
            <div className="flex-1" />
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
          <TabsList className="w-full grid grid-cols-3 rounded-none bg-transparent h-12 p-1.5 gap-1.5">
            <TabsTrigger 
              value="image" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:shadow-black/20 rounded-md border-0 data-[state=active]:border-0 transition-all duration-200"
            >
              <ImageIcon className="size-4 mr-2" />
              Image
            </TabsTrigger>
            <TabsTrigger 
              value="text"
              className="data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:shadow-black/20 rounded-md border-0 data-[state=active]:border-0 transition-all duration-200"
            >
              <Type className="size-4 mr-2" />
              Text
            </TabsTrigger>
            <TabsTrigger 
              value="overlays"
              className="data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:shadow-black/20 rounded-md border-0 data-[state=active]:border-0 transition-all duration-200"
            >
              <Sticker className="size-4 mr-2" />
              Overlays
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

            <TabsContent value="overlays" className="m-0 p-4 space-y-6">
              {/* Arrow Gallery */}
              <ArrowGallery />
              
              {/* Overlay Shadows Gallery */}
              <OverlayShadowsGallery />
              
              {/* Overlay Gallery */}
              <OverlayGallery />
              
              {/* Image Overlays Section */}
              <OverlayControls />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
}

