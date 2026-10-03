import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter,
  SidebarGroup, SidebarGroupLabel, SidebarGroupAction, SidebarGroupContent,
  SidebarInput, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarMenuAction, SidebarMenuBadge, SidebarMenuSkeleton, SidebarMenuSub,
  SidebarMenuSubItem, SidebarMenuSubButton, SidebarRail, SidebarSeparator, SidebarTrigger,
} from "./sidebar.js"

const meta = {
  title: "UI/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: { renderer: "react", layout: "fullscreen" },
} satisfies Meta<typeof Sidebar>
export default meta
type Story = StoryObj<typeof meta>

function Icon({ kind }: { kind: "home" | "folder" | "inbox" | "help" }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    {kind === "home" ? <path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z" /> :
      kind === "folder" ? <path d="M3 6h7l2 3h9v12H3Z" /> :
      kind === "inbox" ? <><path d="m3 14 3-9h12l3 9v6H3Z" /><path d="M3 14h5l2 3h4l2-3h5" /></> :
      <><circle cx="12" cy="12" r="9" /><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4m0 3v1" /></>}
  </svg>
}

function WorkspaceSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return <Sidebar collapsible="icon" {...props}>
    <SidebarHeader>
      <SidebarMenu><SidebarMenuItem><SidebarMenuButton size="lg" tooltip="Enough Workspace">
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M3 3h18v4H7v3h10v4H7v3h14v4H3Z" /></svg>
        <span>Enough Workspace</span>
      </SidebarMenuButton></SidebarMenuItem></SidebarMenu>
      <SidebarInput aria-label="Search workspace" placeholder="Search workspace…" className="group-data-[collapsible=icon]:hidden" />
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Workspace</SidebarGroupLabel>
        <SidebarGroupAction aria-label="Create project">+</SidebarGroupAction>
        <SidebarGroupContent><SidebarMenu>
          <SidebarMenuItem><SidebarMenuButton asChild isActive tooltip="Overview"><a href="#overview" aria-current="page"><Icon kind="home" /><span>Overview</span></a></SidebarMenuButton></SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Projects"><a href="#projects"><Icon kind="folder" /><span>Projects</span></a></SidebarMenuButton>
            <SidebarMenuAction showOnHover aria-label="Project options">⋯</SidebarMenuAction>
            <SidebarMenuSub>
              <SidebarMenuSubItem><SidebarMenuSubButton href="#design">Design system</SidebarMenuSubButton></SidebarMenuSubItem>
              <SidebarMenuSubItem><SidebarMenuSubButton href="#website">Website</SidebarMenuSubButton></SidebarMenuSubItem>
            </SidebarMenuSub>
          </SidebarMenuItem>
          <SidebarMenuItem><SidebarMenuButton asChild tooltip="Inbox"><a href="#inbox"><Icon kind="inbox" /><span>Inbox</span></a></SidebarMenuButton><SidebarMenuBadge>4</SidebarMenuBadge></SidebarMenuItem>
        </SidebarMenu></SidebarGroupContent>
      </SidebarGroup>
      <SidebarSeparator />
      <SidebarGroup><SidebarGroupLabel>Loading recent projects</SidebarGroupLabel><SidebarMenu>
        <SidebarMenuItem><SidebarMenuSkeleton showIcon /></SidebarMenuItem>
        <SidebarMenuItem><SidebarMenuSkeleton showIcon /></SidebarMenuItem>
      </SidebarMenu></SidebarGroup>
    </SidebarContent>
    <SidebarFooter><SidebarMenu><SidebarMenuItem><SidebarMenuButton asChild tooltip="Help"><a href="#help"><Icon kind="help" /><span>Help and support</span></a></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarFooter>
    <SidebarRail />
  </Sidebar>
}

function Workspace(props: React.ComponentProps<typeof SidebarProvider> & { variant?: "sidebar" | "floating" | "inset"; side?: "left" | "right"; collapsible?: "offcanvas" | "icon" | "none" }) {
  const { variant = "sidebar", side = "left", collapsible = "icon", ...provider } = props
  return <SidebarProvider persistState={false} {...provider}>
    {side === "left" && <WorkspaceSidebar variant={variant} side={side} collapsible={collapsible} />}
    <SidebarInset>
      <header className="flex h-16 items-center gap-3 border-b border-[var(--color-ink)] px-4"><SidebarTrigger /><span className="text-sm font-semibold">Workspace / Overview</span></header>
      <div id="overview" className="p-6 sm:p-8"><h1 className="text-2xl font-semibold">Overview</h1><p className="mt-3 max-w-xl text-sm leading-relaxed">Toggle the sidebar or use ⌘B / Ctrl+B. On a small screen, navigation opens in an accessible panel.</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="min-h-40 border border-[var(--color-ink)] p-5 shadow-[var(--shadow-card)]">Your workspace at a glance</div><div className="min-h-40 border border-[var(--color-ink)] p-5 shadow-[var(--shadow-card)]">Recent activity</div></div></div>
    </SidebarInset>
    {side === "right" && <WorkspaceSidebar variant={variant} side={side} collapsible={collapsible} />}
  </SidebarProvider>
}

export const Default: Story = { render: () => <Workspace /> }
export const Collapsed: Story = { render: () => <Workspace defaultOpen={false} /> }
export const Toggleable: Story = {
  render: function ControlledSidebar() {
    const [open, setOpen] = React.useState(true)
    return <Workspace open={open} onOpenChange={setOpen} />
  },
}
export const Offcanvas: Story = { render: () => <Workspace collapsible="offcanvas" /> }
export const Floating: Story = { render: () => <Workspace variant="floating" /> }
export const Inset: Story = { render: () => <Workspace variant="inset" /> }
export const Right: Story = { render: () => <Workspace side="right" /> }
