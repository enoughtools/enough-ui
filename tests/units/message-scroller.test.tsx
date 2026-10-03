import * as React from "react"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

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
  type MessageScrollerButtonProps,
  type MessageScrollerProviderProps,
} from "../../src/components/ui/message-scroller.js"

type Row = { id: string; height?: number; anchor?: boolean }
const rows: Row[] = Array.from({ length: 5 }, (_, index) => ({ id: `message-${index + 1}` }))
let commands: ReturnType<typeof useMessageScroller>
let scrollable: ReturnType<typeof useMessageScrollerScrollable>
let visibility: ReturnType<typeof useMessageScrollerVisibility>

function Probe() {
  commands = useMessageScroller()
  scrollable = useMessageScrollerScrollable()
  visibility = useMessageScrollerVisibility()
  return null
}

function Fixture({
  messages = rows,
  buttonProps,
  viewportRef,
  ...providerProps
}: MessageScrollerProviderProps & {
  messages?: Row[]
  buttonProps?: MessageScrollerButtonProps
  viewportRef?: React.Ref<HTMLDivElement>
}) {
  return (
    <MessageScrollerProvider {...providerProps}>
      <MessageScroller>
        <MessageScrollerViewport ref={viewportRef}>
          <MessageScrollerContent style={{ padding: 0, gap: 0 }}>
            {messages.map((row) => (
              <MessageScrollerItem key={row.id} messageId={row.id} scrollAnchor={row.anchor} data-test-height={row.height ?? 100}>
                {row.id}
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton {...buttonProps} />
        <MessageScrollerButton direction="start" />
      </MessageScroller>
      <Probe />
    </MessageScrollerProvider>
  )
}

class TestResizeObserver {
  static instances = new Set<TestResizeObserver>()
  targets = new Set<Element>()
  constructor(private callback: ResizeObserverCallback) {
    TestResizeObserver.instances.add(this)
  }
  observe(element: Element) { this.targets.add(element) }
  unobserve(element: Element) { this.targets.delete(element) }
  disconnect() { this.targets.clear(); TestResizeObserver.instances.delete(this) }
  trigger() { this.callback([], this as unknown as ResizeObserver) }
}

function getHeight(element: HTMLElement) {
  if (element.hidden) return 0
  if (element.hasAttribute("data-message-scroller-spacer")) return Number.parseFloat(element.style.height) || 0
  return Number(element.dataset.testHeight ?? 0)
}

function getContentHeight(element: HTMLElement) {
  const content = element.dataset.slot === "message-scroller-content"
    ? element : element.querySelector<HTMLElement>("[data-slot=message-scroller-content]")
  return content ? Array.from(content.children).reduce((sum, child) => sum + getHeight(child as HTMLElement), 0) : 0
}

let scrollTo: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  vi.useFakeTimers()
  TestResizeObserver.instances.clear()
  vi.stubGlobal("ResizeObserver", TestResizeObserver)
  vi.stubGlobal("IntersectionObserver", undefined)
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => window.setTimeout(() => callback(0), 16))
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => window.clearTimeout(id))
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(function (this: HTMLElement) {
    return this.dataset.slot === "message-scroller-viewport" ? 200 : getHeight(this)
  })
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(function (this: HTMLElement) {
    return this.dataset.slot === "message-scroller-viewport" ? Math.max(200, getContentHeight(this)) : getHeight(this)
  })
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const viewport = this.closest<HTMLElement>("[data-slot=message-scroller-viewport]")
    let top = 0
    let height = getHeight(this)
    if (this.dataset.slot === "message-scroller-viewport") {
      height = 200
    } else if (viewport) {
      top = -viewport.scrollTop
      if (this.dataset.slot === "message-scroller-content") {
        height = getContentHeight(this)
      } else if (this.parentElement?.dataset.slot === "message-scroller-content") {
        for (const sibling of Array.from(this.parentElement.children)) {
          if (sibling === this) break
          top += getHeight(sibling as HTMLElement)
        }
      }
    }
    return { x: 0, y: top, top, left: 0, bottom: top + height, right: 400, width: 400, height, toJSON() {} }
  })
  scrollTo = vi.spyOn(HTMLElement.prototype, "scrollTo").mockImplementation(function (this: HTMLElement, options?: ScrollToOptions | number, y?: number) {
    const top = typeof options === "number" ? y : options?.top
    if (typeof top === "number") this.scrollTop = Math.max(0, top)
  })
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

async function settle() {
  await act(async () => { await vi.advanceTimersByTimeAsync(48) })
}

async function resize() {
  await act(async () => {
    for (const observer of TestResizeObserver.instances) observer.trigger()
    await vi.advanceTimersByTimeAsync(48)
  })
}

function viewport() { return screen.getByRole("region", { name: "Messages" }) }

