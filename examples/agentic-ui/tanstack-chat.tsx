import * as React from 'react';
import { useChat } from '@tanstack/ai-react';
import { toolDefinition, hashSchemaInput, normalizeApprovalSchema, type StreamChunk, EventType } from '@tanstack/ai/client';
import type { ConnectConnectionAdapter, UIMessage } from '@tanstack/ai-client';
import { z } from 'zod';
import { AgentWork, type AgentStep } from '@enoughtools/ui-react/agent-work';
import { AgentConfirmation } from '@enoughtools/ui-react/agent-confirmation';
import { PromptComposer } from '@enoughtools/ui-react/prompt-composer';
import { Message, MessageContent, MessageHeader } from '@enoughtools/ui-react/message';

const readSource=toolDefinition({name:'readSource',description:'Read the public source contract.',inputSchema:z.object({path:z.string()}),outputSchema:z.object({text:z.string()}),needsApproval:true});
const tools=[readSource.client()] as const;

export function toAgentSteps(message:UIMessage<typeof tools>):AgentStep[] {
  return message.parts.flatMap(part=>{
    if(part.type!=='tool-call')return [];
    const result=message.parts.find(candidate=>candidate.type==='tool-result'&&candidate.toolCallId===part.id);
    const failed=part.state==='error'||(result?.type==='tool-result'&&result.state==='error');
    const denied=part.approval?.approved===false||(result?.type==='tool-result'&&result.outcome==='denied');
    const output=result?.type==='tool-result'?(typeof result.content==='string'?result.content:JSON.stringify(result.content)):part.output!==undefined?JSON.stringify(part.output):undefined;
    const status:AgentStep['status']=denied?'completed':failed?'error':output!==undefined?'completed':part.state==='approval-requested'?'pending':'running';
    return [{id:part.id,title:`${denied?'Denied':failed?'Failed to run':part.state==='approval-requested'?'Awaiting approval for':output!==undefined?'Ran':'Running'} ${part.name}`,status,description:part.state,output}];
  });
}

// A deterministic AG-UI producer for Storybook/tests. It uses the actual 1.0
// client, typed approval binding and resume envelope, without a model/API key.
export function demoConnection(delayMs=100):ConnectConnectionAdapter {
  let turn=0;
  return { async *connect(_messages,_data,signal,context):AsyncIterable<StreamChunk> {
    const {threadId,runId}=context;
    const messageId=`assistant-${++turn}`;
    yield {type:EventType.RUN_STARTED,threadId,runId};
    if(!context.resume?.length){
      yield {type:EventType.TOOL_CALL_START,toolCallId:'read-1',toolCallName:'readSource',parentMessageId:messageId};
      yield {type:EventType.TOOL_CALL_ARGS,toolCallId:'read-1',delta:'{"path":"trace.tsx"}'};
      yield {type:EventType.TOOL_CALL_END,toolCallId:'read-1'};
      const approval=normalizeApprovalSchema(undefined,readSource.inputSchema);
      yield {type:EventType.RUN_FINISHED,threadId,runId,outcome:{type:'interrupt',interrupts:[{
        id:'approval-1',reason:'tool_call',message:'Read trace.tsx?',toolCallId:'read-1',responseSchema:approval.responseSchema,
        metadata:{'tanstack:interruptBinding':{v:1,kind:'tool-approval',interruptId:'approval-1',interruptedRunId:runId,generation:1,toolName:'readSource',toolCallId:'read-1',originalArgs:{path:'trace.tsx'},inputSchemaHash:hashSchemaInput(readSource.inputSchema),approvalSchemaHash:approval.approvalSchemaHash,responseSchemaHash:approval.responseSchemaHash}},
      }]}};
      return;
    }
    const answer=context.resume[0].payload;
    const approved=answer===true||(typeof answer==='object'&&answer!==null&&'approved' in answer&&answer.approved===true);
    yield {type:EventType.TOOL_CALL_RESULT,messageId:'result-1',toolCallId:'read-1',content:approved?'Matched the Trace interface.':'The tool was denied.',role:'tool',metadata:approved?undefined:{tanstack:{toolResultOutcome:'denied'}}};
    yield {type:EventType.TEXT_MESSAGE_START,messageId,role:'assistant'};
    for(const delta of approved?['The source ','matches the pinned contract.']:['The tool was denied.']){
      if(signal?.aborted)return;
      if(delayMs)await new Promise(resolve=>setTimeout(resolve,delayMs));
      if(signal?.aborted)return;
      yield {type:EventType.TEXT_MESSAGE_CONTENT,messageId,delta};
    }
    yield {type:EventType.TEXT_MESSAGE_END,messageId};
    yield {type:EventType.RUN_FINISHED,threadId,runId};
  }};
}

export function TanStackChat({connection}:{connection:ConnectConnectionAdapter}) {
  const chat=useChat({threadId:'enough-ui-contract-demo',connection,tools});
  const [draft,setDraft]=React.useState('Check the Trace interface.');
  const approval=chat.interrupts.find(item=>item.kind==='tool-approval');
  return <div className="flex min-w-0 flex-col gap-4 font-sans">
    {chat.messages.map(message=><Message key={message.id}><MessageContent><MessageHeader>{message.role}</MessageHeader>{message.parts.map((part,index)=>part.type==='text'?<p key={index}>{part.content}</p>:null)}<AgentWork steps={toAgentSteps(message)} /></MessageContent></Message>)}
    {approval?.kind==='tool-approval'&&approval.canResolve&&approval.status==='pending'&&<AgentConfirmation request={{id:approval.id,title:approval.message??'Approve tool?',description:`Tool: ${approval.toolName}`}} resolution="pending" onDecision={decision=>approval.resolveInterrupt(decision==='approved')} />}
    {chat.error&&<p role="alert">{chat.error.message}</p>}
    {chat.interrupts.flatMap(item=>item.errors.map((error,index)=><p role="alert" key={`${item.id}-${index}`}>{error.message}</p>))}
    <PromptComposer value={draft} onValueChange={setDraft} busy={chat.isLoading} onStop={chat.stop} onSend={async({text})=>{await chat.sendMessage(text);setDraft(current=>current===text?'':current);}} />
  </div>;
}
export function TanStackDemo(){const connection=React.useMemo(()=>demoConnection(),[]);return <TanStackChat connection={connection} />;}
