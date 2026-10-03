import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useForm } from "react-hook-form"
import { REGEXP_ONLY_DIGITS } from "input-otp"

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../../src/components/ui/form.js"
import { Input } from "../../src/components/ui/input.js"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../../src/components/ui/input-otp.js"
import { Toaster, SonnerToaster, toast } from "../../src/components/ui/sonner.js"

function ValidationForm({ onSubmit }: { onSubmit: (values: { email: string }) => void }) {
  const form = useForm({ defaultValues: { email: "" } })
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FormField control={form.control} name="email" rules={{ required: "Enter an email address.", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address." } }} render={({ field }) => (
          <FormItem>
            <FormLabel>Email address</FormLabel>
            <FormControl aria-describedby="external-help"><Input {...field} aria-describedby="external-help child-help" aria-invalid={false} /></FormControl>
            <FormDescription>We will send updates here.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <p id="external-help">Use your work email.</p>
        <p id="child-help">Your email stays private.</p>
        <button type="submit">Save</button>
      </form>
    </Form>
  )
}

function OTPDemo({ onComplete, disabled = false }: { onComplete?: (value: string) => void; disabled?: boolean }) {
  return (
    <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} aria-label="Verification code" name="code" disabled={disabled} onComplete={onComplete} pasteTransformer={(value) => value.replace(/[\s-]/g, "")} pushPasswordManagerStrategy="none">
      <InputOTPGroup>{[0, 1, 2].map((index) => <InputOTPSlot key={index} index={index} />)}</InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>{[3, 4, 5].map((index) => <InputOTPSlot key={index} index={index} />)}</InputOTPGroup>
    </InputOTP>
  )
}

afterEach(() => { act(() => { toast.dismiss() }) })

describe("Form", () => {
  it("links the label, description and validation message to its control and preserves external descriptions", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ValidationForm onSubmit={onSubmit} />)
    const input = screen.getByRole("textbox", { name: "Email address" })
    expect(input).toHaveAttribute("aria-invalid", "false")
    expect(input.getAttribute("aria-describedby")?.split(" ")).toHaveLength(3)

    await user.click(screen.getByRole("button", { name: "Save" }))
    const message = await screen.findByText("Enter an email address.")
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(input.getAttribute("aria-describedby")?.split(" ")).toContain(message.id)
    for (const id of input.getAttribute("aria-describedby")!.split(" ")) expect(document.getElementById(id)).not.toBeNull()
    expect(onSubmit).not.toHaveBeenCalled()

    await user.type(input, "alice@example.test")
    await user.click(screen.getByRole("button", { name: "Save" }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onSubmit.mock.calls[0][0]).toEqual({ email: "alice@example.test" })
    expect(input).toHaveAttribute("aria-invalid", "false")
    expect(screen.queryByText("Enter an email address.")).not.toBeInTheDocument()
  })

  it("gives useful errors for every required form context", () => {
    expect(() => renderToStaticMarkup(<FormLabel>Email</FormLabel>)).toThrow("within <FormField>")
    function MissingItem() {
      const form = useForm({ defaultValues: { email: "" } })
      return <Form {...form}><FormField name="email" control={form.control} render={() => <FormLabel>Email</FormLabel>} /></Form>
    }
    function MissingForm() {
      const form = useForm({ defaultValues: { email: "" } })
      return <FormField name="email" control={form.control} render={() => <FormItem><FormLabel>Email</FormLabel></FormItem>} />
    }
    expect(() => renderToStaticMarkup(<MissingItem />)).toThrow("within <FormItem>")
    expect(() => renderToStaticMarkup(<MissingForm />)).toThrow("within <Form>")
  })
})

