"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface EditorContentProps {
  children: React.ReactNode;
  className?: string;
}

export function EditorContent({ children, className }: EditorContentProps) {
  return (
    <main
      className={cn(
        "flex-1 flex items-center justify-center overflow-auto",
        "p-3 sm:p-4 md:p-6",
        className,
      )}
      style={{ backgroundColor: "transparent" }}
    >
      {children}
    </main>
  );
}
