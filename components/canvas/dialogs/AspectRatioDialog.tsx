"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ASPECT_RATIO_PRESETS, type AspectRatioPreset } from "@/lib/constants";
import { useCanvasContext } from "../CanvasContext";

interface AspectRatioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AspectRatioDialog({ open, onOpenChange }: AspectRatioDialogProps) {
  const { aspectRatio, setAspectRatio, canvasDimensions, setCanvasDimensions } = useCanvasContext();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6 pb-4 border-b border-gray-100">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Canvas Size & Aspect Ratio
            </DialogTitle>
            <p className="text-sm text-gray-500 mt-2">
              Choose a preset or set custom dimensions for your canvas
            </p>
          </DialogHeader>
        </div>
        
        <div className="p-6 pt-4">
          <Tabs defaultValue="presets" className="w-full">
            <TabsList className="flex gap-1.5 p-1 bg-gray-50 rounded-lg border border-gray-200 mb-6 h-auto w-full">
              <TabsTrigger 
                value="presets"
                className="flex-1 px-4 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-blue-200 data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 data-[state=inactive]:hover:bg-white/50 data-[state=inactive]:bg-transparent h-auto"
              >
                Presets
              </TabsTrigger>
              <TabsTrigger 
                value="custom"
                className="flex-1 px-4 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-blue-200 data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 data-[state=inactive]:hover:bg-white/50 data-[state=inactive]:bg-transparent h-auto"
              >
                Custom
              </TabsTrigger>
            </TabsList>

