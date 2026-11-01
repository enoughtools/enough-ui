import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button.js";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "./dropdown-menu.js";
import { ChevronDownIcon } from "lucide-react";
import { PromptComposer } from "./prompt-composer.js";
const meta = {
  title: "AI/Prompt Composer",
  component: PromptComposer,
  parameters: { layout: "centered", renderer: "react" },
  decorators: [
    (Story) => (
      <div className="w-[min(42rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  args: { value: "", onValueChange: () => {}, onSend: () => {} },
} satisfies Meta<typeof PromptComposer>;
export default meta;
type Story = StoryObj<typeof meta>;
function ComposerDemo({
  fail = false,
  attachment = false,
  empty = false,
  expanded = false,
}: {
  fail?: boolean;
  attachment?: boolean;
  empty?: boolean;
  expanded?: boolean;
}) {
  const [value, setValue] = React.useState(
    empty
      ? ""
      : expanded
        ? "Help me plan the launch.\n\nStart with the audience and the key milestones. Then put together a release schedule with clear owners for each step.\n\nKeep the plan focused enough to share with the team."
        : "Help me plan the launch.",
  );
  const [files, setFiles] = React.useState<File[]>(
    attachment
      ? [
          new File([new ArrayBuffer(12400)], "launch-brief.pdf", {
            type: "application/pdf",
            lastModified: 0,
          }),
        ]
      : [],
  );
  const [mode, setMode] = React.useState("Plan");
  const [busy, setBusy] = React.useState(false);
  return (
    <PromptComposer
      tools={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-[var(--color-text-3)]"
              aria-label={`Message mode: ${mode}`}
            >
              {mode}
              <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuRadioGroup value={mode} onValueChange={setMode}>
              {["Plan", "Write", "Review"].map((option) => (
                <DropdownMenuRadioItem key={option} value={option}>
                  {option}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      }
      value={value}
      onValueChange={setValue}
      files={files}
      onFilesChange={setFiles}
      busy={busy}
      onStop={() => setBusy(false)}
      onSend={async () => {
        if (fail) throw new Error("Connection lost. Your draft is preserved.");
        setBusy(true);
        setValue("");
        setFiles([]);
      }}
    />
  );
}
export const Controlled: Story = { render: () => <ComposerDemo /> };
export const Failure: Story = { render: () => <ComposerDemo fail /> };

export const WithAttachment: Story = {
  render: () => <ComposerDemo attachment />,
};
export const Empty: Story = { render: () => <ComposerDemo empty /> };

export const Expanded: Story = { render: () => <ComposerDemo expanded /> };
