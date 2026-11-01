import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sources, InlineCitation } from "./sources.js";
const references = [
  {
    id: "upstream",
    title: "shadcn Trace",
    href: "https://ui.shadcn.com/docs/components/radix/trace",
    description: "The upstream public interface and examples.",
  },
  {
    id: "local",
    title: "EnoughUI parity",
    href: "#parity",
    description: "Our supported renderer contract.",
  },
];
const meta = {
  title: "AI/Sources",
  component: Sources,
  parameters: { layout: "centered", renderer: "react" },
  decorators: [
    (Story) => (
      <div className="w-[min(40rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof Sources>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ReferenceList: Story = { args: { sources: references } };
export const Inline: Story = {
  args: { sources: references },
  render: () => (
    <p>
      Trace represents an agent’s activity.
      <InlineCitation source={references[0]} index={1} />
    </p>
  ),
};
