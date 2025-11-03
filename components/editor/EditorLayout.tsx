"use client";

import { useState } from "react";
import { CanvasProvider } from "@/components/canvas/CanvasContext";
import { CanvasEditor } from "@/components/canvas/CanvasEditor";
import { TemplateSelector } from "@/components/templates/TemplateSelector";
import { ImageUpload } from "@/components/controls/ImageUpload";
import { TransformControls } from "@/components/controls/TransformControls";
import { TextControls } from "@/components/controls/TextControls";
import { ExportControls } from "@/components/controls/ExportControls";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTemplate } from "@/hooks/useTemplate";
import type { Template } from "@/types/canvas";
import { cn } from "@/lib/utils";

function EditorContent() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const { applyTemplate } = useTemplate();

  const handleTemplateSelect = async (template: Template) => {
    setSelectedTemplate(template);
    await applyTemplate(template);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Templates & Upload */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="sticky top-4 space-y-6">
              <TemplateSelector
                selectedTemplateId={selectedTemplate?.id}
                onSelectTemplate={handleTemplateSelect}
              />
              <ImageUpload />
            </div>
          </aside>

          {/* Center Panel: Canvas */}
          <main className="lg:col-span-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-5xl">
              <div className="bg-white rounded-lg shadow-lg p-4">
                <CanvasEditor className="w-full" />
              </div>
            </div>
          </main>

          {/* Right Panel: Controls */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="sticky top-4 space-y-6">
              <Tabs defaultValue="transform" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="transform">Transform</TabsTrigger>
                  <TabsTrigger value="text">Text</TabsTrigger>
                </TabsList>
                <TabsContent value="transform" className="mt-4">
                  <TransformControls />
                </TabsContent>
                <TabsContent value="text" className="mt-4">
                  <TextControls />
                </TabsContent>
              </Tabs>
              <ExportControls />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export function EditorLayout() {
  return (
    <CanvasProvider>
      <EditorContent />
    </CanvasProvider>
  );
}
