import React from "react"
import { Meta, Story } from "@storybook/react"
import { Button } from "./button"

export default {
  title: "UI/Button",
  component: Button,
} as Meta

const Template: Story = (args) => <Button {...args}>Click Me</Button>

export const Default = Template.bind({})
Default.args = {
  variant: "default",
  size: "default",
}

export const Destructive = Template.bind({})
Destructive.args = {
  variant: "destructive",
  size: "default",
}

export const Outline = Template.bind({})
Outline.args = {
  variant: "outline",
  size: "default",
}

export const IconButton = Template.bind({})
IconButton.args = {
  variant: "default",
  size: "icon",
}
