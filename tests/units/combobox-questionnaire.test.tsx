import * as React from "react"
import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToStaticMarkup } from "react-dom/server"
import { composeStories } from "@storybook/react"

import * as comboboxStories from "../../src/components/ui/combobox.stories.js"
import * as questionnaireStories from "../../src/components/ui/questionnaire.stories.js"
import {
  Combobox, ComboboxCommand, ComboboxContent, ComboboxEmpty, ComboboxInput,
  ComboboxItem, ComboboxList, ComboboxTrigger,
} from "../../src/components/ui/combobox.js"
import {
  Questionnaire, QuestionnaireActions, QuestionnaireChoice, QuestionnaireChoices,
  QuestionnaireDescription, QuestionnaireError, QuestionnaireInput, QuestionnaireItem,
  QuestionnaireItemLabel, QuestionnaireNext, QuestionnairePrevious, QuestionnaireProgress,
  QuestionnaireSkip, QuestionnaireSubmit, QuestionnaireTitle,
} from "../../src/components/ui/questionnaire.js"

const { Default: SingleCombobox, MultipleSelection, ClearButton, CustomItems, Groups, Disabled: DisabledCombobox } = composeStories(comboboxStories)
const { Default: SetupQuestionnaire, Resume, DisabledChoice, DisabledItem } = composeStories(questionnaireStories)

describe("Combobox", () => {
  it("filters, announces an empty result, selects by keyboard and dismisses with Escape", async () => {
    const user = userEvent.setup()
    render(<SingleCombobox />)
    const input = screen.getByRole("combobox", { name: "Framework" })
    await user.type(input, "astro")
    expect(await screen.findByRole("option", { name: "Astro" })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: "Next.js" })).not.toBeInTheDocument()
    await user.keyboard("{ArrowDown}{Enter}")
    await waitFor(() => expect(input).toHaveValue("Astro"))
    expect(screen.getByRole("status")).toHaveTextContent("Astro selected")
    expect(input).toHaveAttribute("aria-expanded", "false")
    await user.clear(input)
    await user.type(input, "unavailable")
    expect(await screen.findByText("No framework found.")).toBeInTheDocument()
    await user.keyboard("{Escape}")
    await waitFor(() => expect(input).toHaveAttribute("aria-expanded", "false"))
  })

  it("keeps a controlled selection until its owner updates it", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const items = ["Astro", "React"]
    const view = (value: string | null) => <Combobox items={items} value={value} onValueChange={onValueChange}><ComboboxInput aria-label="Renderer" /><ComboboxContent><ComboboxList>{(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}</ComboboxList></ComboboxContent></Combobox>
    const { rerender } = render(view("Astro"))
    const input = screen.getByRole("combobox", { name: "Renderer" })
    await user.click(screen.getByRole("button"))
    await user.click(await screen.findByRole("option", { name: "React" }))
    expect(onValueChange.mock.calls[0][0]).toBe("React")
    expect(input).toHaveValue("Astro")
    rerender(view("React"))
    expect(input).toHaveValue("React")
  })

  it("adds multiple selections and removes chips with an accessible action", async () => {
    const user = userEvent.setup()
    render(<MultipleSelection />)
    const input = screen.getByRole("combobox", { name: "Supported frameworks" })
    await user.click(input)
    await user.click(await screen.findByRole("option", { name: "Next.js" }))
    await user.keyboard("{Escape}")
    expect(screen.getByRole("status")).toHaveTextContent("2 frameworks selected")
    const removeButtons = screen.getAllByRole("button", { name: /remove/i })
    expect(removeButtons).toHaveLength(2)
    await user.click(removeButtons[0])
    expect(screen.getByRole("status")).toHaveTextContent("1 framework selected")
    expect(document.querySelector('[data-slot="combobox-chip"]')).toHaveTextContent("Next.js")
  })

  it("clears a selection and displays object labels rather than object stringification", async () => {
    const user = userEvent.setup()
    const { unmount } = render(<ClearButton />)
    await user.click(screen.getByRole("button"))
    await user.click(await screen.findByRole("option", { name: "Astro" }))
    await user.click(screen.getByRole("button", { name: "Clear selection" }))
    expect(screen.getByRole("combobox", { name: "Framework" })).toHaveValue("")
    expect(screen.getByRole("status")).toHaveTextContent("Choose the framework")
    unmount()
    render(<CustomItems />)
    expect(screen.getByRole("combobox", { name: "Workspace" })).toHaveValue("Studio")
    await user.click(screen.getByRole("button", { name: "Clear selection" }))
    await user.type(screen.getByRole("combobox", { name: "Workspace" }), "engineering")
    expect(await screen.findByRole("option", { name: /Engineering/ })).toBeInTheDocument()
  })

  it("disables both text entry and popup interaction", async () => {
    const user = userEvent.setup()
    render(<DisabledCombobox />)
    expect(screen.getByRole("combobox", { name: "Framework" })).toBeDisabled()
    expect(screen.getByRole("button")).toBeDisabled()
    await user.click(screen.getByRole("button"))
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
  })

  it("filters grouped collections and keeps group labels associated with their options", async () => {
    const user = userEvent.setup()
    render(<Groups />)
    const input = screen.getByRole("combobox")
    await user.click(input)
    expect(await screen.findByRole("group", { name: "Content focused" })).toBeInTheDocument()
    expect(screen.getByRole("group", { name: "Application focused" })).toBeInTheDocument()
    await user.type(input, "astro")
    const astro = await screen.findByRole("option", { name: "Astro" })
    const group = astro.closest('[data-slot="combobox-group"]')!
    expect(document.getElementById(group.getAttribute("aria-labelledby")!)?.textContent).toContain("Content focused")
    await user.click(astro)
    expect(input).toHaveValue("Astro")
  })

  it("preserves the original popover and command composition", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Combobox><ComboboxTrigger asChild><button type="button">Choose renderer</button></ComboboxTrigger><ComboboxContent><ComboboxCommand><ComboboxInput aria-label="Search renderers" /><ComboboxList><ComboboxEmpty>No renderer.</ComboboxEmpty><ComboboxItem value="astro" onSelect={onSelect}>Astro</ComboboxItem></ComboboxList></ComboboxCommand></ComboboxContent></Combobox>)
    await user.click(screen.getByRole("button", { name: "Choose renderer" }))
    await user.click(await screen.findByRole("option", { name: "Astro" }))
    expect(onSelect).toHaveBeenCalledWith("astro")
  })

  it("server renders the real input with its accessible name and disabled state", () => {
    const markup = renderToStaticMarkup(<DisabledCombobox />)
    expect(markup).toContain('role="combobox"')
    expect(markup).toContain('id="framework"')
    expect(markup).toContain("disabled")
    expect(markup).not.toContain("font-mono")
  })
})

