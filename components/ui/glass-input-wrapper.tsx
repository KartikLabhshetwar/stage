import * as React from 'react'
import { cn } from '@/lib/utils'

interface GlassInputWrapperProps extends React.ComponentProps<'div'> {
  /**
   * Whether to apply the glass morphism effect
   * @default true
   */
  enabled?: boolean
  /**
   * Border intensity - controls the opacity of the border
   * @default "default" - moderate intensity
   */
  intensity?: 'subtle' | 'default' | 'strong'
}

/**
 * Glass morphism wrapper component for input fields
 * Provides a reusable glass morphism border effect with backdrop blur
 */
function GlassInputWrapper({
  className,
  enabled = true,
  intensity = 'default',
  children,
  ...props
}: GlassInputWrapperProps) {
  if (!enabled) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    )
  }

  const intensityClasses = {
    subtle: {
      border: 'border-border/20',
      bg: 'bg-background/5',
      glow: 'from-foreground/8',
    },
    default: {
      border: 'border-border/30',
      bg: 'bg-background/8',
      glow: 'from-foreground/12',
    },
    strong: {
      border: 'border-border/40',
      bg: 'bg-background/12',
      glow: 'from-foreground/18',
    },
  }

  const currentIntensity = intensityClasses[intensity]

  return (
    <div
      className={cn(
        // Glass morphism base
        'relative rounded-md overflow-hidden',
        // Border with glass effect
        currentIntensity.border,
        'border',
        // Backdrop blur for glass effect
        'backdrop-blur-md',
        // Subtle background for glass effect
        currentIntensity.bg,
        // Shadow for depth
        'shadow-sm',
        // Transition
        'transition-all duration-200',
        // Hover effect
        'hover:shadow-md hover:border-border/50',
        className
      )}
      {...props}
    >
      {/* Inner glow effect */}
      <div
        className={cn(
          'absolute inset-0 rounded-md pointer-events-none',
          'bg-gradient-to-br',
          currentIntensity.glow,
          'to-transparent',
          'opacity-50'
        )}
      />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export { GlassInputWrapper }
export type { GlassInputWrapperProps }
