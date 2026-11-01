export interface AgentStep {
  id: string;
  title: string;
  description?: string;
  status?: "pending" | "running" | "completed" | "error" | "cancelled";
  output?: string;
  steps?: readonly AgentStep[];
}

export const agentStepLabels = {
  completed: "Completed",
  running: "In progress",
  pending: "Pending",
  error: "Failed",
  cancelled: "Cancelled",
} as const;

export const agentStepIcons = {
  completed: "M5 12l4 4L19 6",
  running: "M20 12a8 8 0 1 1-5.5-7.6",
  pending: "M20 12a8 8 0 1 1-16 0a8 8 0 1 1 16 0",
  error: "M12 3L2 21h20ZM12 9v5M12 17h.01",
  cancelled: "M20 12a8 8 0 1 1-16 0a8 8 0 1 1 16 0M8 12h8",
} as const;

export const agentWorkStyles = {
  Root: "gap-0",
  Step: "enough-agent-step relative min-w-0",
  Line: "w-full min-h-9 flex-1 gap-3 py-2 [&>[data-slot=trace-description]]:ms-auto",
  Title: "font-normal",
  Trigger: "w-full gap-2",
  Detail: "ms-0 border-0 py-0 ps-7 pb-2",
  Retry: "ms-8 mb-3",
} as const;

export function agentStepIconClass(status: keyof typeof agentStepLabels) {
  return status === "running"
    ? "text-[var(--color-accent)] motion-safe:animate-spin"
    : status === "error"
      ? "text-[var(--color-warn)]"
      : "text-[var(--color-text-3)]";
}

export function agentStepTitleClass(status: keyof typeof agentStepLabels) {
  return status === "running"
    ? "font-medium text-[var(--color-ink)]"
    : status === "error"
      ? "text-[var(--color-warn)]"
      : status === "completed"
        ? "text-[var(--color-text-2)]"
        : "text-[var(--color-text-3)]";
}
