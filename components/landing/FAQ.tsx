'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Instrument_Serif } from 'next/font/google'

const instrumentSerif = Instrument_Serif({
  weight: ['400'],
  subsets: ['latin'],
})

interface FAQItem {
  question: string
  answer: string
}

interface FAQProps {
  title?: string
  faqs?: FAQItem[]
}

const defaultFAQs: FAQItem[] = [
  {
    question: 'What is Stage?',
    answer:
      'Stage is a modern web-based canvas editor that runs entirely in your browser. Create professional-looking designs for social media, presentations, or personal projects without any design software installation required.',
  },
  {
    question: 'Do I need to create an account?',
    answer:
      'No account required! Stage is completely free to use. Simply visit the editor and start creating your designs immediately—no sign-up, no login, no hassle.',
  },
  {
    question: 'Is Stage free to use?',
    answer:
      'Yes, Stage is completely free. Create unlimited designs, export without restrictions, and access all features at no cost. Just open your browser and start designing.',
  },
  {
    question: 'What can I create with Stage?',
    answer:
      'You can create social media graphics (Instagram posts, stories, reels), image showcases, presentation visuals, and custom designs. Upload your images, add text overlays, customize backgrounds, apply professional presets, and export high-quality graphics.',
  },
  {
    question: 'What export formats are available?',
    answer:
      'Export your designs as PNG (with transparency support) or JPG. You can adjust the quality for JPG files and scale your exports up to 5x the original size for high-resolution output. Exported images include a subtle Stage watermark in the bottom-right corner. Perfect for both digital use and printing.',
  },
  {
    question: 'Which aspect ratios does Stage support?',
    answer:
      'Stage supports Instagram formats (Square 1:1, Portrait 4:5, Story/Reel 9:16), social media formats (Landscape 16:9, Portrait 3:4), and standard photo formats. All formats are optimized for their respective platforms.',
  },
  {
    question: 'What are presets and how do I use them?',
    answer:
      'Presets are one-click styling options that instantly transform your design. Stage includes 5 professional presets: Social Ready, Story Style, Minimal Clean, Bold Gradient, and Dark Elegant. Click any preset to apply it instantly to your canvas.',
  },
  {
    question: 'What image file formats can I upload?',
    answer:
      'You can upload PNG, JPG, JPEG, or WEBP images. Each image can be up to 100MB in size. The editor handles all processing in your browser for fast, secure editing.',
  },
  {
    question: 'Can I save my designs to my computer?',
    answer:
      'Yes! Export your completed designs directly to your device as PNG or JPG files. Save them anywhere you like—your desktop, cloud storage, or any folder. Your designs are yours to keep.',
  },
  {
    question: 'What customization options are available?',
    answer:
      'For images: adjust size, opacity, borders (width, color, style), shadows, and border radius. For text: add multiple text overlays with custom fonts, colors, sizes, positions, and text shadows. For backgrounds: choose from gradients, solid colors, or upload your own background images.',
  },
]

export function FAQ({ title = 'Frequently Asked Questions', faqs = defaultFAQs }: FAQProps) {
  return (
    <section className="w-full py-12 sm:py-16 px-4 sm:px-6 border-t border-border bg-background">
      <div className="container mx-auto max-w-3xl">
        <h2
          className={`text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 px-2 ${instrumentSerif.className}`}
        >
          {title}
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b border-border">
              <AccordionTrigger className="text-left text-base sm:text-lg font-semibold py-4 sm:py-6 hover:no-underline px-2 sm:px-0">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed px-2 sm:px-0 pb-4 sm:pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
