"use client";

import * as React from "react";
import { EditorLeftPanel } from "./editor-left-panel";
import { EditorRightPanel } from "./editor-right-panel";
import { EditorContent } from "./EditorContent";
import { EditorCanvas } from "@/components/canvas/EditorCanvas";
import { EditorStoreSync } from "@/components/canvas/EditorStoreSync";
import { EditorBottomBar } from "./editor-bottom-bar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Settings } from "lucide-react";
import { useAutosaveDraft } from "@/hooks/useAutosaveDraft";
import { MobileBanner } from "./MobileBanner";

function EditorMain() {
  const isMobile = useIsMobile();
  const [leftPanelOpen, setLeftPanelOpen] = React.useState(false);
  const [rightPanelOpen, setRightPanelOpen] = React.useState(false);

  // enable autosave
  useAutosaveDraft();

  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <EditorStoreSync />

      {/* Mobile Banner */}
      <MobileBanner />

      {/* Mobile Header */}
      {isMobile && (
        <div className="h-14 bg-background border-b border-border flex items-center justify-between px-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLeftPanelOpen(true)}
            className="h-9 w-9"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRightPanelOpen(true)}
            className="h-9 w-9"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Desktop */}
        {!isMobile && <EditorLeftPanel />}

        {/* Left Panel - Mobile Sheet */}
        {isMobile && (
          <Sheet open={leftPanelOpen} onOpenChange={setLeftPanelOpen}>
            <SheetContent
              side="left"
              className="w-[320px] p-0 sm:max-w-[320px]"
            >
              <EditorLeftPanel />
            </SheetContent>
          </Sheet>
        )}

        {/* Center Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background relative">
          <EditorContent>
            <EditorCanvas />
          </EditorContent>
        </div>

        {/* Right Panel - Desktop */}
        {!isMobile && <EditorRightPanel />}

        {/* Right Panel - Mobile Sheet */}
        {isMobile && (
          <Sheet open={rightPanelOpen} onOpenChange={setRightPanelOpen}>
            <SheetContent
              side="right"
              className="w-[320px] p-0 sm:max-w-[320px]"
            >
              <EditorRightPanel />
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* Bottom Bar */}
      <EditorBottomBar />
    </div>
  );
}

export function EditorLayout() {
  return <EditorMain />;
}
