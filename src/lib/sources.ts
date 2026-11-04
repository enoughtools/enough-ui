export interface SourceReference {
  id: string;
  title: string;
  href: string;
  description?: string;
}
export const sourceStyles = {
  Root: "flex min-w-0 flex-col gap-2 font-sans text-sm",
  List: "flex min-w-0 list-decimal flex-col gap-3 ps-5 marker:text-xs marker:text-[var(--color-text-3)]",
  Item: "min-w-0 ps-1",
  Description: "mt-1 text-sm leading-5 text-[var(--color-text-3)]",
  Link: "break-words font-sans text-sm font-medium text-[var(--color-accent)] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
};
export function sourceHref(value: string) {
  if (/^(?:\/(?!\/)|#)/.test(value)) return value;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
