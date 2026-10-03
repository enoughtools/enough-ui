import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToStaticMarkup } from 'react-dom/server';
import { Alert, AlertAction, AlertDescription, AlertTitle } from '../../src/components/ui/alert.js';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from '../../src/components/ui/alert-dialog.js';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '../../src/components/ui/card.js';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, useCarousel } from '../../src/components/ui/carousel.js';
import { Command, CommandDialog, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '../../src/components/ui/command.js';
import { Marker, MarkerContent, MarkerIcon } from '../../src/components/ui/marker.js';
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from '../../src/components/ui/popover.js';
import { Tabs, TabsContent, TabsList, TabsTrigger, tabsListVariants } from '../../src/components/ui/tabs.js';

const embla = vi.hoisted(() => ({
  scrollPrev: vi.fn(), scrollNext: vi.fn(), canScrollPrev: vi.fn(() => false), canScrollNext: vi.fn(() => true),
  on: vi.fn(), off: vi.fn(),
}));
vi.mock('embla-carousel-react', () => ({ default: () => [() => {}, embla] }));

describe('presentational API additions', () => {
  it('keeps alert actions operable and reserves room for their content', async () => {
    const dismiss = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<Alert><AlertTitle>Saved</AlertTitle><AlertDescription>Ready to share.</AlertDescription><AlertAction><button onClick={dismiss}>Dismiss</button></AlertAction></Alert>);
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(dismiss).toHaveBeenCalledOnce();
    expect(screen.getByRole('alert')).toHaveClass('has-data-[slot=alert-action]:pr-24');
    expect(container.querySelector('[data-slot="alert-action"]')).toContainElement(screen.getByRole('button'));
  });

  it('places a compact card action beside its title and description', () => {
    const { container } = render(<Card size="sm"><CardHeader><CardTitle>Workspace</CardTitle><CardDescription>Ready to review.</CardDescription><CardAction><a href="#details">Details</a></CardAction></CardHeader><CardContent id="details">Three projects.</CardContent></Card>);
    expect(container.querySelector('[data-slot="card"]')).toHaveAttribute('data-size', 'sm');
    expect(container.querySelector('[data-slot="card-header"]')).toHaveClass('has-data-[slot=card-action]:grid-cols-[1fr_auto]');
    expect(container.querySelector('[data-slot="card-action"]')).toHaveClass('col-start-2', 'row-span-2');
    expect(screen.getByRole('link', { name: 'Details' })).toHaveAttribute('href', '#details');
  });

  it('composes decorative marker icons and meaningful, wrapping status text', () => {
    const { container } = render(<Marker variant="border" role="status"><MarkerIcon>✓</MarkerIcon><MarkerContent>Reviewed all project files</MarkerContent></Marker>);
    expect(screen.getByRole('status').tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="marker-icon"]')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('[data-slot="marker-content"]')).toHaveClass('whitespace-normal', 'wrap-break-word');
    const legacy = renderToStaticMarkup(<Marker size="sm" variant="accent">Featured</Marker>);
    expect(legacy).toContain('<mark');
  });
});

describe('AlertDialog API additions', () => {
  it('supports compact media dialogs and button variants while preserving cancel focus', async () => {
    const user = userEvent.setup();
    render(<AlertDialog><AlertDialogTrigger>Delete draft</AlertDialogTrigger><AlertDialogContent size="sm"><AlertDialogHeader><AlertDialogMedia aria-hidden="true">×</AlertDialogMedia><AlertDialogTitle>Delete this draft?</AlertDialogTitle><AlertDialogDescription>A new draft can be created later.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel variant="ghost" size="sm">Keep draft</AlertDialogCancel><AlertDialogAction variant="destructive" size="sm">Delete permanently</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>);
    const trigger = screen.getByRole('button', { name: 'Delete draft' });
    await user.click(trigger);
    const dialog = await screen.findByRole('alertdialog', { name: 'Delete this draft?' });
    expect(dialog).toHaveAttribute('data-size', 'sm');
    expect(dialog).toHaveClass('max-w-sm');
    const cancel = within(dialog).getByRole('button', { name: 'Keep draft' });
    await waitFor(() => expect(cancel).toHaveFocus());
    const action = within(dialog).getByRole('button', { name: 'Delete permanently' });
    expect(action).toHaveClass('h-[33px]', 'border-[var(--color-warn)]');
    expect(action).not.toHaveAttribute('variant');
    await user.click(cancel);
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });
});

describe('Tabs API additions', () => {
  it('exports list variants and moves vertical keyboard focus past disabled tabs', async () => {
    const user = userEvent.setup();
    const { container } = render(<Tabs defaultValue="account" orientation="vertical"><TabsList variant="line" aria-label="Settings"><TabsTrigger value="account">Account</TabsTrigger><TabsTrigger value="billing" disabled>Billing</TabsTrigger><TabsTrigger value="notifications">Notifications</TabsTrigger></TabsList><TabsContent value="account">Profile settings.</TabsContent><TabsContent value="notifications">Notification settings.</TabsContent></Tabs>);
    expect(tabsListVariants({ variant: 'line' })).toContain('bg-transparent');
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
    expect(screen.getByRole('tablist')).toHaveAttribute('data-variant', 'line');
    expect(container.querySelector('[data-slot="tabs"]')).toHaveAttribute('data-orientation', 'vertical');
    screen.getByRole('tab', { name: 'Account' }).focus();
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(screen.getByRole('tab', { name: 'Notifications' })).toHaveAttribute('aria-selected', 'true'));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Notification settings.');
    expect(screen.getByRole('tab', { name: 'Notifications' })).toHaveFocus();
  });
});

