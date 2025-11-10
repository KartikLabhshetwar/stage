"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Shuffle, Undo2, Redo2 } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { SponsorButton } from "@/components/SponsorButton";

export function EditorBottomBar() {
  return (
    <div className="h-14 bg-background border-t border-border flex items-center justify-between px-3 sm:px-4 md:px-6">
      {/* Left side - Open Source and Shuffle */}
      <div className="flex items-center gap-2 sm:gap-3">
        <a
          href="https://github.com/KartikLabhshetwar/stage"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            variant="outline"
            className="h-9 px-2 sm:px-4 rounded-xl bg-background hover:bg-accent text-foreground border-border hover:border-border/80 shadow-sm hover:shadow-md transition-all font-medium gap-1.5 sm:gap-2 text-xs sm:text-sm"
          >
            <FaGithub className="size-4" />
            <span className="hidden sm:inline">Proudly Open Source</span>
            <span className="sm:hidden">Open Source</span>
          </Button>
        </a>
      </div>

      {/* Right side - Undo/Redo and Sponsor */}
      <div className="flex items-center gap-2">
        <SponsorButton variant="bar" />
      </div>
    </div>
  );
}