describe("Input OTP", () => {
  it("uses one named, autofill-compatible input and handles typing, completion and deletion", async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const { container } = render(<OTPDemo onComplete={onComplete} />)
    const input = screen.getByRole("textbox", { name: "Verification code" })
    expect(container.querySelectorAll("input")).toHaveLength(1)
    expect(input).toHaveAttribute("autocomplete", "one-time-code")
    expect(input).toHaveAttribute("name", "code")
    await user.type(input, "12A3456")
    expect(input).toHaveValue("123456")
    expect(onComplete).toHaveBeenCalledExactlyOnceWith("123456")
    expect([...container.querySelectorAll('[data-slot="input-otp-slot"]')].map((slot) => slot.textContent)).toEqual(["1", "2", "3", "4", "5", "6"])
    expect(container.querySelectorAll('[data-slot="input-otp-slot"][aria-hidden="true"]')).toHaveLength(6)
    await user.keyboard("{Backspace}")
    expect(input).toHaveValue("12345")
  })

  it("transforms pasted codes", async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<OTPDemo onComplete={onComplete} />)
    const input = screen.getByRole("textbox", { name: "Verification code" })
    await user.click(input)
    await user.paste("12-34 56")
    expect(input).toHaveValue("123456")
    expect(onComplete).toHaveBeenCalledExactlyOnceWith("123456")
  })

  it("synchronizes controlled values with the input and visual slots", () => {
    const onChange = vi.fn()
    const view = (value: string) => <InputOTP value={value} onChange={onChange} maxLength={2} aria-label="Controlled PIN" pushPasswordManagerStrategy="none"><InputOTPGroup><InputOTPSlot index={0} /><InputOTPSlot index={1} /></InputOTPGroup></InputOTP>
    const { container, rerender } = render(view("12"))
    expect(screen.getByRole("textbox", { name: "Controlled PIN" })).toHaveValue("12")
    rerender(view("34"))
    expect(screen.getByRole("textbox", { name: "Controlled PIN" })).toHaveValue("34")
    expect([...container.querySelectorAll('[data-slot="input-otp-slot"]')].map((slot) => slot.textContent)).toEqual(["3", "4"])
  })

  it("forwards the real input ref, disabled state and invalid state", () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<InputOTP ref={ref} maxLength={1} disabled aria-invalid aria-label="PIN"><InputOTPGroup><InputOTPSlot index={0} /></InputOTPGroup></InputOTP>)
    expect(ref.current).toBe(screen.getByRole("textbox", { name: "PIN" }))
    expect(ref.current).toBeDisabled()
    expect(ref.current).toHaveAttribute("aria-invalid", "true")
    expect(ref.current).toHaveClass("font-sans!")
  })

  it("renders a harmless empty slot for missing context and out-of-range indexes", () => {
    expect(() => renderToStaticMarkup(<InputOTPSlot index={0} />)).not.toThrow()
    expect(() => renderToStaticMarkup(<InputOTP maxLength={1}><InputOTPGroup><InputOTPSlot index={99} /><InputOTPSlot index={-1} /></InputOTPGroup></InputOTP>)).not.toThrow()
  })
})

describe("Sonner", () => {
  it("preserves explicit themes, custom styles and toast actions", async () => {
    const onAction = vi.fn()
    const { container } = render(<Toaster theme="dark" position="top-right" style={{ zIndex: 120 }} toastOptions={{ duration: Infinity, classNames: { toast: "custom-toast" }, style: { borderWidth: 2 } }} />)
    act(() => { toast("Project archived", { description: "You can undo this action.", action: { label: "Undo", onClick: onAction } }) })
    await screen.findByText("Project archived")
    const viewport = container.querySelector<HTMLElement>('[data-sonner-toaster]')!
    expect(viewport).toHaveAttribute("data-sonner-theme", "dark")
    expect(viewport).toHaveAttribute("data-y-position", "top")
    expect(viewport.style.fontFamily).toBe("var(--font-sans)")
    expect(viewport.style.zIndex).toBe("120")
    const notification = container.querySelector<HTMLElement>('[data-sonner-toast]')!
    expect(notification).toHaveClass("custom-toast", "font-sans")
    expect(notification.style.fontFamily).toBe("var(--font-sans)")
    expect(notification.style.borderWidth).toBe("2px")
    expect(screen.getByText("You can undo this action.")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Undo" }))
    expect(onAction).toHaveBeenCalledTimes(1)
    expect(SonnerToaster).toBe(Toaster)
  })

  it("displays typed notifications and exposes an accessible close action", async () => {
    const { container } = render(<Toaster theme="light" closeButton toastOptions={{ duration: Infinity }} />)
    act(() => { toast.error("Could not save", { description: "Try again in a moment." }) })
    await screen.findByText("Could not save")
    expect(container.querySelector('[data-sonner-toast]')).toHaveAttribute("data-type", "error")
    fireEvent.click(screen.getByRole("button", { name: "Close toast" }))
    await waitFor(() => expect(screen.queryByText("Could not save")).not.toBeInTheDocument())
  })
})
