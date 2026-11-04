# Agentic UI

EnoughUI supplies presentation and interaction components. The application owns model calls, tool execution, approvals, persistence and streaming transport. Trace and CodeBlock follow the pinned shadcn Radix interfaces; the agent compositions below are EnoughUI additions.

## Primitives

Import Trace and its compound parts from `@enoughtools/ui-react/trace`. A line's status is `running`, `pending` or `error`; completed work omits status. Wrap a line in TraceCollapsibleTrigger for disclosure, or use an actual anchor for navigation. Controlled TraceCollapsible requires `onOpenChange`. Triggers and collapsible content deliberately exclude `asChild`, matching upstream.

CodeBlock exposes Header, Title, Actions, CopyButton, Content, Line and Footer from `@enoughtools/ui-react/code-block`. Content accepts `wrap`, `lineNumbers`, `startLine`, plain text or composed lines. Line variants are default, added, removed and highlighted. Code content stays left-to-right while headers follow the surrounding direction. CopyButton copies the supplied string exactly, respects a cancelled click, and remains retryable if clipboard access fails.

All output uses proportional typography, including logs, line numbers and highlighted code. `--font-mono` remains an alias for `--font-sans`. Syntax highlighting is optional through `@enoughtools/ui-react/use-highlighted-code`; plain CodeBlock imports do not load the highlighter. Languages load on first use, and the hook reuses grammar state for completed streamed lines. Source text is rendered as text, not injected HTML.

Native Astro provides Trace, Line, Icon, Title and Description, plus all CodeBlock presentation parts. CodeBlockContent's `value` convenience prop splits numbered plain text without interpreting HTML; its default slot accepts composed CodeBlockLine children. Copy buttons and controlled disclosures belong in React islands. Native AgentWork renders the completed hierarchy expanded; it does not reproduce the React disclosure state.

## Agent compositions

- **AgentConfirmation:** keyed request identity, async decision submission, retryable errors and a recorded result. The host must resolve `onDecision` only after accepting the decision and persist that outcome in its transcript. Supply `resolution` on replay. With explicit `resolution="pending"`, the host owns the transition; a queued callback does not create a local approval receipt. Expired/cancelled requests have no live buttons. The native Astro component requires a recorded resolution and is presentation only.
- **PromptComposer:** controlled draft and files, async send, stop callback and a tools slot for application menus. A failed send preserves the draft and files. The host clears them after its own successful acceptance. File selection does not upload or store files. Enter sends; Shift+Enter and active IME composition preserve editing. Disabled and busy states prevent duplicate sends.
- **Sources / InlineCitation:** explicit source links and a keyboard/click-accessible citation popover in React. Native Astro renders direct citation links and the source list. Only HTTP, HTTPS, root-relative and fragment destinations are accepted.
- **AgentWork:** an ordered hierarchy of stable step IDs, status, description and optional output. It composes Trace and CodeBlock and supports host-owned retry. User expansion choices survive appended chunks. Plan, Queue, Tool, Subagent, Terminal and TestResults are existing Storybook recipes of this shared component, rather than separate competing primitives.

Use the existing Questionnaire for choice/freeform elicitation, and existing Message, MessageScroller, Attachment and Bubble for the thread. No additional chat runtime is required by these components.

## Optional integration pilot

The private [`examples/agentic-ui`](../examples/agentic-ui) package contains json-render and TanStack AI dependencies. Neither is a UI-package production dependency. It uses a live directory link to the built React package; rebuild source before testing the example. These developer fixtures are separate from the runtime-neutral Storybook catalog. The catalog uses EnoughUI components and references shadcn as its external interface standard.

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm --dir examples/agentic-ui install --frozen-lockfile
pnpm --dir examples/agentic-ui typecheck
pnpm storybook
```

The schema catalog exposes Panel, Text, DraftField, Choice, Button and Table. This is a deliberately small serializable interface, not a replacement for React props. The registry draws those definitions with EnoughUI components. Bindings are restricted to the pilot's draft and choice state; named submit actions invoke application callbacks. Unknown props/components/actions, invalid or repeated references, cycles and unsupported nesting are rejected before rendering. Each element has at most one parent, keeping identity unambiguous and tree traversal bounded. Valid UI remains available if a subsequent chunk is invalid; incomplete chunks should be accumulated by the host into valid snapshots. The pilot does not implement a new JSON stream parser.

Keep `surfaceId` stable while a surface streams; changing it starts a new state boundary. Stable element IDs preserve draft state and focus. The current json-render catalog validator strips event bindings and does not enforce strict unknown props as expected from the component schemas, so the pilot validates its envelope explicitly and preserves only its supported actions. Tests cover these limitations. This adapter is an example with a constrained supported scope, not a certified general-purpose renderer.

The TanStack example uses stable 1.0 packages together, a real `useChat` client, typed tool schemas and `interrupt.resolveInterrupt`. Its deterministic AG-UI producer exercises approval and resume without provider credentials. It is a transport fixture, not a production backend or a model integration. Replace the connection with the application's transport and persist messages and decisions in the host. Do not use the removed `addToolApprovalResponse` API. Media, structured-output and MCP-app parts need separate renderers and are outside this example.

Tests live in the normal React/Astro suites and reuse the stories. Browser checks exercise native trigger keyboard behavior, copy fidelity, failure recovery, citation focus restoration, narrow composer layout, progressive rendering. Separate integration tests cover the optional approval/resume round trip.
