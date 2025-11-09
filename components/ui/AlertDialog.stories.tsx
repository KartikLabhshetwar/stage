import React, { useState } from "react"
import { Meta, Story } from "@storybook/react"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel
} from "./alert-dialog"
import { Button } from "@/components/ui/button"

export default {
  title: "UI/AlertDialog",
  component: AlertDialog,
} as Meta

const Template: Story = () => {
  const [loading, setLoading] = useState(false)

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button>Open Alert</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Item?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel loading={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            loading={loading}
            onClick={() => {
              setLoading(true)
              setTimeout(() => setLoading(false), 1000)
            }}
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export const Default = Template.bind({})
