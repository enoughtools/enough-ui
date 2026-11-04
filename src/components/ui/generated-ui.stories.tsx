import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./card.js";
import { Button } from "./button.js";
import { Input } from "./input.js";
import { Label } from "./label.js";
const meta = {
  title: "AI/Generated UI",
  parameters: { layout: "centered", renderer: "react" },
  tags: ["autodocs"],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
function ProgressiveDemo({
  invalid = false,
  empty = false,
}: {
  invalid?: boolean;
  empty?: boolean;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const [notes, setNotes] = React.useState("");
  const [receipt, setReceipt] = React.useState("");
  return (
    <div className="w-[min(40rem,calc(100vw-2rem))] space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Launch review</CardTitle>
          <CardDescription>
            A shared place to prepare your next release.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invalid ? (
            <p role="alert">
              This update could not be displayed. Your current work is
              preserved.
            </p>
          ) : empty ? (
            <p className="text-sm text-[var(--color-text-3)]">
              Waiting for the first update…
            </p>
          ) : (
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                setReceipt(`Submitted: ${notes}`);
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="review-notes">Review notes</Label>
                <Input
                  id="review-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="What should we look at?"
                />
              </div>
              {expanded && (
                <div className="rounded-lg border border-[var(--color-border-mid)] p-4">
                  <p className="text-sm font-medium">Ready for review</p>
                  <p className="mt-1 text-sm text-[var(--color-text-3)]">
                    Release notes, final checks and rollout are now included.
                  </p>
                </div>
              )}
              <Button type="submit">Submit notes</Button>
              {receipt && (
                <p role="status" className="text-sm">
                  {receipt}
                </p>
              )}
            </form>
          )}
        </CardContent>
      </Card>
      {!invalid && !empty && (
        <Button
          variant="outline"
          size="sm"
          disabled={expanded}
          onClick={() => setExpanded(true)}
        >
          Append UI chunk
        </Button>
      )}
    </div>
  );
}
export const Progressive: Story = { render: () => <ProgressiveDemo /> };
export const Invalid: Story = { render: () => <ProgressiveDemo invalid /> };
export const Empty: Story = { render: () => <ProgressiveDemo empty /> };
