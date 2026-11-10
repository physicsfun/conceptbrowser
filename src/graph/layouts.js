import {forceSimulation,forceLink,forceManyBody,forceCollide,forceCenter} from 'd3-force-3d';
import {graph} from './model.js';
import {paths} from '../data/course.js';
export const layouts=[
 {id:'force2',name:'2D Force-Directed Network',short:'Force-directed',dimension:2,kind:'force',emphasis:'Natural conceptual relationships',description:'Links act like springs; repulsion separates ideas. Drag a card to adjust the settled network. Can connected ideas reveal a structure beyond the syllabus?'},
 {id:'radial2',name:'2D Radial Concept Map',short:'Radial',dimension:2,kind:'radial',emphasis:'Relationships around one concept',description:'The selected idea sits at the centre. Graph distance determines concentric rings, making nearby connections easy to compare.'},
 {id:'layered2',name:'2D Hierarchical / Layered Graph',short:'Layered',dimension:2,kind:'layered',emphasis:'Course structure and cross-links',description:'Columns follow curriculum depth; rows follow course order. Dashed hierarchy links form a scaffold, with curved conceptual links crossing between branches.'},
 {id:'cluster2',name:'2D Clustered Network',short:'Clustered',dimension:2,kind:'cluster',emphasis:'Conceptual communities',description:'Subject groups occupy labelled islands. Connections crossing the gaps expose bridges between electric fields, potential, matter, magnetism, and heat.'},
 {id:'force3',name:'3D Force-Directed Network',short:'Spatial forces',dimension:3,kind:'force',emphasis:'Spatial exploration of the network',description:'A three-dimensional spring network settles into a volume. Orbit to inspect connections that overlap in a flat view; depth may help or hinder.'},
 {id:'radial3',name:'3D Radial / Orbital Network',short:'Orbital',dimension:3,kind:'radial',emphasis:'Three-dimensional conceptual neighbourhood',description:'The selected concept anchors nested shells. Orbit around its neighbours to compare their connections; selecting an idea rebuilds the shells around it.'},
 {id:'cluster3',name:'3D Clustered Network',short:'Spatial clusters',dimension:3,kind:'cluster',emphasis:'Spatial organization of subject areas',description:'Subject groups occupy distinct regions of space. Focus on a group or pull back to examine the bridges linking the course.'}
];
export const groups=['fields-forces','potential','matter','magnetism','thermodynamics','phys1202'];
export function groupOf(id){const path=paths[id];return path[1]?.id==='electricity'?(path[2]?.id||'fields-forces'):(path[1]?.id||'phys1202');}
export function distances(ids,selected){const allowed=new Set(ids),result={[selected]:0},queue=[selected];for(const id of queue){for(const e of graph.edges){const next=e.source===id?e.target:e.target===id?e.source:null;if(next&&allowed.has(next)&&result[next]===undefined){result[next]=result[id]+1;queue.push(next)}}}return result;}
function fibonacci(i,n,r){const y=1-2*(i+.5)/n,angle=i*Math.PI*(3-Math.sqrt(5));return {x:r*Math.sqrt(1-y*y)*Math.cos(angle),y:r*y,z:r*Math.sqrt(1-y*y)*Math.sin(angle)};}
export function calculateLayout(mode,ids,selected,previous={}){
 const config=layouts.find(l=>l.id===mode);if(!config)throw Error(`Unknown layout: ${mode}`);
 const dimension=config.dimension;const result={};
 if(config.kind==='force'){
  const ns=ids.map((id,i)=>({id,...(previous[id]?{...previous[id],fx:previous[id].x,fy:previous[id].y,...(dimension===3?{fz:previous[id].z}: {})}:(dimension===3?fibonacci(i,ids.length,350):{x:Math.cos(i*2.399)*320,y:Math.sin(i*2.399)*320}))}));
  const links=graph.edges.filter(e=>ids.includes(e.source)&&ids.includes(e.target)).map(e=>({source:e.source,target:e.target,strength:e.type==='conceptual'?.65:.18}));
  const simulation=forceSimulation(ns,dimension).force('links',forceLink(links).id(n=>n.id).distance(dimension===3?220:310).strength(e=>e.strength)).force('charge',forceManyBody().strength(dimension===3?-1800:-3200)).force('collision',forceCollide(dimension===3?95:145)).force('centre',forceCenter()).stop();
  simulation.tick(280);for(const n of ns)result[n.id]={x:n.x,y:n.y,z:dimension===3?n.z:0};return result;
 }
 if(config.kind==='radial'){
  const ds=distances(ids,selected),shells={};for(const id of ids){const d=ds[id]??Math.max(1,...Object.values(ds))+1;(shells[d]??=[]).push(id)}
  for(const [distance,members] of Object.entries(shells)){const d=Number(distance);if(d===0){result[members[0]]={x:0,y:0,z:0};continue}const radius=dimension===3?d*290:Math.max(d*340,members.length*140/Math.PI);members.forEach((id,i)=>{const angle=2*Math.PI*i/members.length-Math.PI/2;result[id]=dimension===3?fibonacci(i,members.length,radius):{x:Math.cos(angle)*radius,y:Math.sin(angle)*radius,z:0}})}return result;
 }
 if(config.kind==='layered'){
  const levels={};for(const id of ids)(levels[paths[id].length-1]??=[]).push(id);
  for(const [depth,members] of Object.entries(levels)){members.sort((a,b)=>Object.keys(graph.nodes).indexOf(a)-Object.keys(graph.nodes).indexOf(b));members.forEach((id,i)=>result[id]={x:Number(depth)*330,y:(i-(members.length-1)/2)*155,z:0})}return result;
 }
 const buckets={};for(const id of ids)(buckets[groupOf(id)]??=[]).push(id);
 groups.forEach((group,index)=>{const members=buckets[group]||[];const centre=dimension===3?fibonacci(index,groups.length,720):{x:(index%3-1)*1020,y:(Math.floor(index/3)-.5)*1000,z:0};members.forEach((id,i)=>{const local=dimension===3?fibonacci(i,members.length,100+members.length*12):{x:(i%3-1)*265,y:(Math.floor(i/3)-(Math.ceil(members.length/3)-1)/2)*155,z:0};result[id]={x:centre.x+local.x,y:centre.y+local.y,z:centre.z+local.z}})});return result;
}
export function bounds(positions,ids){const ps=ids.map(id=>positions[id]).filter(Boolean);return {minX:Math.min(...ps.map(p=>p.x))-135,maxX:Math.max(...ps.map(p=>p.x))+135,minY:Math.min(...ps.map(p=>p.y))-80,maxY:Math.max(...ps.map(p=>p.y))+80};}
