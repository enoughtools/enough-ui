import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const count=Number(process.argv[2]);
assert.ok(Number.isInteger(count)&&count>0&&count<=100,'Pass the batch count.');
const root=new URL('../',import.meta.url);
const indexText=await readFile(new URL('storybook-static/index.json',root),'utf8');
const digest=createHash('sha256').update(indexText).digest('hex');
const expected=Object.values(JSON.parse(indexText).entries).filter(entry=>entry.type==='story').map(entry=>entry.id).sort();
const reports=await Promise.all(Array.from({length:count},(_,index)=>readFile(new URL(`artifacts/storybook/report-batch-${index+1}-of-${count}.json`,root),'utf8').then(JSON.parse)));
for(const [index,report] of reports.entries()){
  assert.deepEqual(report.batch,[index+1,count]);
  assert.equal(report.catalogDigest,digest,'Every batch must test the same built catalog.');
  assert.deepEqual(report.failures,[],'Every batch must pass before merging.');
  for(const id of report.storyIds)assert.ok(report.verified.includes(id),`Missing completed scan for ${id}`);
}
const actual=reports.flatMap(report=>report.storyIds).sort();
assert.deepEqual(actual,expected,'Batches must cover every catalog story exactly once.');
const verified=reports.flatMap(report=>report.verified);
await writeFile(new URL('artifacts/storybook/report.json',root),JSON.stringify({storyCount:expected.length,catalogDigest:digest,batchCount:count,verified,failures:[]},null,2));
console.log(`Storybook verification: ${verified.length} checks passed across all ${expected.length} stories in ${count} complete batches.`);