describe('Carousel API additions', () => {
  it('exports a guarded carousel hook', () => {
    function InvalidConsumer() { useCarousel(); return null; }
    expect(() => renderToStaticMarkup(<InvalidConsumer />)).toThrow('useCarousel must be used within a <Carousel />');
  });

  it('keeps server-rendered slides visible and vertical arrows pointing along their axis', () => {
    const html = renderToStaticMarkup(<Carousel orientation="vertical"><CarouselContent><CarouselItem>First slide</CarouselItem></CarouselContent><CarouselPrevious variant="ghost" size="icon-lg" /><CarouselNext /></Carousel>);
    const doc = new DOMParser().parseFromString(html, 'text/html');
    expect(doc.querySelector('[data-slot="carousel-content"]')?.classList.contains('opacity-100')).toBe(true);
    expect(doc.querySelector('[data-slot="carousel-content"]')?.classList.contains('opacity-0')).toBe(false);
    const previous = doc.querySelector('[data-slot="carousel-previous"]')!;
    expect(previous.querySelector('svg')?.getAttribute('data-direction')).toBe('up');
    expect(previous.classList.contains('rotate-90')).toBe(false);
    expect(previous.classList.contains('size-[49px]')).toBe(true);
    expect(previous.getAttribute('type')).toBe('button');
  });

  it('provides context actions to controls and honors the orientation keyboard mapping', async () => {
    function Status() { const carousel = useCarousel(); return <output>{carousel.orientation}</output>; }
    render(<Carousel orientation="vertical" aria-label="Project phases"><CarouselContent><CarouselItem>First slide</CarouselItem></CarouselContent><CarouselPrevious /><CarouselNext /><Status /></Carousel>);
    expect(screen.getByText('vertical')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(embla.scrollNext).toHaveBeenCalledOnce();
    fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowUp' });
    expect(embla.scrollPrev).toHaveBeenCalledOnce();
    fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowLeft' });
    expect(embla.scrollPrev).toHaveBeenCalledOnce();
  });
});

describe('Popover presentation additions', () => {
  it('supports named content, an actual heading and Escape focus restoration', async () => {
    const user = userEvent.setup();
    render(<Popover><PopoverTrigger>Share canvas</PopoverTrigger><PopoverContent aria-labelledby="share-title" aria-describedby="share-description"><PopoverHeader><PopoverTitle id="share-title">Invite your team</PopoverTitle><PopoverDescription id="share-description">Review the latest canvas.</PopoverDescription></PopoverHeader><button>Copy link</button></PopoverContent></Popover>);
    const trigger = screen.getByRole('button', { name: 'Share canvas' });
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Invite your team' });
    expect(dialog).toHaveAccessibleDescription('Review the latest canvas.');
    expect(within(dialog).getByRole('heading', { level: 2 })).toHaveTextContent('Invite your team');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });
});

describe('CommandDialog', () => {
  it('owns named option groups and keeps visual dividers out of the listbox accessibility tree', () => {
    const { container } = render(<Command label="Actions"><CommandInput aria-label="Search actions" /><CommandList><CommandGroup heading="Suggestions"><CommandItem>Calendar</CommandItem></CommandGroup><CommandSeparator /><CommandGroup heading="Settings"><CommandItem>Profile</CommandItem></CommandGroup></CommandList></Command>);
    const listbox = screen.getByRole('listbox');
    expect(within(listbox).getByRole('group', { name: 'Suggestions' })).toContainElement(screen.getByRole('option', { name: 'Calendar' }));
    expect(within(listbox).getByRole('group', { name: 'Settings' })).toContainElement(screen.getByRole('option', { name: 'Profile' }));
    expect(within(listbox).queryByRole('separator')).not.toBeInTheDocument();
    expect(container.querySelector('[cmdk-separator]')).toHaveAttribute('aria-hidden', 'true');
  });

  function Palette({ showCloseButton = false }: { showCloseButton?: boolean }) {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState('');
    const select = (next: string) => { setValue(next); setOpen(false); };
    return <><button onClick={() => setOpen(true)}>Open actions</button><output>{value}</output><CommandDialog open={open} onOpenChange={setOpen} title="Quick actions" description="Choose a workspace action." showCloseButton={showCloseButton}><Command label="Workspace actions"><CommandInput aria-label="Search actions" /><CommandList><CommandItem value="calendar" onSelect={select}>Calendar</CommandItem><CommandItem disabled value="archive">Archive</CommandItem><CommandItem value="calculator" onSelect={select}>Calculator</CommandItem></CommandList></Command></CommandDialog></>;
  }

  it('preserves composition and accessible labels, skips disabled items and restores the opener', async () => {
    const user = userEvent.setup();
    render(<Palette />);
    const trigger = screen.getByRole('button', { name: 'Open actions' });
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Quick actions' });
    expect(dialog).toHaveAccessibleDescription('Choose a workspace action.');
    expect(dialog.querySelectorAll('[cmdk-root]')).toHaveLength(1);
    expect(within(dialog).queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    await waitFor(() => expect(within(dialog).getByRole('combobox')).toHaveFocus());
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(within(dialog).getByRole('option', { name: 'Calculator' })).toHaveAttribute('aria-selected', 'true'));
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText('calculator')).toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('supports explicit close controls and Escape in a controlled dialog', async () => {
    const user = userEvent.setup();
    render(<Palette showCloseButton />);
    const trigger = screen.getByRole('button', { name: 'Open actions' });
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
    await user.click(trigger);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });
});
