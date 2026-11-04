import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AgentConfirmation } from "./agent-confirmation.js";
const meta = {
  title: "AI/Agent Confirmation",
  component: AgentConfirmation,
  parameters: { layout: "centered", renderer: "react" },
  decorators: [
    (Story) => (
      <div className="w-[min(40rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  args: {
    request: {
      id: "build",
      title: "Run the build?",
      description: "Runs pnpm build in this project.",
    },
    onDecision: async () => {},
  },
} satisfies Meta<typeof AgentConfirmation>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Pending: Story = {};
export const Approved: Story = { args: { resolution: "approved" } };
export const Denied: Story = { args: { resolution: "denied" } };
export const Expired: Story = { args: { resolution: "expired" } };
export const Cancelled: Story = { args: { resolution: "cancelled" } };
export const FailedSubmission: Story = {
  args: {
    onDecision: async () => {
      throw new Error("Connection lost. Please try again.");
    },
  },
};
