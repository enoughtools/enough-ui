import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { Attachment, AttachmentAction, AttachmentActions, AttachmentContent, AttachmentDescription, AttachmentMedia, AttachmentTitle, AttachmentTrigger } from '../../src/components/ui/attachment.js'
import { Bubble, BubbleContent, BubbleReactions } from '../../src/components/ui/bubble.js'
import { Message, MessageContent, MessageHeader } from '../../src/components/ui/message.js'

describe('conversation composition', () => {
  it('keeps the full-card preview and download action as separate operable links', () => {
    render(<Attachment><AttachmentMedia aria-hidden="true">▤</AttachmentMedia><AttachmentContent><AttachmentTitle>summary.pdf</AttachmentTitle><AttachmentDescription>PDF · 2.4 MB</AttachmentDescription></AttachmentContent><AttachmentActions><AttachmentAction asChild><a href="/summary.pdf" download aria-label="Download summary.pdf">Download</a></AttachmentAction></AttachmentActions><AttachmentTrigger asChild><a href="/preview" aria-label="Preview summary.pdf" /></AttachmentTrigger></Attachment>)
    const download = screen.getByRole('link', { name: 'Download summary.pdf' })
    const preview = screen.getByRole('link', { name: 'Preview summary.pdf' })
    expect(download.getAttribute('download')).toBe('')
    expect(download.closest('button')).toBeNull()
    expect(download.hasAttribute('type')).toBe(false)
    expect(preview.contains(download)).toBe(false)
    expect(preview.hasAttribute('type')).toBe(false)
  })

  it('uses non-submitting buttons for preview and removal inside a form', () => {
    const remove = vi.fn()
    const preview = vi.fn()
    const submit = vi.fn((event: React.FormEvent) => event.preventDefault())
    render(<form onSubmit={submit}><Attachment><AttachmentActions><AttachmentAction aria-label="Remove summary.pdf" onClick={remove}>×</AttachmentAction></AttachmentActions><AttachmentTrigger aria-label="Preview summary.pdf" onClick={preview} /></Attachment></form>)
    fireEvent.click(screen.getByRole('button', { name: 'Remove summary.pdf' }))
    fireEvent.click(screen.getByRole('button', { name: 'Preview summary.pdf' }))
    expect(remove).toHaveBeenCalledOnce()
    expect(preview).toHaveBeenCalledOnce()
    expect(submit).not.toHaveBeenCalled()
  })

  it('exposes upload progress as busy and keeps failure information in text', () => {
    const { container, rerender } = render(<Attachment state="uploading"><AttachmentTitle>summary.pdf</AttachmentTitle><AttachmentDescription>Uploading · 64%</AttachmentDescription></Attachment>)
    expect(container.querySelector('[data-slot="attachment"]')?.getAttribute('aria-busy')).toBe('true')
    rerender(<Attachment state="error"><AttachmentTitle>summary.pdf</AttachmentTitle><AttachmentDescription>Upload failed. Please try again.</AttachmentDescription></Attachment>)
    expect(screen.getByText('Upload failed. Please try again.')).toBeTruthy()
    expect(container.querySelector('[data-slot="attachment"]')?.hasAttribute('aria-busy')).toBe(false)
  })

  it('preserves link semantics and content when a bubble is composed into an end-aligned message', () => {
    const { container } = render(<Message align="end"><MessageContent><MessageHeader>You</MessageHeader><Bubble variant="tinted"><BubbleContent asChild><a href="/notes">Read the notes</a></BubbleContent><BubbleReactions side="top" align="start" aria-label="Reactions"><span aria-label="One heart reaction">♥ 1</span></BubbleReactions></Bubble></MessageContent></Message>)
    expect(screen.getByRole('link', { name: 'Read the notes' }).getAttribute('href')).toBe('/notes')
    expect(container.querySelector('[data-slot="message"]')?.getAttribute('data-align')).toBe('end')
    expect(container.querySelector('[data-slot="bubble-reactions"]')?.getAttribute('data-side')).toBe('top')
    expect(screen.getByLabelText('One heart reaction')).toBeTruthy()
  })
})
