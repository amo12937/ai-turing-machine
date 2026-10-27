import {defaults} from './engine.js';
export const samples=[
 {id:'binary',name:'二進数カウンター',description:'空のテープから 0 → 1 → 10 → 11… と加算。停止せずに動き続けます。',rules:defaults},
 {id:'beaver',name:'3状態・3記号のビジービーバー',description:'Brady の2004年の記録保持機。空記号・1・2を使い、92,649,163ステップで停止します。1秒1ステップなら約1,072日。現在の最大値を示す機械ではありません。',rules:[['start','','1','R','B'],['start','1','1','R','halt'],['start','2','2','L','C'],['B','','1','L','C'],['B','1','2','R','B'],['B','2','1','L','B'],['C','','1','L','start'],['C','1','','R','B'],['C','2','2','L','start']]}
];

// Input preparation also uses ordinary transition rules, so CSV / shared URLs reproduce it.
function withInput(input, alphabet, entry, core){
 const symbols=[...input];
 const preparation=symbols.map((symbol,i)=>[i===0?'start':`input_${i}`,'',symbol,i===symbols.length-1?'S':'R',i===symbols.length-1?'input_return':`input_${i+1}`]);
 for(const symbol of alphabet)preparation.push(['input_return',symbol,symbol,'L','input_return']);
 preparation.push(['input_return','','','R',entry]);
 for(const symbol of alphabet)preparation.push(['start',symbol,symbol,'S',entry]);
 if(!symbols.length)preparation.push(['start','','','S',entry]);
 return [...preparation,...core];
}
export const additionCore=[
 ['seek_end','0','0','R','seek_end'],['seek_end','1','1','R','seek_end'],['seek_end','+','+','R','seek_end'],['seek_end','','','L','decrement'],
 ['decrement','0','0','L','decrement'],['decrement','1','0','R','borrow_fill'],['decrement','+','','R','erase_second'],
 ['borrow_fill','0','1','R','borrow_fill'],['borrow_fill','','','L','return_plus'],
 ['return_plus','0','0','L','return_plus'],['return_plus','1','1','L','return_plus'],['return_plus','+','+','L','increment'],
 ['increment','1','0','L','increment'],['increment','0','1','R','seek_end'],['increment','','1','R','seek_end'],
 ['erase_second','0','','R','erase_second'],['erase_second','','','L','result'],
 ['result','','','L','result'],['result','0','0','S','halt'],['result','1','1','S','halt']
];
export function additionRules(input){if(!/^[01]+\+[01]+$/.test(input))throw Error('加算の入力は 101+11 のように、2つの二進数を + で区切ってください。');return withInput(input,['0','1','+'],'seek_end',additionCore);}
export const palindromeCore=[['pick','X','X','R','pick'],['pick','0','X','R','end_0'],['pick','1','X','R','end_1'],['pick','','','S','accept']];
for(const bit of ['0','1']){
 for(const symbol of ['0','1','X'])palindromeCore.push([`end_${bit}`,symbol,symbol,'R',`end_${bit}`]);
 palindromeCore.push([`end_${bit}`,'','','L',`match_${bit}`],[`match_${bit}`,'X','X','L',`match_${bit}`],[`match_${bit}`,bit,'X','L','rewind'],[`match_${bit}`,bit==='0'?'1':'0',bit==='0'?'1':'0','S','reject'],[`match_${bit}`,'','','S','accept']);
}
for(const symbol of ['0','1','X'])palindromeCore.push(['rewind',symbol,symbol,'L','rewind']);
palindromeCore.push(['rewind','','','R','pick']);
export function palindromeRules(input){if(!/^[01]*$/.test(input))throw Error('回文判定の入力には 0 と 1 のみを使用してください。');return withInput(input,['0','1','X'],'pick',palindromeCore);}
samples.unshift(
 {id:'addition',name:'二進数の2数加算',input:'101+11',fields:[{label:'1つ目の二進数',value:'101'},{label:'2つ目の二進数',value:'11'}],description:'2つの二進数を入力してください。右の数を1減らし、左の数を1増やす処理を反復して和を残します。例：101 + 11 → 1000。',rules:additionRules('101+11'),buildRules:additionRules},
 {id:'palindrome',name:'二進列の回文判定',input:'10101',fields:[{label:'判定する二進列',value:'10101'}],description:'両端の記号を照合し、確認済みの位置を X に変更。回文なら accept、不一致なら reject で停止します。10110 も試せます。',rules:palindromeRules('10101'),buildRules:palindromeRules}
);
