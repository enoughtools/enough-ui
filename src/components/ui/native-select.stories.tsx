import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "./native-select.js";

const meta = {
  title: "UI/Native Select",
  component: NativeSelect,
  tags: ["autodocs"],
  parameters: {
    renderer: "react",
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-[360px] max-w-full p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NativeSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5 font-sans">
      <label
        htmlFor="framework-select"
        className="font-sans text-sm font-semibold text-[var(--color-ink)]"
      >
        Framework
      </label>
      <NativeSelect id="framework-select" name="framework" defaultValue="astro">
        <NativeSelectOption value="astro">Astro</NativeSelectOption>
        <NativeSelectOption value="next">Next.js</NativeSelectOption>
        <NativeSelectOption value="remix">Remix</NativeSelectOption>
        <NativeSelectOption value="sveltekit">SvelteKit</NativeSelectOption>
        <NativeSelectOption value="nuxt">Nuxt</NativeSelectOption>
      </NativeSelect>
    </div>
  ),
};

export const Optgroups: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5 font-sans">
      <label
        htmlFor="timezone-select"
        className="font-sans text-sm font-semibold text-[var(--color-ink)]"
      >
        Timezone
      </label>
      <NativeSelect id="timezone-select" name="timezone" defaultValue="pst">
        <NativeSelectOptGroup label="North America">
          <NativeSelectOption value="est">Eastern Time (ET)</NativeSelectOption>
          <NativeSelectOption value="cst">Central Time (CT)</NativeSelectOption>
          <NativeSelectOption value="mst">Mountain Time (MT)</NativeSelectOption>
          <NativeSelectOption value="pst">Pacific Time (PT)</NativeSelectOption>
        </NativeSelectOptGroup>
        <NativeSelectOptGroup label="Europe">
          <NativeSelectOption value="gmt">Greenwich Mean Time (GMT)</NativeSelectOption>
          <NativeSelectOption value="cet">Central European Time (CET)</NativeSelectOption>
          <NativeSelectOption value="eet">Eastern European Time (EET)</NativeSelectOption>
        </NativeSelectOptGroup>
        <NativeSelectOptGroup label="Asia / Pacific">
          <NativeSelectOption value="jst">Japan Standard Time (JST)</NativeSelectOption>
          <NativeSelectOption value="aest">Australian Eastern Time (AEST)</NativeSelectOption>
        </NativeSelectOptGroup>
      </NativeSelect>
    </div>
  ),
};

export const Small: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5 font-sans">
      <label
        htmlFor="density-select"
        className="font-sans text-sm font-semibold text-[var(--color-ink)]"
      >
        Display Density
      </label>
      <NativeSelect
        id="density-select"
        name="density"
        size="sm"
        defaultValue="compact"
      >
        <NativeSelectOption value="comfortable">Comfortable</NativeSelectOption>
        <NativeSelectOption value="compact">Compact</NativeSelectOption>
        <NativeSelectOption value="dense">Dense</NativeSelectOption>
      </NativeSelect>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5 font-sans">
      <label
        htmlFor="disabled-select"
        className="font-sans text-sm font-semibold text-[var(--color-ink)] opacity-50"
      >
        Subscription Plan (Locked)
      </label>
      <NativeSelect
        id="disabled-select"
        name="plan"
        disabled
        defaultValue="enterprise"
      >
        <NativeSelectOption value="starter">Starter</NativeSelectOption>
        <NativeSelectOption value="pro">Pro</NativeSelectOption>
        <NativeSelectOption value="enterprise">Enterprise</NativeSelectOption>
      </NativeSelect>
    </div>
  ),
};

export const Invalid: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5 font-sans">
      <label
        htmlFor="invalid-select"
        className="font-sans text-sm font-semibold text-[var(--color-ink)]"
      >
        Country of Residence
      </label>
      <NativeSelect
        id="invalid-select"
        name="country"
        aria-invalid="true"
        required
        defaultValue=""
      >
        <NativeSelectOption value="">Choose a country…</NativeSelectOption>
        <NativeSelectOption value="us">United States</NativeSelectOption>
        <NativeSelectOption value="ca">Canada</NativeSelectOption>
        <NativeSelectOption value="mx">Mexico</NativeSelectOption>
      </NativeSelect>
      <p className="font-sans text-xs text-[var(--color-warn)]">
        Please select a valid country to continue.
      </p>
    </div>
  ),
};

export const MultipleListBox: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5 font-sans">
      <label
        htmlFor="roles-select"
        className="font-sans text-sm font-semibold text-[var(--color-ink)]"
      >
        Assigned Roles
      </label>
      <NativeSelect
        id="roles-select"
        name="roles"
        multiple
        size={5}
        defaultValue={["editor", "reviewer"]}
      >
        <NativeSelectOption value="admin">Administrator</NativeSelectOption>
        <NativeSelectOption value="editor">Editor</NativeSelectOption>
        <NativeSelectOption value="reviewer">Reviewer</NativeSelectOption>
        <NativeSelectOption value="author">Author</NativeSelectOption>
        <NativeSelectOption value="contributor">Contributor</NativeSelectOption>
        <NativeSelectOption value="viewer">Viewer</NativeSelectOption>
      </NativeSelect>
      <span className="font-sans text-xs text-[var(--color-text-3)]">
        Hold Cmd / Ctrl to select multiple options
      </span>
    </div>
  ),
};
