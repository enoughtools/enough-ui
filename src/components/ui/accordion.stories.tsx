import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './accordion.js';

const meta = {
  title: 'UI/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  parameters: {
    renderer: 'react',
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[min(560px,calc(100vw-40px))]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Accordion>;

export default meta;
type AccordionProps = ComponentProps<typeof Accordion>;
type SingleAccordionProps = Extract<AccordionProps, { type: 'single' }>;
type MultipleAccordionProps = Extract<AccordionProps, { type: 'multiple' }>;
type SingleStory = StoryObj<SingleAccordionProps>;
type MultipleStory = StoryObj<MultipleAccordionProps>;

export const Default: SingleStory = {
  args: {
    type: 'single',
    defaultValue: 'item-1',
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="item-1">
        <AccordionTrigger>What is included?</AccordionTrigger>
        <AccordionContent>
          Each component includes accessible behavior, keyboard navigation, and
          styling aligned with the custom design language.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Can I customize the styles?</AccordionTrigger>
        <AccordionContent>
          Yes. Pass a className to any part of the accordion to extend or
          override its Tailwind utility classes.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Does it support keyboard navigation?</AccordionTrigger>
        <AccordionContent>
          Yes. The Radix UI primitive provides arrow-key navigation, focus
          management, and the correct ARIA attributes.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstTrigger = canvas.getByRole('button', { name: 'What is included?' });
    const firstPanel = canvas.getByRole('region', { name: 'What is included?' });
    const secondTrigger = canvas.getByRole('button', { name: 'Can I customize the styles?' });

    await expect(firstTrigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(firstTrigger);
    await expect(firstTrigger).toHaveAttribute('aria-expanded', 'false');
    await expect(firstPanel).toHaveAttribute('data-state', 'closed');

    firstTrigger.focus();
    await userEvent.keyboard('{Enter}');
    await expect(firstTrigger).toHaveAttribute('aria-expanded', 'true');
    await expect(firstPanel).toHaveAttribute('data-state', 'open');

    await userEvent.keyboard('{ArrowDown}');
    await expect(secondTrigger).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(firstTrigger).toHaveAttribute('aria-expanded', 'false');
    await expect(secondTrigger).toHaveAttribute('aria-expanded', 'true');
  },
};

export const Multiple: MultipleStory = {
  args: {
    type: 'multiple',
    defaultValue: ['item-1', 'item-2'],
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Design system</AccordionTrigger>
        <AccordionContent>
          Structural ink borders and square corners establish a precise,
          editorial visual rhythm.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Interaction</AccordionTrigger>
        <AccordionContent>
          Open several sections at once to compare related information without
          losing context.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Implementation</AccordionTrigger>
        <AccordionContent>
          Each section remains independently controlled while preserving the
          same accessible keyboard interactions.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Controlled: SingleStory = {
  args: {
    type: 'single',
    onValueChange: fn(),
  },
  render: (args) => {
    const [value, setValue] = React.useState('controlled-item');

    return (
      <Accordion
        {...args}
        value={value}
        onValueChange={(nextValue: string) => {
          setValue(nextValue);
          args.onValueChange?.(nextValue);
        }}
      >
        <AccordionItem value="controlled-item">
          <AccordionTrigger>Controlled section</AccordionTrigger>
          <AccordionContent>
            An empty string is a valid controlled value and closes the section.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  },
  play: async ({ args, canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Controlled section',
    });

    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(trigger);
    await expect(args.onValueChange).toHaveBeenCalledWith('');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

export const WithDisabledItem: SingleStory = {
  args: {
    type: 'single',
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="available">
        <AccordionTrigger>Available section</AccordionTrigger>
        <AccordionContent>
          This section can be opened and closed normally.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="unavailable" disabled>
        <AccordionTrigger>Unavailable section</AccordionTrigger>
        <AccordionContent>
          This section cannot be opened while disabled.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
