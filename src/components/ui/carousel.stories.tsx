import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, waitFor, within } from "storybook/test"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel.js"

const meta = {
  title: "UI/Carousel",
  component: Carousel,
  tags: ["autodocs"],
  parameters: {
    renderer: 'react',
    layout: "centered",
  },
} satisfies Meta<typeof Carousel>

export default meta
type Story = StoryObj<typeof meta>

const slides = [
  { number: "01", label: "Research", detail: "Map the problem space" },
  { number: "02", label: "Structure", detail: "Define the system" },
  { number: "03", label: "Compose", detail: "Build the experience" },
  { number: "04", label: "Refine", detail: "Test every edge" },
  { number: "05", label: "Ship", detail: "Release with intent" },
]

export const Default: Story = {
  render: () => (
    <Carousel
      aria-label="Project phases"
      className="w-[min(680px,calc(100vw-96px))]"
      opts={{ align: "start" }}
    >
      <CarouselContent>
        {slides.map((slide) => (
          <CarouselItem key={slide.number} className="basis-full sm:basis-1/2 lg:basis-1/3">
            <article className="flex min-h-[220px] flex-col justify-between border border-[var(--color-ink)] bg-[var(--color-surface)] p-[24px] shadow-[var(--shadow-palette)] rounded-none">
              <span className="font-sans text-[12px] tracking-[0.12em] text-[var(--color-accent)]">
                {slide.number}
              </span>
              <div>
                <h3 className="font-serif text-[26px] text-[var(--color-ink)]">
                  {slide.label}
                </h3>
                <p className="mt-[6px] font-sans text-[14px] text-[var(--color-ink)]">
                  {slide.detail}
                </p>
              </div>
            </article>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const carousel = canvas.getByRole("region", { name: "Project phases" })
    const viewport = carousel.querySelector("[data-carousel-mounted]")
    const track = viewport?.firstElementChild

    await waitFor(() => {
      expect(viewport).toHaveAttribute("data-carousel-mounted", "true")
    })
    expect(track).toHaveClass("opacity-100", "translate-x-0", "motion-reduce:transition-none")

    const previous = canvas.getByRole("button", { name: "Previous slide" })
    const next = canvas.getByRole("button", { name: "Next slide" })
    expect(previous).toBeDisabled()
    expect(next).toBeEnabled()

    await userEvent.click(next)
    await waitFor(() => expect(previous).toBeEnabled())
  },
}

export const Vertical: Story = {
  render: () => (
    <Carousel
      aria-label="Vertical project phases"
      orientation="vertical"
      className="w-[min(440px,calc(100vw-96px))]"
      opts={{ align: "start" }}
    >
      <CarouselContent className="h-[360px]">
        {slides.slice(0, 3).map((slide) => (
          <CarouselItem key={slide.number} className="basis-1/2">
            <article className="flex h-full items-center justify-between border border-[var(--color-ink)] bg-[var(--color-surface)] px-[24px] shadow-[var(--shadow-card)] rounded-none">
              <div>
                <p className="font-sans text-[11px] tracking-[0.12em] text-[var(--color-accent)]">
                  PHASE {slide.number}
                </p>
                <h3 className="mt-[8px] font-serif text-[24px] text-[var(--color-ink)]">
                  {slide.label}
                </h3>
              </div>
              <span className="font-sans text-[13px] text-[var(--color-ink)]">
                {slide.detail}
              </span>
            </article>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const carousel = canvas.getByRole("region", { name: "Vertical project phases" })
    const viewport = carousel.querySelector("[data-carousel-mounted]")
    const track = viewport?.firstElementChild

    await waitFor(() => {
      expect(viewport).toHaveAttribute("data-carousel-mounted", "true")
    })
    expect(track).toHaveClass("opacity-100", "translate-y-0", "motion-reduce:transition-none")
  },
}
