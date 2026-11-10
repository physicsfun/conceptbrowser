import React,{useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {CSS2DRenderer,CSS2DObject} from 'three/addons/renderers/CSS2DRenderer.js';
import {Plus,Minus,Maximize,Focus} from 'lucide-react';
import {graph,neighbours} from './model';
import {groupOf,groups} from './layouts';
const colours={electricity:0xb49be8,magnetism:0x81c6e0,thermodynamics:0xe4b976,phys1202:0xc5cbd8};
export default function Graph3D({layout,positions,visible,selected,edges,onSelect,onEdge,command,active,onFallback}){
 const previousPositions=useRef();const host=useRef();const runtime=useRef();const callbacks=useRef({onSelect,onEdge});callbacks.current={onSelect,onEdge};
 const [error,setError]=useState(null);const [ready,setReady]=useState(false);
 useEffect(()=>{
  let renderer,controls,labelRenderer;let stopped=false;let scheduled=0;const element=host.current;
  try{
   renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));renderer.setClearColor(0x141923);element.appendChild(renderer.domElement);
   const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x141923,.00018);
   const camera=new THREE.PerspectiveCamera(48,1,1,20000);camera.position.set(400,280,1200);
   controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;controls.minDistance=90;controls.maxDistance=10000;
   labelRenderer=new CSS2DRenderer();labelRenderer.domElement.className='spatial-labels';element.appendChild(labelRenderer.domElement);
   scene.add(new THREE.HemisphereLight(0xd9e5ff,0x34304b,2.4));const light=new THREE.DirectionalLight(0xffffff,2);light.position.set(500,600,800);scene.add(light);
   const content=new THREE.Group();scene.add(content);
   function draw(){if(stopped)return;scheduled=0;renderer.render(scene,camera);labelRenderer.render(scene,camera);separateLabels(content,element)}
   function requestDraw(){if(!scheduled)scheduled=requestAnimationFrame(draw)}
   function resize(){const {width,height}=element.getBoundingClientRect();if(width<1||height<1)return;camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height);labelRenderer.setSize(width,height);requestDraw()}
   const observer=new ResizeObserver(resize);observer.observe(element);controls.addEventListener('change',requestDraw);
   const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();let down;
   const pointerDown=e=>{down={x:e.clientX,y:e.clientY}};
   const click=e=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)return;const rect=element.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(content.children,true).find(h=>h.object.userData.topic||h.object.userData.edge);if(hit?.object.userData.topic)callbacks.current.onSelect(hit.object.userData.topic);else if(hit?.object.userData.edge)callbacks.current.onEdge(hit.object.userData.edge)};
   renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointerup',click);
   const lost=e=>{e.preventDefault();setError('The graphics context was lost. Your exploration is preserved; switch to a 2D view to continue.')};renderer.domElement.addEventListener('webglcontextlost',lost);
   function focus(ids,coords,close=false,orbital=false){const box=new THREE.Box3();ids.forEach(id=>{const p=coords[id];if(p)box.expandByPoint(new THREE.Vector3(p.x,p.y,p.z))});if(box.isEmpty())return;const target=orbital?new THREE.Vector3():box.getCenter(new THREE.Vector3());const radius=orbital?Math.max(100,...ids.map(id=>Math.hypot(coords[id].x,coords[id].y,coords[id].z))):Math.max(100,box.getSize(new THREE.Vector3()).length()/2);const distance=close?440:Math.max(600,radius/Math.sin(THREE.MathUtils.degToRad(24))*1.2/Math.min(1,camera.aspect));const direction=camera.position.clone().sub(controls.target).normalize();controls.target.copy(target);camera.position.copy(target).addScaledVector(direction,distance);controls.update();requestDraw();}
   runtime.current={renderer,scene,camera,controls,content,requestDraw,focus,resize};resize();setReady(true);
   return()=>{stopped=true;cancelAnimationFrame(scheduled);observer.disconnect();controls.removeEventListener('change',requestDraw);controls.dispose();renderer.domElement.removeEventListener('pointerdown',pointerDown);renderer.domElement.removeEventListener('pointerup',click);renderer.domElement.removeEventListener('webglcontextlost',lost);disposeContent(content);renderer.dispose();renderer.forceContextLoss();element.replaceChildren();runtime.current=null};
  }catch(e){controls?.dispose();renderer?.dispose();element.replaceChildren();setError('WebGL could not start in this browser. All four 2D layouts and Browse remain available.');}
 },[]);
 useEffect(()=>{
  const rt=runtime.current;if(!rt||!ready||error)return;
  const {content}=rt;disposeContent(content);
  const connected=new Set([selected,...neighbours(selected).map(n=>n.id)]);
  if(layout.kind==='radial'){
   const radii=[...new Set(visible.filter(id=>id!==selected).map(id=>Math.round(Math.hypot(positions[id].x,positions[id].y,positions[id].z))))];
   radii.forEach(radius=>{const shell=new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(radius,1)),new THREE.LineBasicMaterial({color:0x586581,transparent:true,opacity:.12,depthWrite:false}));content.add(shell)});
  }
  if(layout.kind==='cluster'){
   groups.forEach(group=>{const members=visible.filter(id=>groupOf(id)===group);if(!members.length)return;const centre=new THREE.Vector3();members.forEach(id=>centre.add(new THREE.Vector3(positions[id].x,positions[id].y,positions[id].z)));centre.divideScalar(members.length);const radius=Math.max(110,...members.map(id=>centre.distanceTo(new THREE.Vector3(positions[id].x,positions[id].y,positions[id].z))))+50;const region=new THREE.Mesh(new THREE.SphereGeometry(radius,20,12),new THREE.MeshBasicMaterial({color:colours[graph.nodes[members[0]].domain]||0xb49be8,transparent:true,opacity:.045,depthWrite:false,side:THREE.BackSide}));region.position.copy(centre);content.add(region);
    const title=document.createElement('span');title.className='spatial-cluster-title';title.textContent=graph.nodes[group].title;const label=new CSS2DObject(title);label.position.copy(centre).add(new THREE.Vector3(0,radius+35,0));content.add(label);
   });
  }
  edges.forEach(edge=>{const a=positions[edge.source],b=positions[edge.target];const immediate=edge.source===selected||edge.target===selected;const material=edge.type==='hierarchical'?new THREE.LineDashedMaterial({color:0x8b9caf,dashSize:10,gapSize:10,transparent:true,opacity:immediate?.65:.18}):new THREE.LineBasicMaterial({color:0xbda0ed,transparent:true,opacity:immediate?.85:.2});const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(a.x,a.y,a.z),new THREE.Vector3(b.x,b.y,b.z)]),material);line.computeLineDistances();line.userData.edge=edge.id;content.add(line)});
  const moving=[];
  visible.forEach(id=>{
   const node=graph.nodes[id],p=positions[id];const picked=id===selected;const colour=colours[node.domain]||0xc5cbd8;
   const mesh=new THREE.Mesh(layout.kind==='cluster'?new THREE.IcosahedronGeometry(picked?22:15,1):new THREE.SphereGeometry(picked?22:14,20,12),new THREE.MeshStandardMaterial({color:colour,metalness:.18,roughness:.4,emissive:colour,emissiveIntensity:picked?.45:.1,transparent:true,opacity:connected.has(id)?1:.45}));mesh.position.set(p.x,p.y,p.z);mesh.userData.topic=id;content.add(mesh);moving.push({object:mesh,id,offset:0});
   if(picked){const ring=new THREE.Mesh(new THREE.TorusGeometry(33,1.5,8,48),new THREE.MeshBasicMaterial({color:colour}));ring.position.copy(mesh.position);ring.quaternion.copy(rt.camera.quaternion);content.add(ring);moving.push({object:ring,id,offset:0})}
   const button=document.createElement('button');button.className=`spatial-label ${picked?'selected':''} ${connected.has(id)?'connected':'distant'}`;button.textContent=node.title;button.setAttribute('aria-pressed',String(picked));button.onclick=()=>callbacks.current.onSelect(id);button.style.borderColor=`#${new THREE.Color(colour).getHexString()}`;
   const label=new CSS2DObject(button);label.position.set(p.x,p.y-40,p.z);label.userData={topic:id,priority:picked?0:connected.has(id)?1:2};content.add(label);moving.push({object:label,id,offset:-40});
  });
  const previous=previousPositions.current;previousPositions.current={layout:layout.id,coords:positions};
  let frame=0;
  if(layout.kind==='radial'&&previous?.layout===layout.id&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
   const began=performance.now();const animate=()=>{const t=Math.min(1,(performance.now()-began)/320),ease=t*t*(3-2*t);const current={};visible.forEach(id=>{const a=previous.coords[id]||positions[id],b=positions[id];current[id]={x:a.x+(b.x-a.x)*ease,y:a.y+(b.y-a.y)*ease,z:a.z+(b.z-a.z)*ease}});moving.forEach(({object,id,offset})=>{const p=current[id];object.position.set(p.x,p.y+offset,p.z)});content.children.filter(o=>o.userData.edge).forEach(line=>{const edge=edges.find(e=>e.id===line.userData.edge),a=current[edge.source],b=current[edge.target];const attr=line.geometry.attributes.position;attr.setXYZ(0,a.x,a.y,a.z);attr.setXYZ(1,b.x,b.y,b.z);attr.needsUpdate=true;line.computeLineDistances();line.geometry.computeBoundingSphere()});rt.requestDraw();if(t<1)frame=requestAnimationFrame(animate)};animate();
  }else rt.requestDraw();
  return()=>cancelAnimationFrame(frame);
 },[ready,error,positions,visible,selected,edges,layout.id]);
 const previousLayout=useRef();
 useEffect(()=>{const rt=runtime.current;if(!rt||!ready)return;if(previousLayout.current!==layout.id){previousLayout.current=layout.id;rt.focus(visible,positions, false,layout.kind==='radial');}else if(layout.kind==='radial')rt.focus(visible,positions,false,true);},[ready,layout.id,positions]);
 useEffect(()=>{const rt=runtime.current;if(!rt||!ready||!command)return;if(command.type==='center')rt.focus([selected],positions,true);else if(command.type==='group')rt.focus(visible.filter(id=>groupOf(id)===command.group),positions);else rt.focus(visible,positions,false,layout.kind==='radial');},[ready,command]);
 useEffect(()=>{if(active)runtime.current?.resize()},[active]);
 function zoom(factor){const rt=runtime.current;if(!rt)return;rt.camera.position.sub(rt.controls.target).multiplyScalar(factor).add(rt.controls.target);rt.controls.update();rt.requestDraw()}
 function keyDown(e){const rt=runtime.current;if(!rt||e.target!==e.currentTarget)return;const delta={ArrowLeft:[-.12,0],ArrowRight:[.12,0],ArrowUp:[0,-.12],ArrowDown:[0,.12]}[e.key];if(delta){e.preventDefault();const offset=rt.camera.position.clone().sub(rt.controls.target),s=new THREE.Spherical().setFromVector3(offset);s.theta+=delta[0];s.phi=THREE.MathUtils.clamp(s.phi+delta[1],.05,Math.PI-.05);rt.camera.position.copy(rt.controls.target).add(new THREE.Vector3().setFromSpherical(s));rt.controls.update();rt.requestDraw();}if(e.key==='+'||e.key==='=')zoom(.85);if(e.key==='-')zoom(1.18);}
 return <div className="spatial-stage" tabIndex={0} onKeyDown={keyDown} aria-label="3D concept map. Drag to orbit, right-drag or two-finger drag to pan, scroll to zoom. Arrow keys rotate, plus and minus zoom."><div className="spatial-canvas" ref={host}/>{error?<div className="webgl-error" role="alert"><strong>Try a different perspective</strong><p>{error}</p><button className="primary" onClick={onFallback}>Switch to 2D Force-Directed</button></div>:<><span className="spatial-badge">3D · {layout.short.toUpperCase()} · {ready?'READY':'STARTING'}</span><div className="graph-controls"><button aria-label="Zoom in" onClick={()=>zoom(.8)}><Plus size={17}/></button><button aria-label="Zoom out" onClick={()=>zoom(1.25)}><Minus size={17}/></button><button aria-label="Fit revealed network" onClick={()=>runtime.current?.focus(visible,positions,false,layout.kind==='radial')}><Maximize size={16}/></button><button aria-label="Center selected concept" onClick={()=>runtime.current?.focus([selected],positions,true)}><Focus size={17}/></button></div></>}</div>;
}
function disposeContent(group){for(const child of [...group.children]){child.traverse(object=>{object.geometry?.dispose();if(Array.isArray(object.material))object.material.forEach(m=>m.dispose());else object.material?.dispose();object.element?.remove();});group.remove(child)}}

