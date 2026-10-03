"use client";

import { spinnerVariants } from '../../lib/variants.js';

import * as React from "react"
import { type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils.js"



interface SpinnerProps
  extends React.ComponentPropsWithoutRef<"span">,
    VariantProps<typeof spinnerVariants> {
  label?: string
}

const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ className, size, label = "Loading", ...props }, ref) => (
    <span
      ref={ref}
      data-slot="spinner"
      role="status"
      aria-label={label}
      className={cn(spinnerVariants({ size }), className)}
      {...props}
    >
      <svg
        className="animate-spin motion-reduce:animate-none h-full w-full"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="3" y="3" width="18" height="18" stroke="var(--color-ink)" strokeWidth="4" />
        <rect x="3" y="3" width="9" height="9" fill="var(--color-accent)" />
      </svg>
    </span>
  )
)
Spinner.displayName = "Spinner"

export { Spinner, spinnerVariants }
export type { SpinnerProps }
