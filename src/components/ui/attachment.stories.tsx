import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { Attachment, AttachmentAction, AttachmentActions, AttachmentContent, AttachmentDescription, AttachmentGroup, AttachmentMedia, AttachmentTitle, AttachmentTrigger, type AttachmentState } from "./attachment.js"

const meta = { title: "UI/Attachment", component: Attachment, parameters: { renderer: "react", layout: "centered" }, tags: ["autodocs"] } satisfies Meta<typeof Attachment>
export default meta
type Story = StoryObj<typeof meta>

const FileIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></svg>
const pdf = "data:application/pdf;base64,JVBERi0xLjQKJSVFT0Y="

export const File: Story = {
  render: () => <Attachment className="max-w-[min(30rem,calc(100vw-2rem))]">
    <AttachmentMedia><FileIcon /></AttachmentMedia>
    <AttachmentContent><AttachmentTitle>research-summary.pdf</AttachmentTitle><AttachmentDescription>PDF · 2.4 MB</AttachmentDescription></AttachmentContent>
    <AttachmentActions><AttachmentAction asChild size="sm" aria-label="Download research-summary.pdf"><a href={pdf} download="research-summary.pdf">Download</a></AttachmentAction></AttachmentActions>
    <AttachmentTrigger asChild><a href={pdf} aria-label="Open research-summary.pdf" target="_blank" rel="noreferrer" /></AttachmentTrigger>
  </Attachment>,
}

function UploadList() {
  const [showFile, setShowFile] = React.useState(true)
  return <div className="w-[min(30rem,calc(100vw-2rem))] space-y-4">
    <p className="font-sans text-sm">Attachments ready to send</p>
    {showFile ? <Attachment state="idle"><AttachmentMedia><FileIcon /></AttachmentMedia><AttachmentContent><AttachmentTitle>project-brief.pdf</AttachmentTitle><AttachmentDescription>Ready to upload · 820 KB</AttachmentDescription></AttachmentContent><AttachmentActions><AttachmentAction aria-label="Remove project-brief.pdf" onClick={() => setShowFile(false)}><span aria-hidden="true">×</span></AttachmentAction></AttachmentActions></Attachment> : <p role="status" className="font-sans text-sm">project-brief.pdf removed.</p>}
  </div>
}
export const Removable: Story = { render: () => <UploadList /> }

export const States: Story = {
  render: () => <div className="flex w-[min(30rem,calc(100vw-2rem))] flex-col items-start gap-4">{([
    ["idle", "Ready to upload"], ["uploading", "Uploading · 64%"], ["processing", "Processing document"], ["error", "Upload failed. Please try again."], ["done", "Uploaded · 1.8 MB"],
  ] satisfies [AttachmentState, string][]).map(([state, description]) => <Attachment key={state} state={state}><AttachmentMedia><FileIcon /></AttachmentMedia><AttachmentContent><AttachmentTitle>{state}-report.pdf</AttachmentTitle><AttachmentDescription>{description}</AttachmentDescription></AttachmentContent></Attachment>)}</div>,
}

export const Sizes: Story = {
  render: () => <div className="flex flex-col items-start gap-4">{(["default", "sm", "xs"] as const).map(size => <Attachment key={size} size={size}><AttachmentMedia><FileIcon /></AttachmentMedia><AttachmentContent><AttachmentTitle>{size}-report.pdf</AttachmentTitle><AttachmentDescription>PDF · 2.4 MB</AttachmentDescription></AttachmentContent></Attachment>)}</div>,
}

export const ImageGroup: Story = {
  render: () => <AttachmentGroup className="w-[min(30rem,calc(100vw-2rem))]" tabIndex={0} role="group" aria-label="Attached images">{["Cover", "Diagram", "Screenshot", "Palette"].map((name, index) => <Attachment key={name} orientation="vertical"><AttachmentMedia variant="image"><img src={`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" fill="${["#f5c9ac", "#cadbc7", "#d5cee1", "#bad8dc"][index]}"/><circle cx="80" cy="80" r="40" fill="#333"/></svg>`)}`} alt={`${name} preview`} width={160} height={160} /></AttachmentMedia><AttachmentContent><AttachmentTitle>{name.toLowerCase()}.png</AttachmentTitle><AttachmentDescription>PNG · 420 KB</AttachmentDescription></AttachmentContent></Attachment>)}</AttachmentGroup>,
}