describe("MessageScroller", () => {
  it("provides a keyboard reachable live transcript and hides inactive direction controls", async () => {
    render(<Fixture defaultScrollPosition="start" />)
    await settle()
    expect(viewport()).toHaveAttribute("tabindex", "0")
    expect(screen.getByRole("log")).toHaveAttribute("aria-relevant", "additions")
    expect(scrollable).toEqual({ start: false, end: true })
    const start = screen.getByRole("button", { name: "Scroll to start" })
    expect(start).toHaveAttribute("inert")
    expect(start).toHaveAttribute("tabindex", "-1")
    expect(start).toHaveAttribute("data-active", "false")
    expect(screen.getByRole("button", { name: "Scroll to end" })).not.toHaveAttribute("inert")
  })

  it("scrolls in each direction, updates the hooks, and forwards the viewport ref", async () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<Fixture defaultScrollPosition="start" viewportRef={ref} />)
    await settle()
    expect(ref.current).toBe(viewport())
    fireEvent.click(screen.getByRole("button", { name: "Scroll to end" }))
    await settle()
    expect(viewport().scrollTop).toBe(300)
    expect(scrollable).toEqual({ start: true, end: false })
    fireEvent.click(screen.getByRole("button", { name: "Scroll to start" }))
    await settle()
    expect(viewport().scrollTop).toBe(0)
  })

  it("does not follow appended messages by default", async () => {
    const view = render(<Fixture />)
    await settle()
    expect(viewport().scrollTop).toBe(300)
    view.rerender(<Fixture messages={[...rows, { id: "new-reply" }]} />)
    await settle()
    await resize()
    expect(viewport().scrollTop).toBe(300)
    expect(scrollable.end).toBe(true)
  })

  it.each(["wheel", "keyboard", "touch", "scrollbar"])("holds reading position through streamed growth after %s navigation", async (intent) => {
    render(<Fixture autoScroll />)
    await settle()
    await act(async () => { await vi.advanceTimersByTimeAsync(200) })
    const region = viewport()
    if (intent === "wheel") fireEvent.wheel(region, { deltaY: -100 })
    if (intent === "keyboard") fireEvent.keyDown(region, { key: "PageUp" })
    if (intent === "touch") fireEvent.touchMove(region)
    region.scrollTop = 120
    fireEvent.scroll(region)
    await settle()
    const latest = screen.getByText("message-5")
    latest.dataset.testHeight = "250"
    await resize()
    expect(region.scrollTop).toBe(120)
    expect(scrollable.end).toBe(true)
    fireEvent.click(screen.getByRole("button", { name: "Scroll to end" }))
    await settle()
    expect(region.scrollTop).toBe(450)
    latest.dataset.testHeight = "300"
    await resize()
    expect(region.scrollTop).toBe(500)
  })

  it("preserves the visible row while earlier history is prepended", async () => {
    const view = render(<Fixture defaultScrollPosition="start" />)
    await settle()
    viewport().scrollTop = 120
    fireEvent.scroll(viewport())
    await settle()
    const readingRow = screen.getByText("message-2")
    const before = readingRow.getBoundingClientRect().top
    view.rerender(<Fixture defaultScrollPosition="start" messages={[{ id: "earlier-1" }, { id: "earlier-2" }, ...rows]} />)
    await settle()
    await resize()
    expect(readingRow.getBoundingClientRect().top).toBe(before)
    expect(viewport().scrollTop).toBe(320)
  })

  it("opens a tall saved turn at its last anchor and reports the visible turn", async () => {
    render(<Fixture defaultScrollPosition="last-anchor" messages={[
      ...rows.slice(0, 3), { id: "last-prompt", anchor: true }, { id: "long-reply", height: 350 },
    ]} />)
    await settle()
    expect(screen.getByText("last-prompt").getBoundingClientRect().top).toBe(64)
    expect(visibility.currentAnchorId).toBe("last-prompt")
    expect(visibility.visibleMessageIds).toContain("last-prompt")
  })

  it("queues an early message jump and rejects a missing mounted target", async () => {
    const view = render(<Fixture messages={[]} />)
    await settle()
    expect(commands.scrollToMessage("message-3")).toBe(true)
    view.rerender(<Fixture />)
    await settle()
    expect(viewport().scrollTop).toBe(200)
    expect(commands.scrollToMessage("missing-message")).toBe(false)
  })

  it("preserves custom render targets, button refs, and cancelable click handlers", async () => {
    const ref = React.createRef<HTMLButtonElement>()
    const cancel = vi.fn((event: React.MouseEvent) => event.preventDefault())
    render(<Fixture defaultScrollPosition="start" buttonProps={{ render: <button data-custom="true" />, ref, onClick: cancel, children: "Latest reply" }} />)
    await settle()
    const button = screen.getByRole("button", { name: "Latest reply" })
    expect(button).toHaveAttribute("data-custom", "true")
    expect(ref.current).toBe(button)
    fireEvent.click(button)
    await settle()
    expect(cancel).toHaveBeenCalledOnce()
    expect(viewport().scrollTop).toBe(0)
  })

  it("honors reduced motion for scroll buttons and imperative smooth jumps", async () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true, media: "(prefers-reduced-motion: reduce)", onchange: null,
      addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false,
    })
    render(<Fixture defaultScrollPosition="start" />)
    await settle()
    scrollTo.mockClear()
    fireEvent.click(screen.getByRole("button", { name: "Scroll to end" }))
    await settle()
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 300, behavior: "auto" })
    act(() => { commands.scrollToMessage("message-2", { behavior: "smooth" }) })
    await settle()
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 100, behavior: "auto" })
  })
})
