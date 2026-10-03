import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DirectionProvider, useDirection } from "./direction.js";

function DirectionContextDisplay() {
  const direction = useDirection();
  return (
    <div className="flex items-center gap-2 border border-[var(--color-ink)] bg-[var(--color-paper)] px-3 py-2 font-sans text-xs">
      <span className="text-[var(--color-text-3)]">Context direction:</span>
      <span className="font-semibold uppercase text-[var(--color-accent)]">
        {direction}
      </span>
    </div>
  );
}

const meta = {
  title: "UI/Direction",
  component: DirectionProvider,
  parameters: {
    renderer: "react",
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    direction: {
      control: "select",
      options: ["ltr", "rtl"],
      description: "Text and layout direction",
    },
  },
} satisfies Meta<typeof DirectionProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LeftToRight: Story = {
  args: {
    direction: "ltr",
  },
  render: (args) => (
    <div
      dir="ltr"
      className="w-full max-w-[420px] space-y-4 rounded-none border border-[var(--color-ink)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]"
    >
      <DirectionProvider {...args}>
        <div className="space-y-3 font-sans">
          <DirectionContextDisplay />
          <h3 className="text-base font-semibold text-[var(--color-ink)]">
            Left to Right (LTR)
          </h3>
          <p className="text-sm leading-relaxed text-[var(--color-text-2)]">
            This paragraph demonstrates standard English typography and text
            flow. The container explicitly sets DOM <code className="bg-[var(--color-paper)] px-1 font-sans">dir=&quot;ltr&quot;</code> to align text to the start.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="border border-[var(--color-ink)] bg-[var(--color-ink)] px-3 py-1.5 font-sans text-xs font-semibold text-[var(--color-dark-text)]"
            >
              Primary action
            </button>
            <button
              type="button"
              className="border border-[var(--color-ink)] bg-[var(--color-surface)] px-3 py-1.5 font-sans text-xs font-semibold text-[var(--color-text-2)]"
            >
              Cancel
            </button>
          </div>
        </div>
      </DirectionProvider>
    </div>
  ),
};

export const RightToLeft: Story = {
  args: {
    direction: "rtl",
  },
  render: (args) => (
    <div
      dir="rtl"
      className="w-full max-w-[420px] space-y-4 rounded-none border border-[var(--color-ink)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]"
    >
      <DirectionProvider {...args}>
        <div className="space-y-3 font-sans">
          <DirectionContextDisplay />
          <h3 className="text-base font-semibold text-[var(--color-ink)]">
            من اليمين إلى اليسار (RTL)
          </h3>
          <p className="text-sm leading-relaxed text-[var(--color-text-2)]">
            هذا النص يوضح تخطيط واتجاه القراءة من اليمين إلى اليسار باللغة العربية. يتم تعيين السمة <code className="bg-[var(--color-paper)] px-1 font-sans">dir=&quot;rtl&quot;</code> على العنصر الحاوي لتوجيه التدفق الطباعي.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="border border-[var(--color-ink)] bg-[var(--color-ink)] px-3 py-1.5 font-sans text-xs font-semibold text-[var(--color-dark-text)]"
            >
              إجراء رئيسي
            </button>
            <button
              type="button"
              className="border border-[var(--color-ink)] bg-[var(--color-surface)] px-3 py-1.5 font-sans text-xs font-semibold text-[var(--color-text-2)]"
            >
              إلغاء
            </button>
          </div>
        </div>
      </DirectionProvider>
    </div>
  ),
};
