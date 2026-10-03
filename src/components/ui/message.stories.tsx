import type { Meta, StoryObj } from "@storybook/react-vite"
import { Bubble, BubbleContent } from "./bubble.js"
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader } from "./message.js"
import { Button } from "./button.js"

const meta = { title: "UI/Message", component: Message, parameters: { renderer: "react", layout: "centered" }, tags: ["autodocs"] } satisfies Meta<typeof Message>
export default meta
type Story = StoryObj<typeof meta>

export const Conversation: Story = {
  render: () => <MessageGroup className="w-[min(38rem,calc(100vw-2rem))]">
    <Message><MessageAvatar aria-hidden="true" className="h-8 w-8 text-xs font-semibold">AL</MessageAvatar><MessageContent><MessageHeader><span>Alex</span><time dateTime="2026-10-03T14:00:00">2:00 PM</time></MessageHeader><Bubble variant="secondary"><BubbleContent>The release notes are ready. Could you check the examples?</BubbleContent></Bubble><MessageFooter><Button size="icon-xs" variant="ghost" aria-label="Copy Alex’s message" onClick={() => void navigator.clipboard?.writeText("The release notes are ready. Could you check the examples?")}><span aria-hidden="true">⧉</span></Button><span>Delivered</span></MessageFooter></MessageContent></Message>
    <Message align="end"><MessageContent><MessageHeader><span>You</span><time dateTime="2026-10-03T14:01:00">2:01 PM</time></MessageHeader><Bubble><BubbleContent>On it. I’ll send feedback shortly.</BubbleContent></Bubble><MessageFooter>Read by Alex</MessageFooter></MessageContent></Message>
  </MessageGroup>,
}
export const Assistant: Story = {
  render: () => <Message className="w-[min(38rem,calc(100vw-2rem))]"><MessageContent><MessageHeader>Enough assistant</MessageHeader><Bubble variant="ghost"><BubbleContent><p>The migration is complete. Both renderers now share their component styles.</p><ul className="mt-3 list-disc space-y-1 ps-5"><li>Static content uses native Astro markup.</li><li>Interactive controls use React islands.</li></ul></BubbleContent></Bubble><MessageFooter><Button variant="outline" size="sm" aria-label="Copy migration summary" onClick={() => void navigator.clipboard?.writeText("The migration is complete.")}>Copy summary</Button></MessageFooter></MessageContent></Message>,
}
