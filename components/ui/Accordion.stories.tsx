import React from "react"
import { Meta, Story } from "@storybook/react"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./Accordion"

export default {
  title: "UI/Accordion",
  component: Accordion,
} as Meta

const Template: Story = () => (
  <Accordion type="single" collapsible defaultValue="item-1">
    <AccordionItem value="item-1">
      <AccordionTrigger>Item 1</AccordionTrigger>
      <AccordionContent>
        <p>This is the content of Item 1.</p>
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="item-2">
      <AccordionTrigger icon={<span>🔔</span>}>Item 2</AccordionTrigger>
      <AccordionContent>
        <p>This is the content of Item 2 with a custom icon.</p>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
)

export const Default = Template.bind({})
