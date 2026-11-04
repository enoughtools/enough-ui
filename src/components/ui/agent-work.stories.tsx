import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AgentWork, type AgentStep } from "./agent-work.js";
import { Button } from "./button.js";
const meta = {
  title: "AI/Agent Work",
  component: AgentWork,
  parameters: { layout: "centered", renderer: "react" },
  decorators: [
    (Story) => (
      <div className="w-[min(40rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof AgentWork>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Plan: Story = {
  args: {
    steps: [
      {
        id: "read",
        title: "Reviewed the launch brief",
        description: "2 sources",
        status: "completed",
      },
      {
        id: "draft",
        title: "Preparing your launch plan",
        status: "running",
        steps: [
          {
            id: "audience",
            title: "Defined the audience",
            status: "completed",
          },
          {
            id: "schedule",
            title: "Building the release schedule",
            status: "running",
          },
          {
            id: "owners",
            title: "Assign owners and milestones",
            status: "pending",
          },
        ],
      },
      { id: "review", title: "Check the details", status: "pending" },
      { id: "share", title: "Ready for your review", status: "pending" },
    ],
  },
};
export const Queue: Story = {
  args: {
    steps: [
      { id: "done", title: "Updated tokens", status: "completed" },
      { id: "next", title: "Verify native markup", status: "pending" },
    ],
  },
};
export const Tool: Story = {
  args: {
    steps: [
      {
        id: "tool",
        title: "Read package.json",
        status: "completed",
        output: '{"name":"enough-ui"}',
      },
    ],
  },
};
export const Terminal: Story = {
  args: {
    steps: [
      {
        id: "cmd",
        title: "Ran pnpm build",
        status: "completed",
        output: "Built React and native Astro packages.",
      },
    ],
  },
};
export const TestResults: Story = {
  args: {
    steps: [
      {
        id: "tests",
        title: "Tests passed",
        description: "3 suites",
        status: "completed",
        steps: [
          { id: "react", title: "React interactions", status: "completed" },
          { id: "astro", title: "Native Astro rendering", status: "completed" },
          {
            id: "types",
            title: "Public interface fixtures",
            status: "completed",
          },
        ],
      },
    ],
  },
};
export const Subagent: Story = {
  args: {
    steps: [
      {
        id: "agent",
        title: "Research agent",
        status: "running",
        steps: [
          { id: "search", title: "Read upstream source", status: "completed" },
          { id: "compare", title: "Comparing public props", status: "running" },
        ],
      },
    ],
  },
};
function StreamingDemo() {
  const [step, setStep] = React.useState<AgentStep>({
    id: "stable-tool",
    title: "Reading output",
    status: "running",
    output: "first chunk",
  });
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() =>
            setStep({ ...step, output: step.output + "\nnext chunk" })
          }
        >
          Append chunk
        </Button>
        <Button
          onClick={() =>
            setStep({ ...step, status: "cancelled", title: "Read output" })
          }
        >
          Cancel run
        </Button>
        <Button
          onClick={() =>
            setStep({ ...step, status: "error", title: "Read output" })
          }
        >
          Fail run
        </Button>
      </div>
      <AgentWork
        steps={[step]}
        onRetry={() =>
          setStep({ ...step, status: "running", title: "Reading output" })
        }
      />
    </div>
  );
}
export const Streaming: Story = {
  render: () => <StreamingDemo />,
  args: { steps: [] },
};
