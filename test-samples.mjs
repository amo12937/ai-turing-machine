import assert from 'node:assert/strict';import {samples} from './dist/samples.js';import {Machine,validate} from './dist/engine.js';import {encodeRules,decodeRules} from './dist/sharing.js';
for(const s of samples){assert.equal(validate(s.rules),'');assert.deepEqual(decodeRules(encodeRules(s.rules)),s.rules);}
assert.deepEqual(samples.map(s=>s.id),['addition','palindrome','binary','beaver','beaver6']);
const m=new Machine();m.state='halt';assert.ok(m.step([['halt','','1','S','start']]));assert.equal(m.head,0);console.log('PASS: sample outputs, halt convention, stationary move, undo, share roundtrip');

const {additionRules,palindromeRules}=await import('./dist/samples.js');
function run(rules){assert.equal(validate(rules),'');const m=new Machine();while(m.step(rules))assert.ok(m.steps<20000,'Sample failed to halt');return m;}
function tape(m){return [...m.tape].sort((a,b)=>a[0]-b[0]).map(x=>x[1]).join('');}
for(let a=0;a<32;a++)for(let b=0;b<16;b++){const m=run(additionRules(a.toString(2)+'+'+b.toString(2)));assert.equal(m.state,'halt');assert.equal(tape(m),(a+b).toString(2));}
for(let n=0;n<=7;n++)for(let v=0;v<2**n;v++){const word=n?v.toString(2).padStart(n,'0'):'';const m=run(palindromeRules(word));assert.equal(m.state,word===[...word].reverse().join('')?'accept':'reject');}
for(const word of ['000+001','11111111+1','101+11']){const m=run(additionRules(word));assert.equal(parseInt(tape(m),2),word.split('+').reduce((a,b)=>a+parseInt(b,2),0));while(m.history.length)m.back();assert.equal(m.tape.size,0);assert.equal(m.state,'start');}
assert.throws(()=>additionRules('101+2'));assert.throws(()=>palindromeRules('101+'));console.log('PASS: 512 binary sums, 255 palindrome cases, overflow, zero, input validation and undo');
console.log('Demo steps:',run(additionRules('101+11')).steps,run(palindromeRules('10101')).steps);

// Reference transition tables, in source notation: A=start, 0=blank, H=halt.
// https://turbotm.de/~heiner/BB/simLig33_b.html
// https://www.sligocki.com/2022/06/21/bb-6-2-t15.html
const references=[
 ['beaver',3,3,'1RB2LA1LC_0LA2RB1LB_1RH1RA1RC'],
 ['beaver6',6,2,'1RB0LD_1RC0RF_1LC1LA_0LE1RH_1LF0RB_0RC0RE']
];
const {csv,parseCSV}=await import('./dist/engine.js');
for(const [id,states,symbols,expected] of references){
 const rules=samples.find(s=>s.id===id).rules;
 const state=s=>s==='start'?'A':s==='halt'?'H':s;
 const encoded=Array.from({length:states},(_,i)=>rules.filter(r=>state(r[0])===String.fromCharCode(65+i)).map(r=>(r[2]||'0')+r[3]+state(r[4])).join('')).join('_');
 assert.equal(encoded,expected);assert.equal(rules.length,states*symbols);
 assert.equal(new Set(rules.map(r=>r[0])).size,states);
 assert.equal(new Set(rules.flatMap(r=>[r[1],r[2]])).size,symbols);
 assert.deepEqual(parseCSV(csv(rules)),rules);
 const m=new Machine();
 for(let i=0;i<86401;i++)assert.ok(m.step(rules));
 assert.notEqual(m.state,'halt');
 for(let i=0;i<86401;i++)m.back();
 assert.equal(m.head,0);assert.equal(m.steps,0);assert.equal(m.state,'start');assert.equal(m.tape.size,0);
 const haltRule=rules.find(r=>r[4]==='halt');m.state=haltRule[0];if(haltRule[1])m.tape.set(0,haltRule[1]);
 assert.ok(m.step(rules));assert.equal(m.state,'halt');assert.equal(m.step(rules),false);
}
// Independent published snapshots, not full runs to halting.
const three=new Machine();const threeRules=samples.find(s=>s.id==='beaver').rules;
for(let i=0;i<200;i++)three.step(threeRules);
assert.equal(three.state,'B');assert.equal(three.head,-10);assert.equal(three.tape.size,15);
assert.equal(Array.from({length:16},(_,i)=>three.tape.get(i-12)||'0').join(''),'1121111111111110');
const six=new Machine();const sixRules=samples.find(s=>s.id==='beaver6').rules;
function assertC(n){
 assert.equal(six.state,'C');assert.equal(six.read(),'');assert.equal(six.tape.size,3);
 assert.equal(six.tape.get(six.head-6),'1');assert.equal(six.tape.get(six.head-7),'1');assert.equal(six.tape.get(six.head-8-n),'1');
}
for(let i=0;i<45;i++)six.step(sixRules);assertC(5);
for(let i=0;i<506;i++)six.step(sixRules);assertC(35);
console.log('PASS: both Busy Beaver source tables, 86,401 steps and undo, published snapshots, halt transitions and CSV/share roundtrips');
