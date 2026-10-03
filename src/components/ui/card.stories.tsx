import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from './card.js';
import { Button } from './button.js';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    renderer: 'react',
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Name</label>
              <input
                id="name"
                placeholder="Name of your project"
                className="flex h-10 w-full rounded-none border border-[var(--color-ink)] bg-transparent px-3 py-2 text-sm placeholder:text-[var(--color-ink)] placeholder:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="framework" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Framework</label>
              <select
                id="framework"
                className="flex h-10 w-full rounded-none border border-[var(--color-ink)] bg-transparent px-3 py-2 text-sm placeholder:text-[var(--color-ink)] placeholder:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="next">Next.js</option>
                <option value="sveltekit">SvelteKit</option>
                <option value="astro">Astro</option>
                <option value="nuxt">Nuxt.js</option>
              </select>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <button className="inline-flex items-center justify-center rounded-none border border-[var(--color-ink)] bg-[var(--color-surface)] text-[var(--color-ink)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-ink)] hover:text-[var(--color-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2">Cancel</button>
        <button className="inline-flex items-center justify-center rounded-none border border-transparent bg-[var(--color-ink)] text-[var(--color-surface)] px-4 py-2 text-sm font-medium hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2">Deploy</button>
      </CardFooter>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <p>Card Footer</p>
      </CardFooter>
    </Card>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Card className="w-[min(420px,calc(100vw-40px))]">
      <CardHeader>
        <CardTitle>Workspace</CardTitle>
        <CardDescription>Your project at a glance.</CardDescription>
        <CardAction><Button asChild variant="outline" size="sm"><a href="#workspace-details">Details</a></Button></CardAction>
      </CardHeader>
      <CardContent id="workspace-details">Three projects are ready for review.</CardContent>
    </Card>
  ),
};

export const Compact: Story = {
  render: () => (
    <Card size="sm" className="w-[min(360px,calc(100vw-40px))]">
      <CardHeader><CardTitle>Release 1.0</CardTitle><CardDescription>Ready for review.</CardDescription><CardAction><span className="text-sm">✓</span></CardAction></CardHeader>
      <CardContent>All required checks have passed.</CardContent>
    </Card>
  ),
};
