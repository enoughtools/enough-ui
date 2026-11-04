import { Button } from '#ui/button';
import { DialogContent, DialogFooter } from '#ui/dialog';
import { Select, SelectTrigger } from '#ui/select';
import { Trace, TraceLine, TraceTitle, TraceCollapsible, TraceCollapsibleTrigger, TraceCollapsibleContent } from '#ui/trace';
import { CodeBlock, CodeBlockContent, CodeBlockLine, CodeBlockCopyButton } from '#ui/code-block';

const buttonRef = { current: null as HTMLButtonElement | null };
const contentRef = { current: null as HTMLPreElement | null };
const valid = <>
  <Button ref={buttonRef} variant="outline" size="icon-xs" asChild><a href="/">Home</a></Button>
  <DialogContent showCloseButton={false}><DialogFooter showCloseButton /></DialogContent>
  <Select value="one" onValueChange={(value: string) => { void value }}><SelectTrigger size="sm" /></Select>
  <Trace><TraceCollapsible open onOpenChange={(open: boolean) => { void open }}>
    <TraceCollapsibleTrigger><TraceLine status="running"><TraceTitle>Reading</TraceTitle></TraceLine></TraceCollapsibleTrigger>
    <TraceCollapsibleContent>Output</TraceCollapsibleContent>
  </TraceCollapsible></Trace>
  <CodeBlock variant="destructive" size="sm"><CodeBlockContent ref={contentRef} wrap lineNumbers startLine={5}>
    <CodeBlockLine variant="added">text</CodeBlockLine>
  </CodeBlockContent><CodeBlockCopyButton value="text" onClick={event => event.preventDefault()} /></CodeBlock>
</>;
// @ts-expect-error upstream Button has no loading flag
const invalidButton = <Button isLoading />;
// @ts-expect-error unknown variants must not become accepted through any
const invalidVariant = <CodeBlock variant="rainbow" />;
// @ts-expect-error completed traces omit status rather than adding a success value
const invalidStatus = <TraceLine status="success" />;
// @ts-expect-error controlled TraceCollapsible requires the change handler
const invalidControlled = <TraceCollapsible open />;
// @ts-expect-error trigger deliberately excludes asChild
const invalidTrigger = <TraceCollapsibleTrigger asChild />;
// @ts-expect-error line numbers start at a number
const invalidLine = <CodeBlockContent startLine="one" />;
void [valid, invalidButton, invalidVariant, invalidStatus, invalidControlled, invalidTrigger, invalidLine];
