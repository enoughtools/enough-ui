import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "./button.js"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "./item.js"

const meta = {
  title: "UI/Item",
  component: Item,
  parameters: {
    renderer: 'react',
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    variant: "default",
    size: "default",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "accent", "plain"],
    },
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
    },
  },
} satisfies Meta<typeof Item>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Item {...args} className="w-[min(28rem,calc(100vw-2rem))]">
      <ItemMedia aria-hidden="true">◆</ItemMedia>
      <ItemContent>
        <ItemTitle>Quarterly review</ItemTitle>
        <ItemDescription>
          The report is ready for your final approval.
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="outline" size="sm">
          Open
        </Button>
      </ItemActions>
    </Item>
  ),
}

export const AsLink: Story = {
  render: () => (
    <Item
      asChild
      className="w-[min(28rem,calc(100vw-2rem))] cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[var(--shadow-palette)]"
    >
      <a href="#item-link-example">
        <ItemContent>
          <ItemTitle>Read the release notes</ItemTitle>
          <ItemDescription>
            Review every change included in version 2.4.
          </ItemDescription>
        </ItemContent>
      </a>
    </Item>
  ),
}

export const Variants: Story = {
  render: () => (
    <ItemGroup className="w-[min(30rem,calc(100vw-2rem))]">
      <Item variant="default">
        <ItemMedia aria-hidden="true">1</ItemMedia>
        <ItemContent>
          <ItemTitle>Default item</ItemTitle>
          <ItemDescription>Surface fill with a compact card shadow.</ItemDescription>
        </ItemContent>
      </Item>
      <Item variant="accent">
        <ItemMedia aria-hidden="true">2</ItemMedia>
        <ItemContent>
          <ItemTitle>Accent item</ItemTitle>
          <ItemDescription>
            Accent wash with a deliberate offset shadow.
          </ItemDescription>
        </ItemContent>
      </Item>
      <Item variant="plain">
        <ItemMedia variant="sm" aria-hidden="true">
          3
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Plain item</ItemTitle>
          <ItemDescription>Structural border without elevation.</ItemDescription>
        </ItemContent>
      </Item>
    </ItemGroup>
  ),
}

export const RichContent: Story = {
  render: () => (
    <Item className="w-[min(32rem,calc(100vw-2rem))] items-start" size="lg">
      <ItemMedia variant="lg" aria-hidden="true">
        ◎
      </ItemMedia>
      <ItemContent>
        <ItemHeader>
          <div>
            <ItemTitle className="text-base">Design system audit</ItemTitle>
            <ItemDescription className="mt-1">
              Twelve components need a visual review before Friday.
            </ItemDescription>
          </div>
          <span className="shrink-0 border border-[var(--color-ink)] bg-[var(--color-ink)] px-2 py-1 text-xs font-bold text-[var(--color-surface)]">
            ACTIVE
          </span>
        </ItemHeader>
        <ItemSeparator className="my-2" />
        <ItemFooter className="mt-0 border-0 p-0">
          <span className="font-sans text-xs text-[var(--color-text-3)]">
            Updated 8 min ago
          </span>
          <ItemActions>
            <Button variant="ghost" size="ghost">
              Details
            </Button>
          </ItemActions>
        </ItemFooter>
      </ItemContent>
    </Item>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Item
      data-disabled="true"
      aria-disabled="true"
      className="w-[min(28rem,calc(100vw-2rem))]"
    >
      <ItemMedia aria-hidden="true">×</ItemMedia>
      <ItemContent>
        <ItemTitle>Unavailable item</ItemTitle>
        <ItemDescription>This action is not available right now.</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="outline" size="sm" disabled>
          Open
        </Button>
      </ItemActions>
    </Item>
  ),
}
