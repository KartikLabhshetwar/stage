import React from "react"
import { Meta, Story } from "@storybook/react"
import { Avatar, AvatarImage, AvatarFallback } from "./avatar"

export default {
  title: "UI/Avatar",
  component: Avatar,
} as Meta

const Template: Story = () => (
  <div className="flex gap-4">
    <Avatar>
      <AvatarImage src="https://i.pravatar.cc/100" alt="User Avatar" />
      <AvatarFallback>AB</AvatarFallback>
    </Avatar>

    <Avatar>
      <AvatarFallback>CD</AvatarFallback>
    </Avatar>
  </div>
)

export const Default = Template.bind({})
