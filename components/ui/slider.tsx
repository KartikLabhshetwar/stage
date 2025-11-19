"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

interface SliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
  label?: string
  valueDisplay?: string | number
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  label,
  valueDisplay,
  ...props
}: SliderProps) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  const displayValue = valueDisplay ?? (Array.isArray(value) ? value[0] : value ?? (Array.isArray(defaultValue) ? defaultValue[0] : defaultValue ?? min))

  return (
    <div className="relative flex items-center w-full">
      {label && (
        <span className="text-sm font-medium text-foreground whitespace-nowrap mr-3 select-none">
          {label}
        </span>
      )}
      <span className="text-sm text-foreground font-medium whitespace-nowrap mr-3 select-none">
        {displayValue}
      </span>
      <SliderPrimitive.Root
        data-slot="slider"
        defaultValue={defaultValue}
        value={value}
        min={min}
        max={max}
        className={cn(
          "relative flex touch-none select-none items-center cursor-grab flex-1",
          "data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
          className
        )}
        {...props}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={cn(
            "relative h-8 w-full grow overflow-hidden rounded-md bg-[#f5f5f5] dark:bg-neutral-950 data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
          )}
        >
          <SliderPrimitive.Range
            data-slot="slider-range"
            className={cn(
              "absolute h-full bg-[#dedede] dark:bg-[#303030] data-[orientation=vertical]:w-full transition-all duration-200"
            )}
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className="block h-8 w-1 bg-[#c8c7c7] dark:bg-[#3e3e3e] focus:outline-none transition-all duration-200 ease-in-out disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Root>
    </div>
  )
}

export { Slider }
