"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { FaChevronDown } from "react-icons/fa"

import { cn } from "@/lib/utils"

/**
 * Accordion component is the root container for multiple accordion items.
 *
 * @param props - Props passed to Radix AccordionRoot
 */
function Accordion({ ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

/**
 * AccordionItem wraps each item in the accordion.
 *
 * @param className - Additional class names
 * @param props - Props passed to Radix AccordionItem
 */
function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        "border-b",
        "last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

type AccordionTriggerProps = React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
  /** Optional icon to display instead of default chevron */
  icon?: React.ReactNode
}

/**
 * AccordionTrigger renders the clickable header for an AccordionItem.
 *
 * @param className - Additional class names
 * @param children - Trigger content
 * @param icon - Optional icon to override default chevron
 * @param props - Other props
 */
function AccordionTrigger({ className, children, icon, ...props }: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:border-ring",
          "focus-visible:ring-ring/50",
          "flex flex-1 items-start justify-between gap-4",
          "rounded-md py-4 text-left text-sm font-medium transition-all outline-none",
          "hover:underline",
          "focus-visible:ring-[3px]",
          "disabled:pointer-events-none disabled:opacity-50",
          "[&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        {icon ?? <FaChevronDown className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

/**
 * AccordionContent renders the collapsible content of an AccordionItem.
 *
 * @param className - Additional class names
 * @param children - Content inside accordion
 * @param props - Other props
 */
function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className={cn(
        "data-[state=closed]:animate-accordion-up",
        "data-[state=open]:animate-accordion-down",
        "overflow-hidden text-sm",
        className
      )}
      {...props}
    >
      <div className={cn("pt-0 pb-4")}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
