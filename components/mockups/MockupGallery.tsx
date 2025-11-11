'use client'

import { useState } from 'react'
import { useImageStore } from '@/lib/store'
import { MOCKUP_DEFINITIONS, getMockupsByType } from '@/lib/constants/mockups'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useResponsiveCanvasDimensions } from '@/hooks/useAspectRatioDimensions'
import Image from 'next/image'
import { Smartphone, Laptop, Monitor, Watch } from 'lucide-react'

export function MockupGallery() {
  const { addMockup } = useImageStore()
  const [activeType, setActiveType] = useState<'iphone' | 'macbook' | 'imac' | 'iwatch'>('macbook')
  const responsiveDimensions = useResponsiveCanvasDimensions()

  const getDefaultPosition = (mockupSize: number, mockupType: string) => {
    const canvasWidth = responsiveDimensions.width || 1920
    const canvasHeight = responsiveDimensions.height || 1080
    
    let aspectRatio = 16 / 9
    if (mockupType === 'iphone') aspectRatio = 9 / 16
    else if (mockupType === 'iwatch') aspectRatio = 1
    else if (mockupType === 'imac') aspectRatio = 2146 / 1207
    
    const mockupHeight = mockupSize / aspectRatio
    
    return {
      x: Math.max(20, (canvasWidth / 2) - (mockupSize / 2)),
      y: Math.max(20, (canvasHeight / 2) - (mockupHeight / 2)),
    }
  }

  const handleAddMockup = (definitionId: string) => {
    const definition = MOCKUP_DEFINITIONS.find(d => d.id === definitionId)
    let defaultSize = 600
    if (definition?.type === 'iphone') defaultSize = 220
    else if (definition?.type === 'iwatch') defaultSize = 150
    else if (definition?.type === 'imac') defaultSize = 500
    
    const defaultPosition = getDefaultPosition(defaultSize, definition?.type || 'macbook')
    
    addMockup({
      definitionId,
      position: defaultPosition,
      size: defaultSize,
      rotation: 0,
      opacity: 1,
      isVisible: true,
      imageFit: 'cover',
    })
  }

  const macbookMockups = getMockupsByType('macbook')
  const iphoneMockups = getMockupsByType('iphone')
  const imacMockups = getMockupsByType('imac')
  const iwatchMockups = getMockupsByType('iwatch')

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <h3 className="font-semibold text-sm text-foreground">Device Mockups</h3>
        <p className="text-xs text-muted-foreground">
          Add device frames to showcase your designs
        </p>
      </div>

      <Tabs value={activeType} onValueChange={(v) => setActiveType(v as 'iphone' | 'macbook' | 'imac' | 'iwatch')}>
        <TabsList className="w-full grid grid-cols-4 gap-1 p-1 h-auto bg-muted/50 rounded-lg">
          <TabsTrigger 
            value="macbook" 
            className="text-xs gap-1.5 px-3 py-2.5 h-auto border-0 rounded-md transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none hover:bg-muted"
          >
            <Laptop className="h-3.5 w-3.5" />
            <span>MacBook</span>
          </TabsTrigger>
          <TabsTrigger 
            value="imac" 
            className="text-xs gap-1.5 px-3 py-2.5 h-auto border-0 rounded-md transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none hover:bg-muted"
          >
            <Monitor className="h-3.5 w-3.5" />
            <span>iMac</span>
          </TabsTrigger>
          <TabsTrigger 
            value="iwatch" 
            className="text-xs gap-1.5 px-3 py-2.5 h-auto border-0 rounded-md transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none hover:bg-muted"
          >
            <Watch className="h-3.5 w-3.5" />
            <span>Watch</span>
          </TabsTrigger>
          <TabsTrigger 
            value="iphone" 
            className="text-xs gap-1.5 px-3 py-2.5 h-auto border-0 rounded-md transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none hover:bg-muted"
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>iPhone</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="macbook" className="mt-5">
          <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
            {macbookMockups.map((mockup) => (
              <button
                key={mockup.id}
                onClick={() => handleAddMockup(mockup.id)}
                className="group relative aspect-video rounded-lg overflow-hidden border border-border hover:border-primary transition-colors bg-muted"
              >
                <Image
                  src={mockup.src}
                  alt={mockup.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 200px"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-xs text-white font-medium truncate">{mockup.name}</p>
                </div>
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="imac" className="mt-5">
          <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
            {imacMockups.map((mockup) => (
              <button
                key={mockup.id}
                onClick={() => handleAddMockup(mockup.id)}
                className="group relative aspect-video rounded-lg overflow-hidden border border-border hover:border-primary transition-colors bg-muted"
              >
                <Image
                  src={mockup.src}
                  alt={mockup.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 200px"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-xs text-white font-medium truncate">{mockup.name}</p>
                </div>
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="iwatch" className="mt-5">
          <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
            {iwatchMockups.map((mockup) => (
              <button
                key={mockup.id}
                onClick={() => handleAddMockup(mockup.id)}
                className="group relative aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-colors bg-muted"
              >
                <Image
                  src={mockup.src}
                  alt={mockup.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 200px"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-xs text-white font-medium truncate">{mockup.name}</p>
                </div>
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="iphone" className="mt-5">
          {iphoneMockups.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {iphoneMockups.map((mockup) => (
                <button
                  key={mockup.id}
                  onClick={() => handleAddMockup(mockup.id)}
                  className="group relative aspect-[9/16] rounded-lg overflow-hidden border border-border hover:border-primary transition-colors bg-muted"
                >
                  <Image
                    src={mockup.src}
                    alt={mockup.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 200px"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-xs text-white font-medium truncate">{mockup.name}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <Smartphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>iPhone mockups coming soon</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

