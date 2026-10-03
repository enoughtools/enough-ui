import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./navigation-menu.js"

const meta = {
  title: "UI/Navigation Menu",
  component: NavigationMenu,
  parameters: {
    renderer: 'react',
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof NavigationMenu>

export default meta
type Story = StoryObj<typeof meta>

const ListItem = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    title: string
  }
>(({ className, title, children, ...props }, ref) => (
  <li>
    <NavigationMenuLink asChild>
      <a
        ref={ref}
        className={`block rounded-none border border-transparent bg-[var(--color-surface)] p-3 text-left text-[var(--color-ink)] no-underline outline-none transition-colors hover:border-[var(--color-ink)] hover:bg-[var(--color-accent)] focus:border-[var(--color-ink)] focus:bg-[var(--color-accent)] ${className ?? ""}`}
        {...props}
      >
        <div className="text-sm font-bold leading-none">{title}</div>
        <p className="mt-2 line-clamp-2 text-sm leading-snug text-[var(--color-text-3)]">
          {children}
        </p>
      </a>
    </NavigationMenuLink>
  </li>
))
ListItem.displayName = "ListItem"

export const Default: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[520px] grid-cols-2 gap-2 p-4">
              <ListItem href="#" title="Analytics">
                Read the signals that matter across every active project.
              </ListItem>
              <ListItem href="#" title="Automations">
                Build reliable workflows without repetitive manual work.
              </ListItem>
              <ListItem href="#" title="Collaboration">
                Keep decisions, files, and feedback in one visible place.
              </ListItem>
              <ListItem href="#" title="Integrations">
                Connect the tools your team already depends on.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[360px] gap-1 p-4">
              <ListItem href="#" title="Documentation">
                Technical guides and API references for builders.
              </ListItem>
              <ListItem href="#" title="Customer stories">
                See how teams turn a clear system into momentum.
              </ListItem>
              <ListItem href="#" title="Changelog">
                Follow new features, improvements, and fixes.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink
            href="#"
            className={navigationMenuTriggerStyle()}
          >
            Pricing
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuIndicator />
      </NavigationMenuList>
    </NavigationMenu>
  ),
}

export const Featured: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Explore</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[600px] grid-cols-[220px_1fr] gap-3 p-4">
              <NavigationMenuLink asChild>
                <a
                  href="#"
                  className="flex h-full min-h-[190px] flex-col justify-end rounded-none border border-[var(--color-ink)] bg-[var(--color-accent)] p-5 text-[var(--color-ink)] shadow-[var(--shadow-card)] outline-none focus:ring-2 focus:ring-[var(--color-ink)]"
                >
                  <span className="mb-auto text-3xl" aria-hidden="true">◆</span>
                  <strong className="text-xl">Field Notes</strong>
                  <span className="mt-2 text-sm leading-relaxed">
                    Patterns, practices, and sharp opinions for product teams.
                  </span>
                </a>
              </NavigationMenuLink>
              <ul className="grid gap-1">
                <ListItem href="#" title="Start here">
                  A concise guide to the core workflow.
                </ListItem>
                <ListItem href="#" title="Principles">
                  The decisions behind the system.
                </ListItem>
                <ListItem href="#" title="Examples">
                  Practical patterns ready to adapt.
                </ListItem>
              </ul>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>
            About
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuIndicator />
      </NavigationMenuList>
    </NavigationMenu>
  ),
}

export const WithoutViewport: Story = {
  render: () => (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        <NavigationMenuItem value="resources">
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent className="w-[min(18rem,calc(100vw-2rem))]">
            <ul className="grid gap-1 p-3">
              <ListItem href="#documentation" title="Documentation">Guides and API references for builders.</ListItem>
              <ListItem href="#examples" title="Examples">Practical patterns ready to adapt.</ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem><NavigationMenuLink href="#pricing" className={navigationMenuTriggerStyle()}>Pricing</NavigationMenuLink></NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
}
