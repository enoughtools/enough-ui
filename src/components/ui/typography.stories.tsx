import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  Typography,
  TypographyBlockquote,
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyInlineCode,
  TypographyLarge,
  TypographyLead,
  TypographyList,
  TypographyMuted,
  TypographyP,
  TypographySmall,
} from "./typography.js"

const meta = {
  title: "UI/Typography",
  component: Typography,
  tags: ["autodocs"],
  parameters: {
    renderer: 'react',
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-[min(720px,calc(100vw-40px))]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: "select",
      options: ["h1", "h2", "h3", "h4", "p", "lead", "large", "small", "muted"],
    },
    align: {
      control: "inline-radio",
      options: ["left", "center", "right"],
    },
    asChild: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Typography>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    variant: "p",
    align: "left",
    children:
      "Typography gives language a clear hierarchy while keeping every line grounded in the system.",
  },
}

export const Scale: Story = {
  render: () => (
    <div className="space-y-8 rounded-none border border-[var(--color-ink)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-palette)]">
      <div className="space-y-3">
        <TypographySmall className="font-sans uppercase tracking-[0.14em] text-[var(--color-accent)]">
          Typography scale
        </TypographySmall>
        <TypographyH1>Designed for decisive reading.</TypographyH1>
        <TypographyLead>
          A compact type system that pairs editorial warmth with structural clarity.
        </TypographyLead>
      </div>

      <div className="space-y-6">
        <TypographyH2>Principles</TypographyH2>
        <TypographyH3>Hierarchy carries meaning</TypographyH3>
        <TypographyP>
          Headings establish pace, body copy supports long-form reading, and supporting
          styles stay quiet without disappearing.
        </TypographyP>
        <TypographyH4>Every detail is intentional</TypographyH4>
        <TypographyP>
          Serif display faces create contrast while the sans-serif body remains direct
          and useful.
        </TypographyP>
      </div>

      <div className="space-y-3">
        <TypographyLarge>Large supporting text</TypographyLarge>
        <TypographySmall>Small but emphatic text</TypographySmall>
        <TypographyMuted>Muted metadata · Updated 09 September 2026</TypographyMuted>
      </div>
    </div>
  ),
}

export const Article: Story = {
  render: () => (
    <article className="rounded-none border border-[var(--color-ink)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-card)] sm:p-10">
      <header className="mb-10 space-y-4 border-b border-[var(--color-ink)] pb-8">
        <TypographySmall className="font-sans uppercase tracking-[0.14em] text-[var(--color-accent)]">
          Field notes · 006
        </TypographySmall>
        <TypographyH1>Structure before decoration</TypographyH1>
        <TypographyLead>
          A visual system becomes memorable when its rules are useful, visible, and
          consistently applied.
        </TypographyLead>
      </header>

      <TypographyH2>Build the reading path</TypographyH2>
      <TypographyP>
        Start with the order in which information should be understood. Typography is
        not a finishing layer; it is the interface readers use to navigate an idea.
      </TypographyP>
      <TypographyP>
        Use <TypographyInlineCode>TypographyLead</TypographyInlineCode> to frame the
        premise, then let body text carry the detail without competing for attention.
      </TypographyP>

      <TypographyBlockquote>
        Strong hierarchy makes the next action feel inevitable rather than merely
        available.
      </TypographyBlockquote>

      <TypographyH3>Keep the rules visible</TypographyH3>
      <TypographyList>
        <li>Use serif type for editorial emphasis.</li>
        <li>Use structural ink borders to define meaningful regions.</li>
        <li>Reserve the accent color for signals and active emphasis.</li>
      </TypographyList>

      <TypographyMuted>
        Written for teams building durable product interfaces.
      </TypographyMuted>
    </article>
  ),
}

export const Polymorphic: Story = {
  render: () => (
    <div className="rounded-none border border-[var(--color-ink)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]">
      <Typography asChild variant="h3">
        <h2>Radix Slot composition</h2>
      </Typography>
      <Typography className="mt-3">
        Set <TypographyInlineCode>asChild</TypographyInlineCode> to preserve the semantic
        element while applying a typography variant.
      </Typography>
    </div>
  ),
}
