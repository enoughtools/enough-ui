import type { Meta, StoryObj } from "@storybook/react-vite"
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "./bubble.js"

const meta = { title: "UI/Bubble", component: Bubble, parameters: { renderer: "react", layout: "centered" }, tags: ["autodocs"] } satisfies Meta<typeof Bubble>
export default meta
type Story = StoryObj<typeof meta>

export const Conversation: Story = {
  render: () => <BubbleGroup className="w-[min(32rem,calc(100vw-2rem))]">
    <Bubble variant="secondary"><BubbleContent>Everything is ready for your review.</BubbleContent><BubbleReactions aria-label="Reactions"><span aria-label="One thumbs up reaction">👍 1</span></BubbleReactions></Bubble>
    <Bubble align="end"><BubbleContent>Great. I’ll take a look this afternoon.</BubbleContent></Bubble>
    <Bubble variant="ghost"><BubbleContent>Let me know if you want to walk through any of the changes together.</BubbleContent></Bubble>
  </BubbleGroup>,
}
export const Variants: Story = {
  render: () => <BubbleGroup className="w-[min(32rem,calc(100vw-2rem))]">{(["default", "secondary", "muted", "tinted", "outline", "ghost", "destructive"] as const).map(variant => <Bubble variant={variant} key={variant}><BubbleContent>{variant === "destructive" ? "The message could not be delivered. Please try again." : `${variant[0].toUpperCase()}${variant.slice(1)} bubble: the report is ready to review.`}</BubbleContent></Bubble>)}</BubbleGroup>,
}
export const Link: Story = {
  render: () => <Bubble variant="tinted"><BubbleContent asChild><a href="#release-notes">Read the release notes</a></BubbleContent></Bubble>,
}
export const ReactionPositions: Story = {
  render: () => <BubbleGroup className="w-[min(32rem,calc(100vw-2rem))]">{(["top", "bottom"] as const).flatMap(side => (["start", "end"] as const).map(align => <Bubble variant="secondary" key={`${side}-${align}`}><BubbleContent>Reaction at the {side} {align} edge.</BubbleContent><BubbleReactions side={side} align={align}><span aria-label="One heart reaction">♥ 1</span></BubbleReactions></Bubble>))}</BubbleGroup>,
}
