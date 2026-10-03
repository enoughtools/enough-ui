import type { Meta, StoryObj } from "@storybook/react-vite"

import { Checkbox } from "./checkbox.js"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "./field.js"
import { Input } from "./input.js"
import { RadioGroup, RadioGroupItem } from "./radio-group.js"
import { Textarea } from "./textarea.js"

const meta = {
  title: "UI/Field",
  component: Field,
  tags: ["autodocs"],
  parameters: {
    renderer: 'react',
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-[min(34rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Field>
      <FieldLabel htmlFor="field-name">Project name</FieldLabel>
      <Input id="field-name" placeholder="Signal archive" />
      <FieldDescription>
        A concise name used throughout the workspace.
      </FieldDescription>
    </Field>
  ),
}

export const Horizontal: Story = {
  render: () => (
    <Field orientation="horizontal">
      <FieldContent className="max-w-48">
        <FieldLabel htmlFor="field-handle">Public handle</FieldLabel>
        <FieldDescription>
          This appears in links shared outside your team.
        </FieldDescription>
      </FieldContent>
      <Input id="field-handle" defaultValue="signal-archive" />
    </Field>
  ),
}

export const Invalid: Story = {
  render: () => (
    <Field data-invalid="true">
      <FieldLabel htmlFor="field-email">Email address</FieldLabel>
      <Input
        id="field-email"
        type="email"
        defaultValue="not-an-email"
        aria-invalid="true"
        aria-describedby="field-email-error"
      />
      <FieldError id="field-email-error">
        Enter a valid email address.
      </FieldError>
    </Field>
  ),
}

export const TextArea: Story = {
  render: () => (
    <Field>
      <FieldLabel htmlFor="field-brief">Project brief</FieldLabel>
      <Textarea
        id="field-brief"
        placeholder="Describe the problem, audience, and intended outcome."
        className="min-h-28"
      />
      <FieldDescription>Maximum 500 characters.</FieldDescription>
    </Field>
  ),
}

export const ChoiceGroup: Story = {
  render: () => (
    <FieldSet>
      <FieldLegend>Notification cadence</FieldLegend>
      <FieldDescription>
        Choose how often the system sends a project digest.
      </FieldDescription>
      <RadioGroup defaultValue="daily">
        {[
          ["realtime", "Real time", "Send an update after every change."],
          ["daily", "Daily digest", "Combine activity into one daily report."],
          ["weekly", "Weekly digest", "Receive one summary each Monday."],
        ].map(([value, title, description]) => (
          <Field key={value} orientation="horizontal">
            <RadioGroupItem value={value} id={`cadence-${value}`} />
            <FieldContent>
              <FieldLabel htmlFor={`cadence-${value}`}>{title}</FieldLabel>
              <FieldDescription>{description}</FieldDescription>
            </FieldContent>
          </Field>
        ))}
      </RadioGroup>
    </FieldSet>
  ),
}

export const SettingsGroup: Story = {
  render: () => (
    <FieldGroup>
      <Field>
        <FieldTitle>Workspace defaults</FieldTitle>
        <FieldDescription>
          These settings apply to all newly created projects.
        </FieldDescription>
      </Field>
      <FieldSeparator>Access</FieldSeparator>
      <Field orientation="horizontal">
        <Checkbox id="field-discoverable" defaultChecked />
        <FieldContent>
          <FieldLabel htmlFor="field-discoverable">
            Make projects discoverable
          </FieldLabel>
          <FieldDescription>
            Team members can find projects through workspace search.
          </FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal" data-disabled="true">
        <Checkbox id="field-guests" disabled />
        <FieldContent>
          <FieldLabel htmlFor="field-guests">Allow guest access</FieldLabel>
          <FieldDescription>
            Guest access is unavailable on the current plan.
          </FieldDescription>
        </FieldContent>
      </Field>
    </FieldGroup>
  ),
}

export const MultipleErrors: Story = {
  render: () => (
    <Field data-invalid="true">
      <FieldLabel htmlFor="field-password">Password</FieldLabel>
      <Input
        id="field-password"
        type="password"
        defaultValue="short"
        aria-invalid="true"
        aria-describedby="field-password-errors"
      />
      <FieldError
        id="field-password-errors"
        errors={[
          { message: "Use at least 12 characters." },
          { message: "Include one number." },
          { message: "Include one number." },
          { message: "Include one symbol." },
        ]}
      />
    </Field>
  ),
}

export const ChoiceCard: Story = {
  render: () => (
    <FieldGroup>
      <FieldLabel htmlFor="field-choice-archive">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle id="field-choice-title">Archive completed projects</FieldTitle>
            <FieldDescription>Keep your workspace focused while retaining your project history.</FieldDescription>
          </FieldContent>
          <Checkbox id="field-choice-archive" defaultChecked aria-labelledby="field-choice-title" aria-describedby="field-choice-description" />
        </Field>
      </FieldLabel>
      <p id="field-choice-description" className="text-sm text-[var(--color-text-3)]">Select the card or checkbox to update this preference.</p>
    </FieldGroup>
  ),
}
