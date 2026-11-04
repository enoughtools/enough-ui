"use client";
import * as React from "react";
import {
  Trace,
  TraceLine,
  TraceIcon,
  TraceTitle,
  TraceDescription,
  TraceCollapsible,
  TraceCollapsibleTrigger,
  TraceCollapsibleContent,
} from "./trace.js";
import { CodeBlock, CodeBlockContent } from "./code-block.js";
import { Button } from "./button.js";
import { cn } from "../../lib/utils.js";
import {
  agentWorkStyles,
  agentStepIcons,
  agentStepLabels,
  agentStepIconClass,
  agentStepTitleClass,
  type AgentStep,
} from "../../lib/agent-work.js";
export type { AgentStep } from "../../lib/agent-work.js";
export interface AgentWorkProps extends React.ComponentProps<typeof Trace> {
  steps: readonly AgentStep[];
  onRetry?: (id: string) => void;
}
export function AgentWork({
  steps,
  onRetry,
  className,
  ...props
}: AgentWorkProps) {
  return (
    <Trace className={cn(agentWorkStyles.Root, className)} {...props}>
      {steps.map((step) => (
        <Step key={step.id} step={step} onRetry={onRetry} />
      ))}
    </Trace>
  );
}
function Step({
  step,
  onRetry,
}: {
  step: AgentStep;
  onRetry?: (id: string) => void;
}) {
  const [open, setOpen] = React.useState<boolean>();
  const status = step.status ?? "completed";
  const line = (
    <TraceLine
      className={agentWorkStyles.Line}
      status={status === "error" || status === "pending" ? status : undefined}
    >
      <TraceIcon>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={agentStepIconClass(status)}
        >
          <path d={agentStepIcons[status]} />
        </svg>
      </TraceIcon>
      <span className="sr-only">{agentStepLabels[status]}: </span>
      <TraceTitle
        className={cn(agentWorkStyles.Title, agentStepTitleClass(status))}
      >
        {step.title}
      </TraceTitle>
      {(step.description || step.status === "cancelled") && (
        <TraceDescription>
          {step.status === "cancelled" ? "Cancelled" : step.description}
        </TraceDescription>
      )}
    </TraceLine>
  );
  return (
    <div
      className={agentWorkStyles.Step}
      data-step-id={step.id}
      data-step-status={status}
    >
      {step.output !== undefined || step.steps?.length ? (
        <TraceCollapsible
          open={open ?? step.status === "running"}
          onOpenChange={setOpen}
        >
          <TraceCollapsibleTrigger className={agentWorkStyles.Trigger}>
            {line}
          </TraceCollapsibleTrigger>
          <TraceCollapsibleContent className={agentWorkStyles.Detail}>
            {step.output !== undefined && (
              <CodeBlock
                size="sm"
                variant={step.status === "error" ? "destructive" : "default"}
              >
                <CodeBlockContent wrap>{step.output}</CodeBlockContent>
              </CodeBlock>
            )}
            {step.steps && <AgentWork steps={step.steps} onRetry={onRetry} />}
          </TraceCollapsibleContent>
        </TraceCollapsible>
      ) : (
        line
      )}
      {onRetry && (step.status === "error" || step.status === "cancelled") && (
        <Button
          className={agentWorkStyles.Retry}
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onRetry(step.id)}
        >
          Retry {step.title}
        </Button>
      )}
    </div>
  );
}
