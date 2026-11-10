export const course = {
 id:'phys1202', title:'Course overview', children:[
 {id:'electricity',title:'Electricity',description:'From a single charge to the circuits that connect our world.',theme:'violet',children:[
 {id:'fields-forces',title:'Electric Fields and Forces',description:'Discover how charges interact, and how fields describe the space around them.',children:[
 ['charge','Electric Charge'],['coulomb','Coulomb’s Law'],['electric-field','Electric Field'],['superposition','Superposition'],['charge-motion','Motion of Charges in Electric Fields']]},
 {id:'potential',title:'Electric Potential',description:'A new perspective on electric interactions through energy and potential.',children:[['potential-energy','Electric Potential Energy'],['electric-potential','Electric Potential'],['field-potential','Relationship Between Electric Field and Potential'],['energy-conservation','Conservation of Energy']]},
 {id:'matter',title:'Matter in Electric Fields',description:'Explore how materials respond to electric fields and carry electric current.',children:[['conductors','Conductors and Insulators'],['polarization','Polarization'],['current','Electric Current'],['resistance','Resistance and Resistivity'],['circuits','Simple Resistive Circuits'],{id:'capacitors',title:'Capacitors',children:[['capacitance','Capacitance'],['parallel-plate','Parallel-Plate Capacitors'],['dielectrics','Dielectrics']]}]}
 ]},
 {id:'magnetism',title:'Magnetism',description:'Explore moving charges, invisible fields, and magnetic forces.',theme:'blue',children:[
 {id:'math-methods',title:'Mathematical Methods',children:[['vector-product','Vector Product and Hand Rules']]},
 {id:'magnetic-fields',title:'Magnetic Fields',children:[['moving-charge-field','Magnetic Field Produced by a Moving Charge'],['current-fields','Magnetic Fields Produced by Currents'],['wire-loop-fields','Fields of Straight Wires and Loops']]},
 {id:'magnetic-forces',title:'Magnetic Forces',children:[['moving-charge-force','Forces on Moving Charges'],['wire-forces','Forces on Current-Carrying Wires']]},
 {id:'magnetic-motion',title:'Motion in Magnetic Fields',children:[['circular-motion','Circular Motion'],['mass-spectrometers','Mass Spectrometers']]}
 ]},
 {id:'thermodynamics',title:'Ideal Gases and Thermodynamics',description:'Connect the microscopic world to heat, work, and energy.',theme:'orange',children:[['ideal-gas','Ideal Gas Law'],['gas-processes','Ideal Gas Processes'],['heat-work','Heat and Work'],['first-law','First Law of Thermodynamics'],['calorimetry','Calorimetry'],['specific-heat','Specific Heat of Ideal Gases'],['adiabatic','Adiabatic Processes']]}
 ]
};
function normalize(node){if(Array.isArray(node))return {id:node[0],title:node[1]};return {...node,children:node.children?.map(normalize)};}
export const root=normalize(course);
export function indexCourse(tree){const nodes={},paths={};function walk(node,parents){if(nodes[node.id])throw Error('Duplicate topic ID: '+node.id);nodes[node.id]=node;paths[node.id]=[...parents,node];node.children?.forEach(child=>walk(child,paths[node.id]));}walk(tree,[]);return {nodes,paths};}
export const {nodes,paths}=indexCourse(root);
export function descendants(node){return (node.children||[]).flatMap(child=>[child,...descendants(child)]);}