describe("Questionnaire", () => {
  it("validates required answers, preserves them while navigating, records skips and submits native FormData", async () => {
    const user = userEvent.setup()
    render(<SetupQuestionnaire />)
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "3")
    expect(screen.getByRole("group", { name: "What best describes your role?" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Next" }))
    expect(document.querySelector('fieldset[data-active] [data-slot="questionnaire-error"]')).toBeVisible()
    expect(document.querySelector('fieldset[data-active] [data-slot="questionnaire-error"]')).toHaveTextContent("Choose an answer")
    const design = screen.getByRole("radio", { name: /Design/ })
    expect(design).toHaveFocus()
    await user.click(design)
    await user.click(screen.getByRole("button", { name: "Next" }))
    expect(screen.getByRole("group", { name: "Which updates would be useful?" })).toBeVisible()
    await user.click(screen.getByRole("button", { name: "Previous" }))
    expect(design).toBeChecked()
    await user.click(screen.getByRole("button", { name: "Next" }))
    await user.click(screen.getByRole("button", { name: "Skip" }))
    await user.type(screen.getByRole("textbox", { name: "Workspace name" }), "Studio practice")
    await user.click(screen.getByRole("button", { name: "Save answers" }))
    expect(await screen.findByRole("status")).toHaveTextContent("design")
    expect(screen.getByRole("status")).toHaveTextContent("Studio practice")
    expect(screen.getByRole("status")).toHaveTextContent("Skipped")
  })

  it("serializes multiple answers and restores initial answers and item on native reset", async () => {
    const user = userEvent.setup()
    const items = [{ name: "tools", required: true, choices: [{ value: "astro" }, { value: "react" }] }, { name: "note", required: true }]
    const submitted = vi.fn()
    render(<Questionnaire items={items} onSubmit={(event) => { event.preventDefault(); submitted(new FormData(event.currentTarget).getAll("tools")) }}><QuestionnaireProgress /><QuestionnaireItem name="tools" multiple required><QuestionnaireTitle>Tools</QuestionnaireTitle><QuestionnaireChoices><QuestionnaireChoice value="astro" defaultChecked>Astro</QuestionnaireChoice><QuestionnaireChoice value="react">React</QuestionnaireChoice></QuestionnaireChoices><QuestionnaireError /></QuestionnaireItem><QuestionnaireItem name="note" required><QuestionnaireTitle>Note</QuestionnaireTitle><QuestionnaireInput aria-label="Note" defaultValue="Starting note" /></QuestionnaireItem><QuestionnaireActions><QuestionnairePrevious /><QuestionnaireNext /><QuestionnaireSubmit /></QuestionnaireActions><button type="reset">Reset</button></Questionnaire>)
    await user.click(screen.getByRole("checkbox", { name: "React" }))
    await user.click(screen.getByRole("button", { name: "Next" }))
    await user.click(screen.getByRole("button", { name: "Submit" }))
    expect(submitted).toHaveBeenCalledWith(["astro", "react"])
    await user.click(screen.getByRole("button", { name: "Reset" }))
    await waitFor(() => expect(screen.getByRole("checkbox", { name: "React" })).not.toBeChecked())
    expect(screen.getByRole("checkbox", { name: "Astro" })).toBeChecked()
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1")
  })

  it("excludes disabled choices and disabled questions from the active flow", async () => {
    const user = userEvent.setup()
    const { unmount } = render(<DisabledChoice />)
    expect(screen.getByRole("radio", { name: /Enterprise/ })).toBeDisabled()
    await user.click(screen.getByRole("radio", { name: /Enterprise/ }))
    expect(screen.getByRole("radio", { name: /Enterprise/ })).not.toBeChecked()
    unmount()
    render(<DisabledItem />)
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "2")
    await user.click(screen.getByRole("radio", { name: /Design/ }))
    await user.click(screen.getByRole("button", { name: "Next" }))
    expect(screen.getByRole("textbox", { name: "Workspace name" })).toBeVisible()
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument()
  })

  it("supports controlled navigation, freeform answers and keyboard shortcuts", async () => {
    const user = userEvent.setup()
    const onItemChange = vi.fn()
    function Controlled() {
      const [item, setItem] = React.useState("choice")
      return <Questionnaire items={[{ name: "choice", required: true, choices: [{ value: "astro" }] }, { name: "text", required: true }]} item={item} onItemChange={(next) => { setItem(next); onItemChange(next) }} shortcuts="letters"><QuestionnaireItem name="choice" required><QuestionnaireTitle>Renderer</QuestionnaireTitle><QuestionnaireChoices><QuestionnaireChoice value="astro">Astro</QuestionnaireChoice></QuestionnaireChoices><QuestionnaireError /></QuestionnaireItem><QuestionnaireItem name="text" required><QuestionnaireTitle>Project name</QuestionnaireTitle><QuestionnaireDescription>A short name.</QuestionnaireDescription><QuestionnaireInput aria-label="Project name" /></QuestionnaireItem><QuestionnaireActions><QuestionnairePrevious /><QuestionnaireNext /><QuestionnaireSubmit /></QuestionnaireActions></Questionnaire>
    }
    render(<Controlled />)
    screen.getByRole("group", { name: "Renderer" }).focus()
    await user.keyboard("a")
    expect(screen.getByRole("radio", { name: /Astro/ })).toBeChecked()
    await user.keyboard("{Control>}{Enter}{/Control}")
    expect(onItemChange).toHaveBeenCalledWith("text")
    const input = screen.getByRole("textbox", { name: "Project name" })
    expect(screen.getByRole("group", { name: "Project name" })).toHaveAccessibleDescription("A short name.")
    await user.type(input, "Astro")
    expect(input).toHaveValue("Astro")
  })

  it("server renders progress and the initial active step using story definitions", () => {
    const markup = renderToStaticMarkup(<Resume />)
    const doc = new DOMParser().parseFromString(markup, "text/html")
    expect(doc.querySelector('[data-slot="questionnaire-progress"]')).toHaveAttribute("aria-valuenow", "2")
    expect(doc.querySelector('[data-slot="questionnaire"]')).toHaveAttribute("data-total", "3")
    expect(doc.querySelector('fieldset[data-active]')?.textContent).toContain("Which updates would be useful?")
    expect(markup).not.toContain("font-mono")
  })

  it("keeps legacy static form choices and numeric progress operational", async () => {
    const user = userEvent.setup()
    const submit = vi.fn()
    render(<Questionnaire onSubmit={(event) => { event.preventDefault(); submit(new FormData(event.currentTarget).get("role")) }}><QuestionnaireProgress value={1} max={3} /><QuestionnaireItem><QuestionnaireItemLabel>Role</QuestionnaireItemLabel><QuestionnaireChoices name="role" defaultValue="design"><QuestionnaireChoice value="design" label="Design" /><QuestionnaireChoice value="engineering" label="Engineering" /></QuestionnaireChoices></QuestionnaireItem><button type="submit">Save legacy</button></Questionnaire>)
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1")
    await user.click(screen.getByRole("radio", { name: "Engineering" }))
    fireEvent.submit(screen.getByRole("button", { name: "Save legacy" }).closest("form")!)
    expect(submit).toHaveBeenCalledWith("engineering")
  })
})
