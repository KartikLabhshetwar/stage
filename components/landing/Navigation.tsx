'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { FaGithub } from 'react-icons/fa'
import { SiX } from 'react-icons/si'
import { motion, useSpring, useTransform } from 'motion/react'

interface NavigationProps {
  ctaLabel?: string
  ctaHref?: string
}

function useGitHubStars() {
  const [stars, setStars] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStars = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/KartikLabhshetwar/stage')
        if (response.ok) {
          const data = await response.json()
          setStars(data.stargazers_count)
        }
      } catch (error) {
        console.error('Failed to fetch GitHub stars:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStars()
  }, [])

  return { stars, isLoading }
}

function AnimatedCounter({ value }: { value: number }) {
  const spring = useSpring(0, {
    damping: 30,
    stiffness: 100,
  })

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  const display = useTransform(spring, (current) => Math.round(current).toLocaleString())

  return <motion.span>{display}</motion.span>
}

export function Navigation({ ctaLabel = 'Editor', ctaHref = '/home' }: NavigationProps) {
  const { stars, isLoading } = useGitHubStars()

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-xl supports-backdrop-filter:bg-background/90">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Link href="/landing" className="flex items-center">
          <Image src="/logo.png" alt="Stage" width={32} height={32} className="h-8 w-8" />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="https://github.com/KartikLabhshetwar/stage"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-accent rounded-lg transition-colors touch-manipulation text-muted-foreground hover:text-foreground group"
            aria-label="GitHub repository"
          >
            <FaGithub className="h-5 w-5 text-current" />
            {!isLoading && stars !== null && (
              <span className="text-sm font-medium flex items-center gap-1">
                <span className="text-sm">★</span>
                <AnimatedCounter value={stars} />
              </span>
            )}
          </Link>
          <Link
            href="https://x.com/code_kartik"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-accent rounded-lg transition-colors touch-manipulation text-muted-foreground hover:text-foreground group"
            aria-label="X (Twitter) profile"
          >
            <SiX className="h-5 w-5 text-current" />
          </Link>
          <Link href={ctaHref} className="flex items-center">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm px-3 sm:px-4 py-2 touch-manipulation">
              {ctaLabel}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
