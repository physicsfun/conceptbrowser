import {test} from 'node:test';
import assert from 'node:assert/strict';
import {placeReadableLabels} from '../src/graph/labelPlacement.js';
test('screen labels prioritize selection, avoid each other and leave graph coordinates intact',()=>{
 const coords=Object.fromEntries(Array.from({length:30},(_,i)=>['topic-'+i,{x:i*2,y:i*3,title:'A readable physics concept '+i}]));const before=structuredClone(coords);
 const labels=placeReadableLabels(Object.keys(coords),coords,'topic-12',new Set(['topic-12','topic-13']),{x:0,y:0,scale:.1},{width:600,height:500});
 assert.ok(!labels['topic-12'].marker);assert.ok(Object.values(labels).some(l=>l.marker));assert.deepEqual(coords,before);
 const boxes=Object.values(labels).filter(l=>!l.marker);
 for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];assert.ok(a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom)}
});
