<script setup>
import { IFCLoader } from "web-ifc-three"
import { ref,reactive } from 'vue'
import * as vNG from "v-network-graph"
import dagre from "dagre/dist/dagre.min.js"

import {IFCRELAGGREGATES , IFCRELASSIGNS , IFCRELASSIGNSTOACTOR , IFCRELASSIGNSTOCONTROL , IFCRELASSIGNSTOGROUP , IFCRELASSIGNSTOGROUPBYFACTOR , IFCRELASSIGNSTOPROCESS , IFCRELASSIGNSTOPRODUCT , IFCRELASSIGNSTORESOURCE , IFCRELASSOCIATES , IFCRELASSOCIATESAPPROVAL , IFCRELASSOCIATESCLASSIFICATION , IFCRELASSOCIATESCONSTRAINT , IFCRELASSOCIATESDOCUMENT , IFCRELASSOCIATESLIBRARY , IFCRELASSOCIATESMATERIAL , IFCRELCONNECTS , IFCRELCONNECTSELEMENTS , IFCRELCONNECTSPATHELEMENTS , IFCRELCONNECTSPORTTOELEMENT , IFCRELCONNECTSPORTS , IFCRELCONNECTSSTRUCTURALACTIVITY , IFCRELCONNECTSSTRUCTURALMEMBER , IFCRELCONNECTSWITHECCENTRICITY , IFCRELCONNECTSWITHREALIZINGELEMENTS , IFCRELCONTAINEDINSPATIALSTRUCTURE , IFCRELCOVERSBLDGELEMENTS , IFCRELCOVERSSPACES , IFCRELDECLARES , IFCRELDECOMPOSES , IFCRELDEFINES , IFCRELDEFINESBYOBJECT , IFCRELDEFINESBYPROPERTIES , IFCRELDEFINESBYTEMPLATE , IFCRELDEFINESBYTYPE , IFCRELFILLSELEMENT , IFCRELFLOWCONTROLELEMENTS , IFCRELINTERFERESELEMENTS , IFCRELNESTS , IFCRELPOSITIONS , IFCRELPROJECTSELEMENT , IFCRELREFERENCEDINSPATIALSTRUCTURE , IFCRELSEQUENCE , IFCRELSERVICESBUILDINGS , IFCRELSPACEBOUNDARY , IFCRELSPACEBOUNDARY1STLEVEL , IFCRELSPACEBOUNDARY2NDLEVEL , IFCRELVOIDSELEMENT , IFCRELATIONSHIP} from "web-ifc";

const props = defineProps({
	expressID : Number,
	ifcLoader : IFCLoader,
	modelId : Number
})


const nodes = ref({});
const edges = ref({});
const layouts = ref({});
layouts.value.nodes={};


var propNames = ["RelatedProcess","RelatedObjects","RelatingGroup","RelatingProcess","RelatingProduct","RelatingControl","RelatingResource","RelatingActor","RelatingObject","RelatingClassification","RelatingDocument","RelatingLibrary","RelatingType","RelatingPropertyDefinition","RelatingStructure","RelatedElements"];
var relObjects = [IFCRELAGGREGATES , IFCRELASSIGNS , IFCRELASSIGNSTOACTOR , IFCRELASSIGNSTOCONTROL , IFCRELASSIGNSTOGROUP , IFCRELASSIGNSTOGROUPBYFACTOR , IFCRELASSIGNSTOPROCESS , IFCRELASSIGNSTOPRODUCT , IFCRELASSIGNSTORESOURCE , IFCRELASSOCIATES , IFCRELASSOCIATESAPPROVAL , IFCRELASSOCIATESCLASSIFICATION , IFCRELASSOCIATESCONSTRAINT , IFCRELASSOCIATESDOCUMENT , IFCRELASSOCIATESLIBRARY , IFCRELASSOCIATESMATERIAL , IFCRELCONNECTS , IFCRELCONNECTSELEMENTS , IFCRELCONNECTSPATHELEMENTS , IFCRELCONNECTSPORTTOELEMENT , IFCRELCONNECTSPORTS , IFCRELCONNECTSSTRUCTURALACTIVITY , IFCRELCONNECTSSTRUCTURALMEMBER , IFCRELCONNECTSWITHECCENTRICITY , IFCRELCONNECTSWITHREALIZINGELEMENTS , IFCRELCONTAINEDINSPATIALSTRUCTURE , IFCRELCOVERSBLDGELEMENTS , IFCRELCOVERSSPACES , IFCRELDECLARES , IFCRELDECOMPOSES , IFCRELDEFINES , IFCRELDEFINESBYOBJECT , IFCRELDEFINESBYPROPERTIES , IFCRELDEFINESBYTEMPLATE , IFCRELDEFINESBYTYPE , IFCRELFILLSELEMENT , IFCRELFLOWCONTROLELEMENTS , IFCRELINTERFERESELEMENTS , IFCRELNESTS , IFCRELPOSITIONS , IFCRELPROJECTSELEMENT , IFCRELREFERENCEDINSPATIALSTRUCTURE , IFCRELSEQUENCE , IFCRELSERVICESBUILDINGS , IFCRELSPACEBOUNDARY , IFCRELSPACEBOUNDARY1STLEVEL , IFCRELSPACEBOUNDARY2NDLEVEL , IFCRELVOIDSELEMENT , IFCRELATIONSHIP];

