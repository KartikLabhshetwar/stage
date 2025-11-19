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
        "flex-1 flex flex-col overflow-hidden",
        className
      )}
      style={{ backgroundColor: 'transparent' }}
    >
      {children}
    </main>
  );
}

