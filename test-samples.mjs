import assert from 'node:assert/strict';import {samples} from './dist/samples.js';import {Machine,validate} from './dist/engine.js';import {encodeRules,decodeRules} from './dist/sharing.js';
for(const s of samples){assert.equal(validate(s.rules),'');assert.deepEqual(decodeRules(encodeRules(s.rules)),s.rules);}
assert.deepEqual(samples.map(s=>s.id),['addition','palindrome','binary','beaver']);
const m=new Machine();m.state='halt';assert.ok(m.step([['halt','','1','S','start']]));assert.equal(m.head,0);console.log('PASS: sample outputs, halt convention, stationary move, undo, share roundtrip');

const {additionRules,palindromeRules}=await import('./dist/samples.js');
function run(rules){assert.equal(validate(rules),'');const m=new Machine();while(m.step(rules))assert.ok(m.steps<20000,'Sample failed to halt');return m;}
function tape(m){return [...m.tape].sort((a,b)=>a[0]-b[0]).map(x=>x[1]).join('');}
for(let a=0;a<32;a++)for(let b=0;b<16;b++){const m=run(additionRules(a.toString(2)+'+'+b.toString(2)));assert.equal(m.state,'halt');assert.equal(tape(m),(a+b).toString(2));}
for(let n=0;n<=7;n++)for(let v=0;v<2**n;v++){const word=n?v.toString(2).padStart(n,'0'):'';const m=run(palindromeRules(word));assert.equal(m.state,word===[...word].reverse().join('')?'accept':'reject');}
for(const word of ['000+001','11111111+1','101+11']){const m=run(additionRules(word));assert.equal(parseInt(tape(m),2),word.split('+').reduce((a,b)=>a+parseInt(b,2),0));while(m.history.length)m.back();assert.equal(m.tape.size,0);assert.equal(m.state,'start');}
assert.throws(()=>additionRules('101+2'));assert.throws(()=>palindromeRules('101+'));console.log('PASS: 512 binary sums, 255 palindrome cases, overflow, zero, input validation and undo');
console.log('Demo steps:',run(additionRules('101+11')).steps,run(palindromeRules('10101')).steps);

// Run every transition of Brady's machine without retaining 92 million undo entries.
const beaver=samples.find(s=>s.id==='beaver');
const bm=new Machine();
for(let i=0;i<1000;i++)assert.ok(bm.step(beaver.rules));
for(let i=0;i<1000;i++)bm.back();
assert.equal(bm.tape.size,0);assert.equal(bm.state,'start');
const lookup=new Map(beaver.rules.map(r=>[r[0]+':'+r[1],r]));
const cells=new Map();let head=0,state='start',steps=0;
while(state!=='halt'){
 const r=lookup.get(state+':'+(cells.get(head)||''));assert.ok(r);
 if(r[2])cells.set(head,r[2]);else cells.delete(head);
 head+=r[3]==='R'?1:-1;state=r[4];steps++;
 if(steps===86400)assert.notEqual(state,'halt');
 assert.ok(steps<=92649163);
}
assert.equal(steps,92649163);assert.equal(cells.size,13949);
console.log('PASS: Brady machine halts at 92,649,163 steps with 13,949 nonblank symbols');
