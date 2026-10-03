import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useForm } from "react-hook-form"

import { Button } from "./button.js"
import { Input } from "./input.js"
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "./form.js"

function ProfileForm({ invalid = false, disabled = false }: { invalid?: boolean; disabled?: boolean }) {
  const form = useForm<{ email: string }>({ defaultValues: { email: invalid ? "not-an-email" : "" } })
  const [saved, setSaved] = React.useState(false)
  React.useEffect(() => {
    if (invalid) form.setError("email", { type: "validate", message: "Enter a valid email address." })
  }, [form, invalid])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => setSaved(true))} className="grid w-[min(24rem,calc(100vw-2rem))] gap-6" noValidate>
        <FormField
          control={form.control}
          name="email"
          rules={{ required: "Enter an email address.", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address." } }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl><Input {...field} type="email" autoComplete="email" placeholder="you@example.com" disabled={disabled} /></FormControl>
              <FormDescription>We will send your project updates here.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={disabled}>Save preferences</Button>
        <p role="status" className="text-sm text-[var(--color-text-3)]">{saved ? "Your preferences have been saved." : ""}</p>
      </form>
    </Form>
  )
}

const meta = {
  title: "UI/Form",
  component: FormItem,
  tags: ["autodocs"],
  parameters: { renderer: "react", layout: "centered" },
} satisfies Meta<typeof FormItem>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { render: () => <ProfileForm /> }
export const ValidationError: Story = { render: () => <ProfileForm invalid /> }
export const Disabled: Story = { render: () => <ProfileForm disabled /> }
