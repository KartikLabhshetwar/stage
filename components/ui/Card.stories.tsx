import React from "react"
import { Meta, Story } from "@storybook/react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
  CardFooter
} from "./card"
import { Button } from "@/components/ui/button"

export default {
  title: "UI/Card",
  component: Card,
} as Meta

const Template: Story = () => (
  <Card>
    <CardHeader>
      <CardTitle>Card Title</CardTitle>
      <CardDescription>This is a description of the card.</CardDescription>
    </CardHeader>
    <CardContent>
      <p>Here is some card content.</p>
    </CardContent>
    <CardAction>
      <Button size="sm">Action</Button>
    </CardAction>
    <CardFooter>
      <p className="text-sm text-muted-foreground">Footer text</p>
    </CardFooter>
  </Card>
)

export const Default = Template.bind({})