// Labels retain a fixed screen size. A small deterministic screen-space nudge
// gives selected/adjacent ideas priority when projected labels overlap.
function separateLabels(content,host){
 const labels=content.children.filter(o=>o.isCSS2DObject&&o.element.tagName==='BUTTON').sort((a,b)=>(a.userData.priority??2)-(b.userData.priority??2));
 const placed=[];const offsets=[[0,0],[0,-30],[0,30],[0,-60],[0,60],[-65,-30],[65,30],[0,-90],[0,90]];
 for(const label of labels){const el=label.element;if(el.style.display==='none')continue;const r=el.getBoundingClientRect();let offset=offsets[0];for(const [dx,dy] of offsets){const candidate={left:r.left+dx,right:r.right+dx,top:r.top+dy,bottom:r.bottom+dy};if(!placed.some(p=>candidate.left<p.right+5&&candidate.right>p.left-5&&candidate.top<p.bottom+4&&candidate.bottom>p.top-4)){offset=[dx,dy];break}}
  const [dx,dy]=offset;el.style.transform+=` translate(${dx}px,${dy}px)`;el.style.zIndex=String(label.userData.priority===0?10000:label.userData.priority===1?1000:100);placed.push({left:r.left+dx,right:r.right+dx,top:r.top+dy,bottom:r.bottom+dy});
 }
}
