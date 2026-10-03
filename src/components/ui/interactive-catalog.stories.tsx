import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button.js';
import { Checkbox as CheckboxControl } from './checkbox.js';
import { Dialog as DialogRoot, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from './dialog.js';
import { DropdownMenu as DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './dropdown-menu.js';
import { Input } from './input.js';
import { Label as LabelControl } from './label.js';
import { SearchField as SearchFieldControl } from './search-field.js';
import { Toaster as ToasterControl } from './toaster.js';
import { TopNav as TopNavControl } from './top-nav.js';
import { Tooltip as TooltipRoot, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip.js';
import { toast } from '../../hooks/use-toast.js';

const meta = {
  title: 'UI/Interactive catalog',
  parameters: { renderer: 'react', layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Checkbox: Story = {
  render: () => <div className="grid gap-4">
    <div className="flex items-center gap-3"><CheckboxControl id="accept-terms" /><LabelControl htmlFor="accept-terms">Accept terms</LabelControl></div>
    <div className="flex items-center gap-3"><CheckboxControl id="locked-terms" disabled /><LabelControl htmlFor="locked-terms">Unavailable choice</LabelControl></div>
  </div>,
};
export const Dialog: Story = {
  render: () => <DialogRoot>
    <DialogTrigger asChild><Button>Open dialog</Button></DialogTrigger>
    <DialogContent><DialogTitle>Project settings</DialogTitle><DialogDescription>Review the project before saving.</DialogDescription>
      <LabelControl htmlFor="project-name">Project name</LabelControl><Input id="project-name" defaultValue="EnoughUI" />
      <DialogClose asChild><Button>Save settings</Button></DialogClose>
    </DialogContent>
  </DialogRoot>,
};
export const DropdownMenu: Story = {
  render: () => <DropdownMenuRoot><DropdownMenuTrigger asChild><Button>Project actions</Button></DropdownMenuTrigger>
    <DropdownMenuContent><DropdownMenuItem>Rename project</DropdownMenuItem><DropdownMenuItem disabled>Delete project</DropdownMenuItem><DropdownMenuItem>Duplicate project</DropdownMenuItem></DropdownMenuContent>
  </DropdownMenuRoot>,
};
export const Label: Story = {
  render: () => <div className="grid max-w-sm gap-2"><LabelControl htmlFor="catalog-email">Email address</LabelControl><Input id="catalog-email" type="email" placeholder="you@example.com" /></div>,
};
export const SearchField: Story = {
  render: function SearchExample() {
    const [open, setOpen] = React.useState(false);
    return <DialogRoot open={open} onOpenChange={setOpen}>
      <SearchFieldControl onActivate={() => setOpen(true)} />
      <DialogContent><DialogTitle>Search your workspace</DialogTitle><DialogDescription>Find the project you want to work on.</DialogDescription><Input aria-label="Search projects" /></DialogContent>
    </DialogRoot>;
  },
};
export const Toaster: Story = {
  render: () => <><Button onClick={() => toast({ title: 'Project saved', description: 'Your changes are ready.' })}>Show notification</Button><ToasterControl /></>,
};
export const TopNav: Story = {
  render: () => <><TopNavControl brand="EnoughUI" homeLabel="EnoughUI home" links={[{ label: 'Components', href: '#catalog-main' }, { label: 'Contributing', href: '#contributing' }]} active="Components" cta="Get started" ctaHref="#catalog-main" /><main id="catalog-main"><h1 className="mt-6 font-serif text-2xl">Build something worth keeping.</h1></main></>,
};
export const Tooltip: Story = {
  render: () => <TooltipProvider delayDuration={0}><TooltipRoot><TooltipTrigger asChild><Button>Save draft</Button></TooltipTrigger><TooltipContent>Keep a private copy of your changes.</TooltipContent></TooltipRoot></TooltipProvider>,
};
