import {graph} from './model.js';
import {focusedIds,placeNodes,neighbours} from './model.js';
export function initialExploration(id='electric-field'){
 const visible=focusedIds(id);return {scope:'focused',selected:id,visible,positions:placeNodes(visible),history:[id]};
}
export function explorationReducer(state,action){
 if(action.type==='reset')return initialExploration(action.id||'electric-field');
 if(action.type==='overview'){const visible=Object.keys(graph.nodes);return {...state,scope:'overview',visible,positions:placeNodes(visible,state.positions)};}
 if(action.type==='focus'){const visible=focusedIds(state.selected);return {...state,scope:'focused',visible};}
 if(action.type==='expand'){const visible=[...new Set([...state.visible,...state.visible.flatMap(id=>neighbours(id).map(n=>n.id))])];return {...state,visible,positions:placeNodes(visible,state.positions)};}
 if(action.type==='select'){
  const visible=[...new Set([...state.visible,...focusedIds(action.id)])];
  return {...state,selected:action.id,visible,positions:placeNodes(visible,state.positions),history:state.history.at(-1)===action.id?state.history:[...state.history,action.id].slice(-30)};
 }
 if(action.type==='back'&&state.history.length>1){const history=state.history.slice(0,-1);return {...state,selected:history.at(-1),history};}
 return state;
}