            <TabsContent value="presets" className="space-y-5">
              {/* Instagram Category */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Instagram</label>
                <div className="grid grid-cols-2 gap-3">
                  {ASPECT_RATIO_PRESETS.filter(p => p.category === "Instagram").map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setAspectRatio(preset);
                        onOpenChange(false);
                      }}
                      className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all group ${
                        aspectRatio.id === preset.id
                          ? "border-blue-500 ring-2 ring-blue-500/20"
                          : "border-gray-200 hover:border-blue-500"
                      }`}
                      style={{ aspectRatio: `${preset.width} / ${preset.height}`, maxHeight: '140px' }}
                      title={preset.description}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                      
                      <div className={`absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-semibold ${
                        aspectRatio.id === preset.id
                          ? "bg-blue-600 text-white"
                          : "bg-white/90 text-gray-700"
                      }`}>
                        {preset.ratio}
                      </div>

                      <div className={`absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t ${
                        aspectRatio.id === preset.id
                          ? "from-blue-600/90 to-transparent"
                          : "from-black/50 to-transparent"
                      }`}>
                        <div className={`text-xs font-semibold ${
                          aspectRatio.id === preset.id ? "text-white" : "text-white"
                        }`}>
                          {preset.name.replace("Instagram ", "")}
                        </div>
                        <div className={`text-[10px] ${
                          aspectRatio.id === preset.id ? "text-blue-100" : "text-gray-300"
                        }`}>
                          {preset.width} × {preset.height}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Other Social Media */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Social Media</label>
                <div className="grid grid-cols-2 gap-3">
                  {ASPECT_RATIO_PRESETS.filter(p => ["Facebook", "Twitter", "YouTube"].includes(p.category)).map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setAspectRatio(preset);
                        onOpenChange(false);
                      }}
                      className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all group ${
                        aspectRatio.id === preset.id
                          ? "border-blue-500 ring-2 ring-blue-500/20"
                          : "border-gray-200 hover:border-blue-500"
                      }`}
                      style={{ aspectRatio: `${preset.width} / ${preset.height}`, maxHeight: '140px' }}
                      title={preset.description}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                      
                      <div className={`absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-semibold ${
                        aspectRatio.id === preset.id
                          ? "bg-blue-600 text-white"
                          : "bg-white/90 text-gray-700"
                      }`}>
                        {preset.ratio}
                      </div>

                      <div className={`absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t ${
                        aspectRatio.id === preset.id
                          ? "from-blue-600/90 to-transparent"
                          : "from-black/50 to-transparent"
                      }`}>
                        <div className={`text-xs font-semibold ${
                          aspectRatio.id === preset.id ? "text-white" : "text-white"
                        }`}>
                          {preset.name}
                        </div>
                        <div className={`text-[10px] ${
                          aspectRatio.id === preset.id ? "text-blue-100" : "text-gray-300"
                        }`}>
                          {preset.width} × {preset.height}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Standard Formats */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Standard Formats</label>
                <div className="grid grid-cols-2 gap-3">
                  {ASPECT_RATIO_PRESETS.filter(p => p.category === "Standard").map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setAspectRatio(preset);
                        onOpenChange(false);
                      }}
                      className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all group ${
                        aspectRatio.id === preset.id
                          ? "border-blue-500 ring-2 ring-blue-500/20"
                          : "border-gray-200 hover:border-blue-500"
                      }`}
                      style={{ aspectRatio: `${preset.width} / ${preset.height}`, maxHeight: '140px' }}
                      title={preset.description}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                      
                      <div className={`absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-semibold ${
                        aspectRatio.id === preset.id
                          ? "bg-blue-600 text-white"
                          : "bg-white/90 text-gray-700"
                      }`}>
                        {preset.ratio}
                      </div>

                      <div className={`absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t ${
                        aspectRatio.id === preset.id
                          ? "from-blue-600/90 to-transparent"
                          : "from-black/50 to-transparent"
                      }`}>
                        <div className={`text-xs font-semibold ${
                          aspectRatio.id === preset.id ? "text-white" : "text-white"
                        }`}>
                          {preset.name}
                        </div>
                        <div className={`text-[10px] ${
                          aspectRatio.id === preset.id ? "text-blue-100" : "text-gray-300"
                        }`}>
                          {preset.width} × {preset.height}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-6">
              <div className="space-y-6">
                {/* Input Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Width
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={canvasDimensions.width}
                        onChange={(e) => {
                          const newWidth = parseInt(e.target.value) || 100;
                          setCanvasDimensions(newWidth, canvasDimensions.height);
                        }}
                        min={100}
                        max={5000}
                        className="pr-12 text-base font-medium"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">px</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Height
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={canvasDimensions.height}
                        onChange={(e) => {
                          const newHeight = parseInt(e.target.value) || 100;
                          setCanvasDimensions(canvasDimensions.width, newHeight);
                        }}
                        min={100}
                        max={5000}
                        className="pr-12 text-base font-medium"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">px</span>
                    </div>
                  </div>
                </div>

                {/* Preview Card */}
                <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full blur-3xl" />
                  <div className="relative space-y-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Current Canvas</div>
                      <div className="text-xs text-gray-500">Dimensions & Aspect Ratio</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Dimensions</div>
                        <div className="text-lg font-bold text-gray-900">
                          {canvasDimensions.width} × {canvasDimensions.height}
                        </div>
                        <div className="text-xs text-gray-400">pixels</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Aspect Ratio</div>
                        <div className="text-lg font-bold text-gray-900">
                          {(() => {
                            const calculateAspectRatio = (w: number, h: number): string => {
                              const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
                              const divisor = gcd(w, h);
                              const ratioW = Math.round(w / divisor);
                              const ratioH = Math.round(h / divisor);
                              const simplifiedDivisor = gcd(ratioW, ratioH);
                              return `${Math.round(ratioW / simplifiedDivisor)}:${Math.round(ratioH / simplifiedDivisor)}`;
                            };
                            return calculateAspectRatio(canvasDimensions.width, canvasDimensions.height);
                          })()}
                        </div>
                        <div className="text-xs text-gray-400">ratio</div>
                      </div>
                    </div>

                    {/* Visual Preview */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">Preview</div>
                      <div 
                        className="relative mx-auto rounded-lg border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden shadow-inner"
                        style={{ 
                          aspectRatio: `${canvasDimensions.width} / ${canvasDimensions.height}`,
                          maxWidth: '200px',
                          maxHeight: '120px'
                        }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-[10px] font-semibold text-gray-400">
                            {canvasDimensions.width} × {canvasDimensions.height}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

