'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { FaGithub } from 'react-icons/fa'
import { cn } from '@/lib/utils'

interface EditorHeaderProps {
  className?: string
}

export function EditorHeader({ className }: EditorHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b border-border/50 bg-background/95 backdrop-blur-xl',
        'supports-backdrop-filter:bg-background/90',
        className
      )}
    >
      <div className="container mx-auto px-4 sm:px-5 lg:px-6">
        <div className="flex h-14 sm:h-16 items-center gap-3 sm:gap-4">
          <SidebarTrigger className="transition-opacity hover:opacity-80 touch-manipulation rounded-lg" />

          <Link
            href="/landing"
            className="flex items-center transition-opacity hover:opacity-80 rounded-lg p-1"
          >
            <Image
              src="/logo.png"
              alt="Stage"
              width={32}
              height={32}
              className="h-7 w-7 sm:h-8 sm:w-8"
            />
          </Link>

          <div className="flex-1" />

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://github.com/KartikLabhshetwar/stage"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'p-2 rounded-lg transition-all touch-manipulation',
                'hover:bg-accent text-muted-foreground hover:text-foreground hover:shadow-sm'
              )}
              aria-label="GitHub repository"
            >
              <FaGithub className="h-5 w-5 sm:h-5 sm:w-5 text-current" />
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
