import {defaults} from './engine.js';
export const samples=[
 {id:'binary',name:'二進数カウンター',description:'空のテープから 0 → 1 → 10 → 11… と加算。停止せずに動き続けます。',rules:defaults},
 {id:'alternating',name:'01 を交互に書く',description:'右へ進みながら 010101… を書き続けます。2つの状態の切り替えを観察できます。',rules:[['start','','0','R','one'],['one','','1','R','start']]},
 {id:'three',name:'111 を書いて停止',description:'3ステップで 111 を書き、halt に到達します。halt からの規則がないため停止します。',rules:[['start','','1','R','second'],['second','','1','R','third'],['third','','1','S','halt']]},
 {id:'beaver',name:'2状態のビジービーバー',description:'空記号と 1 を使い、6ステップで 1 を4つ残して停止します。左右への移動と巻き戻しを試せます。',rules:[['start','','1','R','B'],['start','1','1','L','B'],['B','','1','L','start'],['B','1','1','R','halt']]}
];
