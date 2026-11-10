// Screen-space presentation only: never changes graph coordinates or edges.
// At overview zoom, retain readable chips where they fit and selectable markers
// elsewhere. Hover/focus exposes a marker's full label without resizing the map.
export function placeReadableLabels(ids,coords,selected,connected,camera,size){
 const result={},occupied=[];
 const order=[...ids].sort((a,b)=>(a===selected?0:connected.has(a)?1:2)-(b===selected?0:connected.has(b)?1:2));
 for(const id of order){
  const x=size.width/2+camera.x+coords[id].x*camera.scale,y=size.height/2+camera.y+coords[id].y*camera.scale;
  const width=Math.min(210,Math.max(140,coords[id].title.length*8.3+40));
  const height=Math.ceil(coords[id].title.length*8.3/(width-30))*21+24;
  let box;
  if(x>=0&&x<=size.width&&y>=0&&y<=size.height){
   for(const [dx,dy] of [[0,0],[0,-42],[0,42],[-65,-30],[65,30],[0,-80],[0,80]]){
    const cx=Math.max(width/2+8,Math.min(size.width-width/2-8,x+dx));
    const cy=Math.max(height/2+8,Math.min(size.height-height/2-68,y+dy));
    const candidate={left:cx-width/2,right:cx+width/2,top:cy-height/2,bottom:cy+height/2};
    if(!occupied.some(p=>candidate.left<p.right+8&&candidate.right>p.left-8&&candidate.top<p.bottom+6&&candidate.bottom>p.top-6)){
     box={...candidate,dx:cx-x,dy:cy-y,width};occupied.push(candidate);break;
    }
   }
  }
  result[id]=box||{marker:true,dx:0,dy:0};
 }
 return result;
}
