import assert from 'node:assert/strict';import {samples} from './dist/samples.js';import {Machine,validate} from './dist/engine.js';import {encodeRules,decodeRules} from './dist/sharing.js';
for(const s of samples){assert.equal(validate(s.rules),'');assert.deepEqual(decodeRules(encodeRules(s.rules)),s.rules);const m=new Machine();if(s.id==='three'||s.id==='beaver'){while(m.step(s.rules))assert.ok(m.steps<20);assert.equal(m.state,'halt');assert.equal(m.steps,s.id==='three'?3:6);assert.equal([...m.tape.values()].join(''),s.id==='three'?'111':'1111');const count=m.steps;for(let i=0;i<count;i++)m.back();assert.equal(m.tape.size,0);assert.equal(m.state,'start');}if(s.id==='alternating'){for(let i=0;i<20;i++)assert.ok(m.step(s.rules));assert.equal([...m.tape.values()].join(''),'01'.repeat(10));}}
const m=new Machine();m.state='halt';assert.ok(m.step([['halt','','1','S','start']]));assert.equal(m.head,0);console.log('PASS: sample outputs, halt convention, stationary move, undo, share roundtrip');

const {additionRules,palindromeRules}=await import('./dist/samples.js');
function run(rules){assert.equal(validate(rules),'');const m=new Machine();while(m.step(rules))assert.ok(m.steps<20000,'Sample failed to halt');return m;}
function tape(m){return [...m.tape].sort((a,b)=>a[0]-b[0]).map(x=>x[1]).join('');}
for(let a=0;a<32;a++)for(let b=0;b<16;b++){const m=run(additionRules(a.toString(2)+'+'+b.toString(2)));assert.equal(m.state,'halt');assert.equal(tape(m),(a+b).toString(2));}
for(let n=0;n<=7;n++)for(let v=0;v<2**n;v++){const word=n?v.toString(2).padStart(n,'0'):'';const m=run(palindromeRules(word));assert.equal(m.state,word===[...word].reverse().join('')?'accept':'reject');}
for(const word of ['000+001','11111111+1','101+11']){const m=run(additionRules(word));assert.equal(parseInt(tape(m),2),word.split('+').reduce((a,b)=>a+parseInt(b,2),0));while(m.history.length)m.back();assert.equal(m.tape.size,0);assert.equal(m.state,'start');}
assert.throws(()=>additionRules('101+2'));assert.throws(()=>palindromeRules('101+'));console.log('PASS: 512 binary sums, 255 palindrome cases, overflow, zero, input validation and undo');
console.log('Demo steps:',run(additionRules('101+11')).steps,run(palindromeRules('10101')).steps);
