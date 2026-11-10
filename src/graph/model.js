import {root,nodes,paths} from '../data/course.js';
import {relationships} from '../data/relationships.js';
export function buildGraph(tree,links){
 const graphNodes={},edges=[];
 function walk(node,parent,domain){
  if(graphNodes[node.id])throw Error(`Duplicate topic ${node.id}`);
  graphNodes[node.id]={...node,domain:domain||node.id};
  if(parent)edges.push({id:`hierarchy-${parent}-${node.id}`,source:parent,target:node.id,type:'hierarchical'});
  node.children?.forEach(child=>walk(child,node.id,node===tree?child.id:domain));
 }
 walk(tree,null,null);
 const seen=new Set();
 for(const link of links){
  if(!graphNodes[link.source]||!graphNodes[link.target])throw Error(`Unknown relationship endpoint: ${link.id}`);
  if(link.source===link.target)throw Error(`Self relationship: ${link.id}`);
  const key=[link.source,link.target].sort().join(':');
  if(seen.has(key))throw Error(`Duplicate relationship: ${key}`);seen.add(key);
  edges.push({...link,type:'conceptual'});
 }
 return {nodes:graphNodes,edges};
}
export const graph=buildGraph(root,relationships);
export function neighbours(id,type){return graph.edges.filter(e=>(!type||e.type===type)&&(e.source===id||e.target===id)).map(e=>({id:e.source===id?e.target:e.source,edge:e}));}
export function focusedIds(id){return [...new Set([id,...neighbours(id).map(n=>n.id)])];}
// Fixed slots on expanding rectangular rings. New nodes fill free slots;
// existing positions never change when the network grows.
export function placeNodes(ids,existing={}){
 const positions={...existing};const occupied=new Set(Object.values(positions).map(p=>`${p.x},${p.y}`));
 let slots=[{x:0,y:0}];
 for(let ring=1;ring<=12;ring++){
  const perimeter=[];
  for(let x=-ring;x<=ring;x++)for(let y=-ring;y<=ring;y++)if(Math.max(Math.abs(x),Math.abs(y))===ring)perimeter.push({x:x*300,y:y*165});
  perimeter.sort((a,b)=>Math.atan2(a.y,a.x)-Math.atan2(b.y,b.x));slots.push(...perimeter);
 }
 for(const id of ids){if(positions[id])continue;const slot=slots.find(p=>!occupied.has(`${p.x},${p.y}`));positions[id]=slot;occupied.add(`${slot.x},${slot.y}`);}
 return positions;
}
export const topicDescription=id=>nodes[id].description||`Explore ${nodes[id].title.toLowerCase()} in ${paths[id].at(-2)?.title.toLowerCase()||'the course'}. Follow a connection to see how this idea fits into a wider physical picture.`;
