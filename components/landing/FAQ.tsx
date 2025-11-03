"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Instrument_Serif } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  subsets: ["latin"],
});

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  title?: string;
  faqs?: FAQItem[];
}

const defaultFAQs: FAQItem[] = [
  {
    question: "What is Stage?",
    answer:
      "Stage is a modern canvas editor that allows you to create stunning visual designs. You can add images, text, custom backgrounds, gradients, and export your creations in high quality PNG or JPG formats.",
  },
  {
    question: "Is Stage free to use?",
    answer:
      "Yes, Stage is completely free to use. You can create unlimited designs and export them without any restrictions or watermarks.",
  },
  {
    question: "What file formats can I export?",
    answer:
      "You can export your designs in PNG (with transparency support) or JPG format. JPG exports allow you to adjust the quality level from 10% to 100%.",
  },
  {
    question: "What image formats can I upload?",
    answer:
      "Stage supports PNG, JPG, JPEG, and WEBP image formats. Maximum file size is 10MB per image.",
  },
  {
    question: "Can I customize the canvas size?",
    answer:
      "Yes! Stage offers preset aspect ratios for Instagram, Facebook, Twitter, YouTube, and standard formats. You can also set custom dimensions with full control over width and height.",
  },
  {
    question: "Can I use custom backgrounds?",
    answer:
      "Absolutely! Stage supports solid colors, linear gradients, radial gradients, and custom background images. You can choose from preset backgrounds or upload your own.",
  },
  {
    question: "How do I edit text on the canvas?",
    answer:
      "Click the 'Add Text' button in the toolbar, enter your text, choose the font size and color, and it will appear on your canvas. You can drag, resize, and transform text objects just like images.",
  },
  {
    question: "Is Stage mobile-friendly?",
    answer:
      "Yes, Stage is fully responsive and works great on mobile devices. All features including canvas editing, image upload, and export are accessible on smartphones and tablets.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "No account is required! Stage works directly in your browser. All editing happens locally, and you can start creating immediately.",
  },
  {
    question: "Can I save my projects?",
    answer:
      "Currently, Stage works as a session-based editor. You can export your final designs, but projects aren't saved automatically. We recommend exporting your work when you're done editing.",
  },
];

export function FAQ({ title = "Frequently Asked Questions", faqs = defaultFAQs }: FAQProps) {
  return (
    <section className="w-full py-12 sm:py-16 px-4 sm:px-6 border-t border-border bg-muted/30">
      <div className="container mx-auto max-w-3xl">
        <h2 className={`text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 ${instrumentSerif.className}`}>
          {title}
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b border-border">
              <AccordionTrigger className="text-left text-base sm:text-sm font-semibold py-4 hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

