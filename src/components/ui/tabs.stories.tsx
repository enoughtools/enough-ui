import type { Meta, StoryObj } from "@storybook/react-vite"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs.js"
import { expect, userEvent, waitFor, within } from "storybook/test"

const meta = {
  title: "UI/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    renderer: 'react',
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-[min(620px,calc(100vw-40px))]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview">
      <TabsList aria-label="Project sections">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <div className="space-y-[8px]">
          <h3 className="font-sans text-[18px] font-bold text-[var(--color-text-main)]">
            Project overview
          </h3>
          <p className="leading-6">
            Track the current direction, key decisions, and upcoming milestones in
            one focused view.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="activity">
        <div className="space-y-[8px]">
          <h3 className="font-sans text-[18px] font-bold text-[var(--color-text-main)]">
            Recent activity
          </h3>
          <p className="leading-6">
            Twelve updates were published this week across design, engineering,
            and research.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="settings">
        <div className="space-y-[8px]">
          <h3 className="font-sans text-[18px] font-bold text-[var(--color-text-main)]">
            Project settings
          </h3>
          <p className="leading-6">
            Configure visibility, notifications, and team permissions for this
            project.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  ),
}

export const WithDisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="published">
      <TabsList aria-label="Document status">
        <TabsTrigger value="published">Published</TabsTrigger>
        <TabsTrigger value="drafts">Drafts</TabsTrigger>
        <TabsTrigger value="archive" disabled>
          Archive
        </TabsTrigger>
      </TabsList>
      <TabsContent value="published">
        Published documents are visible to everyone with access to the workspace.
      </TabsContent>
      <TabsContent value="drafts">
        Draft documents remain private until they are ready to share.
      </TabsContent>
      <TabsContent value="archive">
        Archived documents are retained for historical reference.
      </TabsContent>
    </Tabs>
  ),
}

export const FullWidth: Story = {
  render: () => (
    <Tabs defaultValue="details">
      <TabsList className="grid w-full grid-cols-3" aria-label="Profile sections">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>
      <TabsContent value="details">
        Review the profile details and primary workspace information.
      </TabsContent>
      <TabsContent value="team">
        Manage collaborators and assign their workspace responsibilities.
      </TabsContent>
      <TabsContent value="history">
        Browse previous revisions and restore an earlier version when needed.
      </TabsContent>
    </Tabs>
  ),
}

export const Line: Story = {
  render: () => (
    <Tabs defaultValue="overview">
      <TabsList variant="line" aria-label="Workspace sections">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Three projects are ready for review.</TabsContent>
      <TabsContent value="activity">Your workspace is up to date.</TabsContent>
    </Tabs>
  ),
}

export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="account" orientation="vertical">
      <TabsList variant="line" aria-label="Settings sections">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="billing" disabled>Billing</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Manage your profile and workspace access.</TabsContent>
      <TabsContent value="notifications">Choose which updates you receive.</TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    canvas.getByRole("tab", { name: "Account" }).focus()
    await userEvent.keyboard("{ArrowDown}")
    await waitFor(() => expect(canvas.getByRole("tab", { name: "Notifications" })).toHaveAttribute("aria-selected", "true"))
    await expect(canvas.getByRole("tab", { name: "Notifications" })).toHaveFocus()
  },
}
