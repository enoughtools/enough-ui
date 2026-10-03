import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "./button.js"
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "./questionnaire.js"

type Question = {
  name: string
  required: boolean
  multiple?: boolean
  disabled?: boolean
  prompt: string
  description: string
  choices: {
    value: string
    label: string
    description?: string
    disabled?: boolean
  }[]
  input?: { label: string; placeholder: string }
}

const setupQuestions: Question[] = [
  {
    name: "role",
    required: true,
    prompt: "What best describes your role?",
    description: "Choose one answer or describe your role. An answer is required.",
    choices: [
      { value: "design", label: "Design", description: "Research, systems, product, or visual design" },
      { value: "engineering", label: "Engineering", description: "Frontend, backend, platform, or data" },
      { value: "product", label: "Product", description: "Strategy, operations, or programme leadership" },
    ],
    input: { label: "Another role", placeholder: "Describe another role…" },
  },
  {
    name: "updates",
    required: false,
    multiple: true,
    prompt: "Which updates would be useful?",
    description: "Select all that apply, or skip this optional question.",
    choices: [
      { value: "weekly", label: "Weekly progress" },
      { value: "releases", label: "Product releases" },
      { value: "research", label: "Research and inspiration" },
    ],
  },
  {
    name: "workspace",
    required: true,
    prompt: "What should we call your workspace?",
    description: "Keep it short so it reads clearly in navigation. A name is required.",
    choices: [],
    input: { label: "Workspace name", placeholder: "For example, Studio practice" },
  },
]

const planQuestions: Question[] = [
  {
    name: "plan",
    required: true,
    prompt: "Choose a workspace plan",
    description: "Choose one available mode before continuing.",
    choices: [
      { value: "personal", label: "Personal", description: "A focused space for individual work" },
      { value: "team", label: "Team", description: "Shared projects and collaborative reviews" },
      {
        value: "enterprise",
        label: "Enterprise",
        description: "Contact an administrator to enable this option",
        disabled: true,
      },
    ],
  },
]

function QuestionnaireDemo({
  questions = setupQuestions,
  resume = false,
}: {
  questions?: Question[]
  resume?: boolean
}) {
  const [submitted, setSubmitted] = React.useState<Record<string, string[]> | null>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const answers = new FormData(event.currentTarget)
    setSubmitted(
      Object.fromEntries(
        questions
          .filter((question) => !question.disabled)
          .map((question) => [question.name, answers.getAll(question.name).map(String)])
      )
    )
  }

  return (
    <div className="grid gap-5">
      <Questionnaire
        items={questions}
        defaultItem={resume ? "updates" : undefined}
        onSubmit={handleSubmit}
        onReset={() => setSubmitted(null)}
      >
        <QuestionnaireProgress />
        {questions.map((question) => (
          <QuestionnaireItem
            key={question.name}
            name={question.name}
            required={question.required}
            multiple={question.multiple}
            disabled={question.disabled}
          >
            <QuestionnaireTitle>{question.prompt}</QuestionnaireTitle>
            <QuestionnaireDescription>{question.description}</QuestionnaireDescription>
            <QuestionnaireChoices>
              {question.choices.map((choice, index) => (
                <QuestionnaireChoice
                  key={choice.value}
                  value={choice.value}
                  disabled={choice.disabled}
                  defaultChecked={resume && index === 0}
                >
                  <span className="font-sans text-sm font-semibold">{choice.label}</span>
                  {choice.description ? (
                    <QuestionnaireChoiceDescription>
                      {choice.description}
                    </QuestionnaireChoiceDescription>
                  ) : null}
                </QuestionnaireChoice>
              ))}
              {question.input ? (
                <QuestionnaireInput
                  aria-label={question.input.label}
                  placeholder={question.input.placeholder}
                  defaultValue={resume && question.name === "workspace" ? "Studio practice" : undefined}
                />
              ) : null}
            </QuestionnaireChoices>
            <QuestionnaireError />
          </QuestionnaireItem>
        ))}
        <QuestionnaireActions>
          <QuestionnairePrevious />
          <QuestionnaireSkip />
          <QuestionnaireNext />
          <QuestionnaireSubmit>{resume ? "Update draft" : "Save answers"}</QuestionnaireSubmit>
        </QuestionnaireActions>
        {resume ? (
          <div className="flex justify-end">
            <Button type="reset" variant="outline">Reset changes</Button>
          </div>
        ) : null}
      </Questionnaire>
      {submitted ? (
        <div
          role="status"
          className="border border-[var(--color-ink)] bg-[var(--color-accent-soft)] p-5 font-sans"
        >
          <p className="mb-3 text-sm font-semibold">Your answers are ready.</p>
          <dl className="grid gap-2 text-sm">
            {questions.filter((question) => !question.disabled).map((question) => (
              <div key={question.name} className="grid gap-1">
                <dt className="font-semibold">{question.prompt}</dt>
                <dd className="text-[var(--color-text-3)]">
                  {submitted[question.name]?.join(", ") || "Skipped"}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </div>
  )
}

const meta = {
  title: "UI/Questionnaire",
  component: Questionnaire,
  tags: ["autodocs"],
  parameters: { renderer: "react", layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[min(680px,calc(100vw-32px))] py-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Questionnaire>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <QuestionnaireDemo />,
}

export const MultipleSelection: Story = {
  render: () => <QuestionnaireDemo questions={[{ ...setupQuestions[1], required: true }]} />,
}

export const Freeform: Story = {
  render: () => <QuestionnaireDemo questions={[setupQuestions[2]]} />,
}

export const Resume: Story = {
  render: () => <QuestionnaireDemo resume />,
}

export const DisabledChoice: Story = {
  render: () => <QuestionnaireDemo questions={planQuestions} />,
}

export const DisabledItem: Story = {
  render: () => (
    <QuestionnaireDemo
      questions={setupQuestions.map((question) => ({
        ...question,
        disabled: question.name === "updates",
      }))}
    />
  ),
}
