"use client";
import * as React from "react";
import {
  sourceStyles,
  sourceHref,
  type SourceReference,
} from "../../lib/sources.js";
import { cn } from "../../lib/utils.js";
import { Popover, PopoverTrigger, PopoverContent } from "./popover.js";
import { Button } from "./button.js";
export type { SourceReference } from "../../lib/sources.js";
export interface SourcesProps extends React.ComponentProps<"section"> {
  sources: readonly SourceReference[];
  label?: string;
}
export function Sources({
  sources,
  label = "Sources",
  className,
  ...props
}: SourcesProps) {
  return (
    <section
      aria-label={label}
      className={cn(sourceStyles.Root, className)}
      {...props}
    >
      <h3 className="font-semibold">{label}</h3>
      <ol className={sourceStyles.List}>
        {sources.map((source) => (
          <li key={source.id} className={sourceStyles.Item}>
            <a className={sourceStyles.Link} href={sourceHref(source.href)}>
              {source.title}
            </a>
            {source.description && (
              <p className={sourceStyles.Description}>{source.description}</p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
export function InlineCitation({
  source,
  index,
}: {
  source: SourceReference;
  index: number;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="link"
          size="xs"
          aria-label={`Source ${index}: ${source.title}`}
        >
          [{index}]
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <a className={sourceStyles.Link} href={sourceHref(source.href)}>
          {source.title}
        </a>
        {source.description && (
          <p className={sourceStyles.Description}>{source.description}</p>
        )}
      </PopoverContent>
    </Popover>
  );
}
