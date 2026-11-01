"use client";
import * as React from "react";
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from "./item.js";
import { Button } from "./button.js";
import { cn } from "../../lib/utils.js";
import { confirmationStyles } from "../../lib/agent-ui.js";
import { CheckIcon, XIcon, ClockIcon } from "lucide-react";
import { Spinner } from "./spinner.js";

export type AgentDecision = "approved" | "denied";
export type AgentResolution = AgentDecision | "expired" | "cancelled";
export interface AgentConfirmationProps extends Omit<
  React.ComponentProps<typeof Item>,
  "title"
> {
  request: { id: string; title: string; description?: string };
  resolution?: AgentResolution | "pending";
  onDecision: (decision: AgentDecision) => void | Promise<void>;
}

// Keyed request state prevents a late response for an old request from changing
// the current request. Persist/replay resolution in the host's transcript.
export function AgentConfirmation(props: AgentConfirmationProps) {
  return <ConfirmationRequest key={props.request.id} {...props} />;
}
function ConfirmationRequest({
  request,
  resolution,
  onDecision,
  className,
  ...props
}: AgentConfirmationProps) {
  const [accepted, setAccepted] = React.useState<AgentResolution>();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const inFlight = React.useRef(false);
  const settled =
    resolution === "pending" ? undefined : (resolution ?? accepted);
  const decide = async (decision: AgentDecision) => {
    if (inFlight.current || settled) return;
    inFlight.current = true;
    setSubmitting(true);
    setError("");
    try {
      await onDecision(decision);
      if (resolution === undefined) setAccepted(decision);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not record the decision. Try again.",
      );
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };
  return (
    <Item
      variant="outline"
      size="sm"
      {...props}
      className={cn(confirmationStyles.Root, className)}
      data-request-id={request.id}
      data-resolution={settled}
      aria-busy={submitting}
    >
      <ItemContent>
        <ItemTitle>{request.title}</ItemTitle>
        {request.description && (
          <ItemDescription>{request.description}</ItemDescription>
        )}
        {settled && (
          <p role="status" className={confirmationStyles.Receipt}>
            {settled === "approved" ? (
              <CheckIcon aria-hidden="true" className="size-3.5" />
            ) : settled === "expired" ? (
              <ClockIcon aria-hidden="true" className="size-3.5" />
            ) : (
              <XIcon aria-hidden="true" className="size-3.5" />
            )}
            {settled === "approved"
              ? "Approved"
              : settled === "denied"
                ? "Denied"
                : settled === "expired"
                  ? "Request expired"
                  : "Request cancelled"}
          </p>
        )}
        {error && !settled && (
          <p role="alert" className={confirmationStyles.Error}>
            {error}
          </p>
        )}
      </ItemContent>
      {!settled && (
        <ItemActions className={confirmationStyles.Actions}>
          <Button
            className={confirmationStyles.Button}
            type="button"
            variant="outline"
            size="sm"
            disabled={submitting}
            onClick={() => void decide("denied")}
          >
            Deny
          </Button>
          <Button
            className={confirmationStyles.Button}
            type="button"
            size="sm"
            disabled={submitting}
            onClick={() => void decide("approved")}
          >
            {submitting && <Spinner aria-hidden="true" />}Approve
          </Button>
        </ItemActions>
      )}
    </Item>
  );
}
