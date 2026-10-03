import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "./button.js"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
} from "./message-scroller.js"

const meta = {
  title: "UI/Message Scroller",
  component: MessageScroller,
  parameters: { renderer: "react", layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof MessageScroller>

export default meta
type Story = StoryObj<typeof meta>

type TranscriptRow = { id: string; speaker: string; text: string }
const transcript: TranscriptRow[] = [
  { id: "brief", speaker: "You", text: "What should we prioritize for our public launch?" },
  { id: "scope", speaker: "Assistant", text: "Start with a clear component catalog and examples that people can use in their own projects. Each example should show the intended behavior as well as the visual design." },
  { id: "parity", speaker: "You", text: "How do we keep Astro and React consistent?" },
  { id: "renderers", speaker: "Assistant", text: "Share the visual tokens and variants, then give presentational components a native Astro implementation. Interactive controls can use React islands with the same public API and appearance." },
  { id: "tests", speaker: "You", text: "And the checks for each release?" },
  { id: "validation", speaker: "Assistant", text: "Exercise real keyboard and pointer interactions, render the same catalog stories through both supported paths, and inspect the packaged artifacts. Consumers should be able to choose their renderer without extra dependencies." },
  { id: "next", speaker: "You", text: "What is the next step?" },
  { id: "release", speaker: "Assistant", text: "Review the component experience together, record any limits in the parity table, and ship a versioned release with a working installation example." },
]

function Transcript({ rows, streaming = false }: { rows: TranscriptRow[]; streaming?: boolean }) {
  return (
    <MessageScroller className="h-96 w-full">
      <MessageScrollerViewport>
        <MessageScrollerContent aria-busy={streaming}>
          {rows.map((row) => (
            <MessageScrollerItem key={row.id} messageId={row.id} scrollAnchor={row.speaker === "You"}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-3)]">{row.speaker}</p>
              <p className="text-sm leading-relaxed">{row.text}</p>
            </MessageScrollerItem>
          ))}
        </MessageScrollerContent>
      </MessageScrollerViewport>
      <MessageScrollerButton direction="start" />
      <MessageScrollerButton />
    </MessageScroller>
  )
}

export const Default: Story = {
  render: () => (
    <div className="w-[min(36rem,90vw)] space-y-3">
      <p className="text-sm text-[var(--color-text-3)]">A saved thread opens at its last turn. Scroll or use the direction controls.</p>
      <MessageScrollerProvider defaultScrollPosition="last-anchor">
        <Transcript rows={transcript} />
      </MessageScrollerProvider>
    </div>
  ),
}

const streamedReply = "A good release gives users a predictable experience from the first install. We should preserve the reader’s position while a response grows, make it easy to return to the latest message, and let keyboard users navigate the transcript without losing focus. Loading earlier history should preserve the visible message. The transcript remains a live log, while streamed text can wait for the completed reply before being announced."

function StreamingExample() {
  const [words, setWords] = React.useState(0)
  const [streaming, setStreaming] = React.useState(false)
  const replyWords = streamedReply.split(" ")

  React.useEffect(() => {
    if (!streaming) return
    const timer = window.setInterval(() => setWords((count) => count + 1), 100)
    return () => window.clearInterval(timer)
  }, [streaming])
  React.useEffect(() => {
    if (words >= replyWords.length) setStreaming(false)
  }, [words, replyWords.length])

  const rows = [
    ...transcript,
    ...(words > 0 ? [{ id: "streamed-reply", speaker: "Assistant", text: replyWords.slice(0, words).join(" ") }] : []),
  ]

  return (
    <div className="w-[min(36rem,90vw)] space-y-3">
      <p className="text-sm text-[var(--color-text-3)]">Scroll up during the reply to keep reading history. Jump to the end to resume following.</p>
      <MessageScrollerProvider autoScroll>
        <Transcript rows={rows} streaming={streaming} />
      </MessageScrollerProvider>
      <div className="flex items-center gap-3">
        <Button onClick={() => { setWords(1); setStreaming(true) }} disabled={streaming}>Stream reply</Button>
        <span role="status" className="text-sm text-[var(--color-text-3)]">{streaming ? "Reply in progress" : words > 0 ? "Reply complete" : "Ready"}</span>
      </div>
    </div>
  )
}

export const Streaming: Story = { render: () => <StreamingExample /> }

function HistoryExample() {
  const [loaded, setLoaded] = React.useState(false)
  return (
    <div className="w-[min(36rem,90vw)] space-y-3">
      <p className="text-sm text-[var(--color-text-3)]">Earlier messages appear above without moving the message you are reading.</p>
      <MessageScrollerProvider defaultScrollPosition="start">
        <Transcript rows={loaded ? transcript : transcript.slice(4)} />
      </MessageScrollerProvider>
      <Button variant="outline" disabled={loaded} onClick={() => setLoaded(true)}>{loaded ? "History loaded" : "Load earlier messages"}</Button>
    </div>
  )
}

export const PrependHistory: Story = { render: () => <HistoryExample /> }

function TranscriptControls() {
  const { scrollToMessage, scrollToEnd } = useMessageScroller()
  const { start, end } = useMessageScrollerScrollable()
  const { currentAnchorId } = useMessageScrollerVisibility()
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => scrollToMessage("parity", { behavior: "smooth" })}>Jump to renderer parity</Button>
        <Button variant="outline" size="sm" onClick={() => scrollToEnd({ behavior: "smooth" })}>Jump to latest</Button>
      </div>
      <p className="text-xs text-[var(--color-text-3)]">Current turn: {currentAnchorId ?? "none"}. {start && end ? "History above and below." : start ? "At the latest message." : end ? "At the start." : "All messages visible."}</p>
    </div>
  )
}

export const ExternalControls: Story = {
  render: () => (
    <div className="w-[min(36rem,90vw)] space-y-3">
      <MessageScrollerProvider defaultScrollPosition="start">
        <Transcript rows={transcript} />
        <TranscriptControls />
      </MessageScrollerProvider>
    </div>
  ),
}
