import { cva } from "class-variance-authority";

export const traceStyles = {
  Root: "flex w-full min-w-0 flex-col gap-1 font-sans text-sm text-[var(--color-text-3)]",
  Line: "flex w-fit max-w-full min-w-0 items-center gap-2 py-1 text-[var(--color-text-3)] transition-colors in-[a,button]:cursor-pointer in-[a:hover,button:hover]:text-[var(--color-ink)] data-[status=error]:text-[var(--color-warn)] data-[status=running]:motion-safe:*:data-[slot=trace-title]:animate-pulse",
  Icon: "flex size-4 shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:size-4",
  Title: "min-w-0 truncate font-sans",
  Description: "shrink-0 font-sans text-xs text-[var(--color-text-3)]",
  Collapsible: "flex w-full min-w-0 flex-col font-sans",
  Trigger:
    "group/trace-collapsible-trigger flex w-fit max-w-full min-w-0 cursor-pointer items-center gap-2 text-start font-sans text-[var(--color-text-3)] outline-none hover:text-[var(--color-ink)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:pointer-events-none disabled:opacity-50",
  Content: "min-w-0 overflow-hidden",
  Inner:
    "min-w-0 break-words border-s border-[var(--color-border-mid)] py-2 ps-4 ms-2 font-sans text-sm text-[var(--color-text-3)]",
} as const;

export const codeBlockVariants = cva(
  "group/code-block relative flex w-full min-w-0 flex-col overflow-hidden border font-sans text-sm text-[var(--color-ink)]",
  {
    variants: {
      variant: {
        default: "border-[var(--color-border-mid)] bg-[var(--color-paper)]",
        destructive: "border-[var(--color-warn)] bg-[var(--color-paper)]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);
export const codeBlockLineVariants = cva(
  "enough-code-line relative block min-h-lh",
  {
    variants: {
      variant: {
        default: "",
        added:
          "bg-[color-mix(in_srgb,var(--color-ok)_10%,transparent)] before:text-[var(--color-ok)]",
        removed:
          "bg-[color-mix(in_srgb,var(--color-warn)_10%,transparent)] before:text-[var(--color-warn)]",
        highlighted:
          "bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);
export const codeBlockStyles = {
  Header:
    "flex min-h-11 min-w-0 shrink-0 items-center gap-3 border-b border-[var(--color-border-mid)] px-4 py-2 group-data-[size=sm]/code-block:px-2",
  Title:
    "min-w-0 truncate font-sans text-xs font-medium [&_svg]:pointer-events-none [&_svg]:inline-block [&_svg]:size-4 [&_svg]:align-middle",
  Actions: "ms-auto flex shrink-0 items-center gap-1",
  CopyButton: "font-sans",
  Content:
    "min-h-0 min-w-0 overflow-auto p-4 text-start font-sans text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-accent)] data-[wrap]:whitespace-pre-wrap data-[wrap]:break-words group-data-[size=sm]/code-block:p-2 group-data-[size=sm]/code-block:text-xs",
  Code: "grid min-h-lh min-w-max content-start font-sans in-data-wrap:min-w-0",
  Footer:
    "flex min-w-0 shrink-0 items-center gap-2 border-t border-[var(--color-border-mid)] px-3 py-2 font-sans text-xs text-[var(--color-text-3)]",
} as const;

export const composerStyles = {
  Root: "flex w-full min-w-0 flex-col gap-2 font-sans",
  Group:
    "border-[var(--color-border-mid)] shadow-none has-[:disabled]:opacity-100 has-[:disabled]:cursor-auto",
  Textarea:
    "min-h-16 max-h-60 overflow-y-auto px-4 pb-3 pt-4 text-sm leading-6 placeholder:text-[var(--color-text-3)]",
  Attachments: "border-0 bg-transparent px-3 pb-0 pt-3",
  Controls: "gap-2 border-0 bg-transparent px-3 pb-3 pt-0",
  Attachment: "w-64 max-w-full border-[var(--color-border-mid)] shadow-none",
  AttachmentMedia:
    "size-8 border-0 bg-[var(--color-paper)] text-[var(--color-text-3)]",
  Error:
    "flex items-start gap-2 px-1 text-sm leading-5 text-[var(--color-warn)]",
} as const;

export const confirmationStyles = {
  Root: "flex-wrap items-start gap-4 p-4 sm:items-center",
  Actions: "w-full justify-end sm:ms-auto sm:w-auto",
  Button: "flex-1 sm:flex-none",
  Receipt:
    "mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-3)]",
  Error: "mt-2 text-sm text-[var(--color-warn)]",
} as const;
