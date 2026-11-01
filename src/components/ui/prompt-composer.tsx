"use client";
import * as React from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "./input-group.js";
import {
  Attachment,
  AttachmentActions,
  AttachmentAction,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentGroup,
} from "./attachment.js";
import { cn } from "../../lib/utils.js";
import { Button } from "./button.js";
import {
  PaperclipIcon,
  ArrowUpIcon,
  SquareIcon,
  XIcon,
  FileTextIcon,
  AlertCircleIcon,
} from "lucide-react";
import { composerStyles } from "../../lib/agent-ui.js";

export interface PromptComposerProps extends Omit<
  React.ComponentProps<"form">,
  "onSubmit" | "onChange"
> {
  value: string;
  onValueChange: (value: string) => void;
  files?: readonly File[];
  onFilesChange?: (files: File[]) => void;
  onSend: (message: {
    text: string;
    files: readonly File[];
  }) => void | Promise<void>;
  busy?: boolean;
  onStop?: () => void;
  disabled?: boolean;
  accept?: string;
  label?: string;
  placeholder?: string;
  tools?: React.ReactNode;
}
export function PromptComposer({
  value,
  onValueChange,
  files = [],
  onFilesChange,
  onSend,
  busy = false,
  onStop,
  disabled = false,
  accept,
  label = "Message",
  placeholder = "Ask the agent…",
  tools,
  children,
  className,
  ...props
}: PromptComposerProps) {
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const inFlight = React.useRef(false);
  const input = React.useRef<HTMLInputElement>(null);
  const textarea = React.useRef<HTMLTextAreaElement>(null);
  const errorId = React.useId();
  React.useLayoutEffect(() => {
    const field = textarea.current;
    if (!field) return;
    const resize = () => {
      field.style.height = "auto";
      field.style.height = `${Math.max(64, Math.min(field.scrollHeight, 240))}px`;
    };
    resize();
    let width = field.clientWidth;
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(() => {
            if (field.clientWidth !== width) {
              width = field.clientWidth;
              resize();
            }
          });
    observer?.observe(field);
    return () => observer?.disconnect();
  }, [value]);

  const working = busy || submitting;
  const canSend =
    !disabled && !working && Boolean(value.trim() || files.length);
  const send = async () => {
    if (!canSend || inFlight.current) return;
    inFlight.current = true;
    setSubmitting(true);
    setError("");
    try {
      await onSend({ text: value, files });
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Message failed. Try again.",
      );
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };
  return (
    <form
      {...props}
      className={cn(composerStyles.Root, className)}
      onSubmit={(event) => {
        event.preventDefault();
        void send();
      }}
    >
      <InputGroup
        className={cn(
          composerStyles.Group,
          disabled &&
            "has-[:disabled]:opacity-50 has-[:disabled]:cursor-not-allowed",
        )}
        data-disabled={disabled ? true : undefined}
      >
        {files.length > 0 && (
          <InputGroupAddon
            align="block-start"
            className={composerStyles.Attachments}
          >
            <AttachmentGroup aria-label="Attached files">
              {files.map((file, index) => (
                <Attachment
                  key={`${file.name}-${file.lastModified}-${index}`}
                  className={composerStyles.Attachment}
                  size="sm"
                >
                  <AttachmentMedia className={composerStyles.AttachmentMedia}>
                    <FileTextIcon />
                  </AttachmentMedia>
                  <AttachmentContent>
                    <AttachmentTitle
                      className="truncate font-medium"
                      title={file.name}
                    >
                      {file.name}
                    </AttachmentTitle>
                    <AttachmentDescription>
                      {file.name.split(".").pop()?.toUpperCase() || "File"} ·{" "}
                      {file.size < 1024
                        ? `${file.size} B`
                        : file.size < 1048576
                          ? `${Math.ceil(file.size / 1024)} KB`
                          : `${(file.size / 1048576).toFixed(1)} MB`}
                    </AttachmentDescription>
                  </AttachmentContent>
                  {onFilesChange && (
                    <AttachmentActions>
                      <AttachmentAction
                        disabled={disabled || working}
                        aria-label={`Remove ${file.name}`}
                        onClick={() => {
                          onFilesChange(
                            files.filter((_, position) => index !== position),
                          );
                          textarea.current?.focus();
                        }}
                      >
                        <XIcon />
                      </AttachmentAction>
                    </AttachmentActions>
                  )}
                </Attachment>
              ))}
            </AttachmentGroup>
          </InputGroupAddon>
        )}
        <InputGroupTextarea
          className={composerStyles.Textarea}
          ref={textarea}
          rows={1}
          aria-label={label}
          aria-describedby={error ? errorId : undefined}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => onValueChange(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing &&
              event.nativeEvent.keyCode !== 229
            ) {
              event.preventDefault();
              if (canSend) event.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <InputGroupAddon align="block-end" className={composerStyles.Controls}>
          {onFilesChange && (
            <>
              <input
                ref={input}
                type="file"
                multiple
                accept={accept}
                hidden
                onChange={(event) => {
                  onFilesChange([
                    ...files,
                    ...Array.from(event.target.files ?? []),
                  ]);
                  event.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Attach files"
                title="Attach files"
                disabled={disabled || working}
                onClick={() => input.current?.click()}
              >
                <PaperclipIcon />
              </Button>
            </>
          )}
          {tools}
          {working ? (
            <Button
              type="button"
              size="icon-sm"
              className="ms-auto"
              aria-label="Stop"
              title="Stop"
              disabled={disabled || !onStop}
              onClick={() => {
                onStop?.();
                textarea.current?.focus();
              }}
            >
              <SquareIcon className="size-3 fill-current" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon-sm"
              className="ms-auto"
              aria-label="Send"
              title="Send"
              disabled={!canSend}
            >
              <ArrowUpIcon />
            </Button>
          )}
        </InputGroupAddon>
      </InputGroup>
      {error && (
        <p id={errorId} role="alert" className={composerStyles.Error}>
          <AlertCircleIcon
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0"
          />
          {error}
        </p>
      )}
      {children}
    </form>
  );
}