var maxDepth=1;

var relEntities = [];
for (var i=0; i < relObjects.length;i++) {
	var items = await props.ifcLoader.ifcManager.getAllItemsOfType(props.modelId,relObjects[i],true);
	for (var x=0; x < items.length;x++) relEntities.push(items[x]);
}


function layout() {
  if (Object.keys(nodes.value) <= 1 || Object.keys(edges.value).length == 0) return
	const g = new dagre.graphlib.Graph()
  g.setGraph({
    rankdir: "TB",
		ranker:"longest-path",
    nodesep: 60 * 2,
    edgesep: 60,
    ranksep: 60 * 5,
  })
  g.setDefaultEdgeLabel(() => ({}))
	Object.entries(nodes.value).forEach(([nodeId, node]) => {
    g.setNode(nodeId, { label: node.name, width: 40, height: 40 })
  })
  Object.values(edges.value).forEach(edge => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  g.nodes().forEach(nodeId => {
    const x = g.node(nodeId).x
    const y = g.node(nodeId).y
    layouts.value.nodes[nodeId] = { x, y }
  })
}

function generateName(item) {
	var name = null;
	if (item.Name!=null)  name=item.Name.value;
	else if(name == null && item.LongName!=null) name=item.LongName.value;
  else if (name == null && item.Description!=null) name=item.Description.value;
  else {
		var keys = Object.keys(item);
		for (var i=0; i < keys.length;i++) {
			if (keys[i].includes("Name") && item[keys[i]]!=null) {
				name = item[keys[i]].value;
				break;
			}
		}
	} 

	if (name==null) name=""+item.expressID;
	type="";//props.ifcLoader.ifcManager.getIfcType(props.modelId,item.expressID);
	if (type != null) {
		var type=type.replace("IFC","");
		name = "("+type+")"+name;
	}
	return name;
}


function containsProp(data,expressID) {
	var keys = Object.keys(data);
	for (var i=0; i < keys.length;i++) {
		if (propNames.includes(keys[i]) && data[keys[i]].value==expressID) return keys[i];
	}
	return null;
}

function createEdge(source,target,label) {
	var edgesList = Object.keys(edges.value);
	for (var i=0; i < edgesList.length;i++) {
		if (edges.value[edgesList[i]].source==""+source && edges.value[edgesList[i]].target==""+target) return;
	}
	edges.value[i] = { 'source': ""+source, 'target':""+target,'label':label};
}

async function getInverseRelationships(expressID,depth) {
	for (var i=0; i < relEntities.length;i++) {
			var pName = containsProp(relEntities[i],expressID);
			if ( pName != null ) await generateNode(relEntities[i].expressID,depth+1,false,true);
	}
}

async function generateNode(expressID,depth,root,relationship) {
	var nativeData =  await props.ifcLoader.ifcManager.getItemProperties(props.modelId,expressID,false);
	var name = generateName(nativeData);
	if (relationship) name='';
	if (nodes.value[expressID]==null) nodes.value[expressID] = { 'name': name,'root':root,'relationship':relationship}; 
	var keys = Object.keys(nativeData);
	for (var i=0; i < keys.length;i++) {
		if (keys[i] == "Representation" ) continue;
		if (typeof nativeData[keys[i]] === 'object' && nativeData[keys[i]] !== null)
			if (Array.isArray(nativeData[keys[i]])) {
				for (var x=0; x < nativeData[keys[i]].length ;x++) {
					if (nativeData[keys[i]][x].type ==5 ) {
						await generateNode(nativeData[keys[i]][x].value,depth+1,false,false);
						createEdge(expressID,nativeData[keys[i]][x].value,keys[i]);
					}
				}
			} else if (nativeData[keys[i]].type ==5 ) {
			await generateNode(nativeData[keys[i]].value,depth+1,false,false);
			createEdge(expressID,nativeData[keys[i]].value,keys[i]);
		}
	}
	if (depth <= maxDepth) await getInverseRelationships(expressID,depth);
}


await generateNode(props.expressID,0,true,false);

const configs = reactive( vNG.defineConfigs({
		view: {
			autoPanAndZoomOnLoad: "fit-content"
		},
    node: {
      normal: {
        type: node =>  node.relationship ? "rect" : "circle",
				radius: node => node.root ? 20 : 10,
				width: 10,
				height: 10,
		    color: node => node.root ? "red" : "blue"
      }
    },
		edge:{
			marker: {
				target: {
	          type: "arrow",
	          width: 4,
	          height: 4,
	          margin: -1,
	          units: "strokeWidth",
	          color: null,
	        }
				}
		}
}));

layout();
</script>

<template>
  <v-network-graph class="graph" :nodes="nodes" :edges="edges" :layouts="layouts" :configs="configs">
		<template #edge-label="{ edge, ...slotProps }">
			<v-edge-label :text="edge.label" align="center" vertical-align="above" v-bind="slotProps" />
		</template>
	</v-network-graph>
</template>

<style scoped>
.graph {
  width: 100%;
  height: 100%;
  border: 1px solid #000;
}
</style>
