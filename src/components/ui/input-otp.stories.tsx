import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { REGEXP_ONLY_DIGITS, REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"

import { Label } from "./label.js"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "./input-otp.js"

function CodeInput({ disabled = false, invalid = false, alphanumeric = false }: { disabled?: boolean; invalid?: boolean; alphanumeric?: boolean }) {
  const [value, setValue] = React.useState(invalid ? "000000" : "")
  const id = React.useId()
  return (
    <div className="grid gap-3">
      <Label htmlFor={id}>Verification code</Label>
      <InputOTP id={id} name="verificationCode" maxLength={6} pattern={alphanumeric ? REGEXP_ONLY_DIGITS_AND_CHARS : REGEXP_ONLY_DIGITS} value={value} onChange={setValue} disabled={disabled} aria-invalid={invalid} aria-describedby={`${id}-help`} pasteTransformer={(pasted) => pasted.replace(/[\s-]/g, "")}>
        <InputOTPGroup>{[0, 1, 2].map((index) => <InputOTPSlot key={index} index={index} aria-invalid={invalid} />)}</InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>{[3, 4, 5].map((index) => <InputOTPSlot key={index} index={index} aria-invalid={invalid} />)}</InputOTPGroup>
      </InputOTP>
      <p id={`${id}-help`} className={invalid ? "text-sm text-[var(--color-warn)]" : "text-sm text-[var(--color-text-3)]"}>
        {invalid ? "This code has expired. Request a new code." : alphanumeric ? "Enter the six letters or numbers from your email." : "Enter the six digits from your email. You can paste the full code."}
      </p>
      <p role="status" className="text-sm text-[var(--color-text-3)]">{value.length === 6 && !invalid ? "Code complete. Ready to verify." : ""}</p>
    </div>
  )
}

const meta = {
  title: "UI/Input OTP",
  component: InputOTP,
  args: { maxLength: 6, children: null },
  tags: ["autodocs"],
  parameters: { renderer: "react", layout: "centered" },
} satisfies Meta<typeof InputOTP>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { render: () => <CodeInput /> }
export const Disabled: Story = { render: () => <CodeInput disabled /> }
export const Invalid: Story = { render: () => <CodeInput invalid /> }
export const Alphanumeric: Story = { render: () => <CodeInput alphanumeric /> }
export const FourDigits: Story = {
  render: () => <InputOTP aria-label="Four digit PIN" maxLength={4} pattern={REGEXP_ONLY_DIGITS}><InputOTPGroup>{[0, 1, 2, 3].map((index) => <InputOTPSlot key={index} index={index} />)}</InputOTPGroup></InputOTP>,
}
