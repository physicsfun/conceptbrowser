import {test} from 'node:test';
import assert from 'node:assert/strict';
import {root,nodes,paths,indexCourse,descendants} from '../src/data/course.js';
import {resources} from '../src/data/resources.js';
test('all resources refer to known stable topics and have unique identifiers',()=>{const ids=new Set();for(const [topic,rs] of Object.entries(resources)){assert.ok(nodes[topic]);for(const r of rs){assert.ok(!ids.has(r.id));ids.add(r.id);assert.ok(r.body);if(r.type==='practice')assert.ok(r.answer>=0&&r.answer<r.choices.length)}}});
test('hierarchy indexes arbitrary depths independently of order',()=>{const deep={id:'a',children:[{id:'b',children:[{id:'c',children:[{id:'d',children:[{id:'e',children:[{id:'f'}]}]}]}]}]};assert.equal(indexCourse(deep).paths.f.length,6);assert.deepEqual(paths.dielectrics.map(n=>n.id),['phys1202','electricity','matter','capacitors','dielectrics']);assert.equal(Object.keys(nodes).length,descendants(root).length+1);assert.throws(()=>indexCourse({id:'a',children:[{id:'a'}]}),/Duplicate/)});
