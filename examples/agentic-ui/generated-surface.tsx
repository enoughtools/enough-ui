import * as React from 'react';
import { defineRegistry, JSONUIProvider, Renderer, useBoundProp } from '@json-render/react';
import type { Spec } from '@json-render/core';
import { validateSpec } from '@json-render/core';
import { Card, CardHeader, CardTitle, CardContent } from '@enoughtools/ui-react/card';
import { Input } from '@enoughtools/ui-react/input';
import { Label } from '@enoughtools/ui-react/label';
import { Button } from '@enoughtools/ui-react/button';
import { NativeSelect, NativeSelectOption } from '@enoughtools/ui-react/native-select';
import { Table, TableCaption, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@enoughtools/ui-react/table';
import { Alert, AlertTitle, AlertDescription } from '@enoughtools/ui-react/alert';
import { catalog } from './catalog.js';
import { z } from 'zod';

export const {registry} = defineRegistry(catalog, {
  components: {
    Panel: ({props,children}) => <Card><CardHeader><CardTitle>{props.title}</CardTitle></CardHeader><CardContent className="flex flex-col gap-3">{children}</CardContent></Card>,
    Text: ({props}) => <p>{props.text}</p>,
    DraftField: ({props,bindings}) => {
      const id=React.useId();
      const [value,setValue]=useBoundProp(props.value,bindings?.value);
      return <div className="flex flex-col gap-2"><Label htmlFor={id}>{props.label}</Label><Input id={id} value={value ?? ''} onChange={event=>setValue(event.target.value)} /></div>;
    },
    Choice: ({props,bindings}) => {
      const id=React.useId();
      const [value,setValue]=useBoundProp(props.value,bindings?.value);
      return <div className="flex flex-col gap-2"><Label htmlFor={id}>{props.label}</Label><NativeSelect id={id} value={value ?? ''} onChange={event=>setValue(event.target.value)}>{props.options.map(option=><NativeSelectOption key={option.value} value={option.value}>{option.label}</NativeSelectOption>)}</NativeSelect></div>;
    },
    Button: ({props,emit}) => <Button type="button" variant={props.variant} onClick={()=>emit('press')}>{props.label}</Button>,
    Table: ({props}) => <Table><TableCaption>{props.caption}</TableCaption><TableHeader><TableRow>{props.columns.map((column,index)=><TableHead key={index}>{column}</TableHead>)}</TableRow></TableHeader><TableBody>{props.rows.map((row,index)=><TableRow key={index}>{row.map((cell,column)=><TableCell key={column}>{cell}</TableCell>)}</TableRow>)}</TableBody></Table>,
  },
  actions: { submit: async () => { /* The host binds execution below. */ } },
});

const surfaceSchema=z.object({root:z.string(),elements:z.record(z.string(),z.object({
  type:z.string(),props:z.record(z.string(),z.unknown()),children:z.array(z.string()).max(50),
  on:z.object({press:z.object({action:z.literal('submit'),params:z.object({text:z.union([z.string().max(10000),z.object({$state:z.literal('/draft')}).strict()])}).strict()}).strict().optional()}).strict().optional(),
}).strict())}).strict();
export function validateSurface(input: unknown): Spec {
  const candidate=surfaceSchema.parse(input);
  if(Object.keys(candidate.elements).length>200)throw new Error('Too many generated elements.');
  const referenced=new Set<string>();
  for(const node of Object.values(candidate.elements)){
    for(const child of node.children){
      if(referenced.has(child))throw new Error('Repeated component references are not supported.');
      referenced.add(child);
    }
    if(!Object.hasOwn(catalog.data.components,node.type))throw new Error('Unknown component.');
    const definition=catalog.data.components[node.type as keyof typeof catalog.data.components];
    const props={...node.props};
    if((node.type==='DraftField'||node.type==='Choice')&&typeof props.value==='object'&&props.value!==null){
      z.object({$bindState:z.literal(node.type==='DraftField'?'/draft':'/choice')}).strict().parse(props.value);
      props.value='';
    }
    definition.props.parse(props);
    if(node.on&&node.type!=='Button')throw new Error('This component does not expose actions.');
    if(node.children.length&&node.type!=='Panel')throw new Error('This component does not accept children.');
  }
  const visit=(id:string,ancestors:Set<string>)=>{
    if(ancestors.has(id)||ancestors.size>24)throw new Error('Invalid generated component nesting.');
    for(const child of candidate.elements[id]?.children??[])visit(child,new Set([...ancestors,id]));
  };
  visit(candidate.root,new Set());
  const result=catalog.validate(candidate);
  if (!result.success || !result.data) throw new Error('The generated interface does not match the component catalog.');
  const structural=validateSpec(result.data as Spec);
  if (!structural.valid) throw new Error('The generated interface contains invalid component references.');
  // The current catalog schema strips `on` even though Renderer supports it.
  // Return our strictly validated envelope to preserve approved event bindings.
  return candidate;
}
export interface GeneratedSurfaceProps { surfaceId: string; spec: unknown; loading?: boolean; onSubmit: (text: string)=>void|Promise<void>; onRetry?:()=>void }
export function GeneratedSurface(props:GeneratedSurfaceProps) { return <Surface key={props.surfaceId} {...props} />; }
function Surface({spec,loading=false,onSubmit,onRetry}:GeneratedSurfaceProps) {
  const lastValid=React.useRef<Spec|null>(null);
  const [actionError,setActionError]=React.useState('');
  let error='';
  if (spec !== null) { try {lastValid.current=validateSurface(spec);} catch {error='The generated interface could not be displayed. Try again.';} }
  const handlers=React.useMemo(()=>({submit:async(params:Record<string,unknown>)=>{
    setActionError('');
    const result=catalog.data.actions.submit.params.safeParse(params);
    if(!result.success){setActionError('Invalid action parameters.');return;}
    try {await onSubmit(result.data.text);}catch(reason){setActionError(reason instanceof Error?reason.message:'Action failed. Try again.');}
  }}),[onSubmit]);
  return <JSONUIProvider registry={registry} initialState={{draft:'',choice:'review'}} handlers={handlers}>
    <div className="flex min-w-0 flex-col gap-3 font-sans" aria-busy={loading}>
      {loading && <p role="status">Building interface…</p>}
      {(error || actionError) && <Alert><AlertTitle>Could not complete the interface</AlertTitle><AlertDescription>{error || actionError}</AlertDescription>{onRetry && <Button variant="outline" onClick={onRetry}>Retry interface</Button>}</Alert>}
      {spec === null ? !loading && <p>No generated interface yet.</p> : <Renderer spec={lastValid.current} registry={registry} loading={loading} />}
    </div>
  </JSONUIProvider>;
}

export const initialSpec:Spec={root:'panel',elements:{
  panel:{type:'Panel',props:{title:'Review the migration'},children:['draft','choice','send']},
  draft:{type:'DraftField',children:[],props:{label:'Review notes',value:{$bindState:'/draft'}}},
  choice:{type:'Choice',children:[],props:{label:'Next action',value:{$bindState:'/choice'},options:[{value:'review',label:'Review changes'},{value:'test',label:'Run tests'}]}},
  send:{type:'Button',children:[],props:{label:'Submit notes',variant:'outline'},on:{press:{action:'submit',params:{text:{$state:'/draft'}}}}},
}};
export const completeSpec:Spec={...initialSpec,elements:{...initialSpec.elements,
  panel:{...initialSpec.elements.panel,children:['summary','draft','choice','send','results']},
  summary:{type:'Text',children:[],props:{text:'Both renderers use the same tokens.'}},
  results:{type:'Table',children:[],props:{caption:'Renderer verification',columns:['Renderer','Result'],rows:[['React','Passed'],['Astro','Passed']]}},
}};
export function GeneratedSurfaceDemo({invalid=false,empty=false}:{invalid?:boolean;empty?:boolean}) {
  const [complete,setComplete]=React.useState(false);
  const [receipt,setReceipt]=React.useState('');
  return <div className="flex flex-col gap-3"><Button onClick={()=>setComplete(value=>!value)}>Append UI chunk</Button><GeneratedSurface surfaceId="review" spec={empty?null:invalid&&!complete?{root:'bad',elements:{bad:{type:'Unknown',props:{}}}}:complete?completeSpec:initialSpec} loading={!complete&&!invalid&&!empty} onSubmit={setReceipt} onRetry={()=>setComplete(true)} />{receipt && <p role="status">Submitted: {receipt}</p>}</div>;
}
