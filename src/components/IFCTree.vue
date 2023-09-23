<script setup>
import Tree from "vue3-treeview";
import "vue3-treeview/dist/style.css";
import { IFCLoader } from "web-ifc-three"
import { ref,watch } from 'vue'

const props = defineProps({
	ifcLoader : IFCLoader,
	modelId : Number,
	expressID: Number
});

const config = ref({});
const dataModel = ref({});
const selected = ref({data:null});

if (props.ifcLoader != null ) {
	var spatialStructure = await props.ifcLoader.ifcManager.getSpatialStructure(props.modelId,false);
	dataModel.value[""+spatialStructure.expressID]=await parseModelItem(spatialStructure);
	config.value.roots=[""+spatialStructure.expressID];
}

var emit = defineEmits(['objectSelected']);
	
function focus(e) {
	selected.value.data=e.text;
	emit('objectSelected',{expressID: parseInt(e.id) });
}

function generateName(item) {
	var type=item.replace("IFC","");
	type=type.substring(0,1)+type.substring(1).toLowerCase();
	return "("+type+")"
}

async function parseModelItem(inItem) {
	var newItem = {};
	var prop = await props.ifcLoader.ifcManager.getItemProperties(props.modelId,inItem.expressID);
	if (prop.Name != null && prop.Name.value !=""  ) newItem.text=generateName(inItem.type)+prop.Name.value;
	else if (prop.LongName != null && prop.LongName.value !="") newItem.text=generateName(inItem.type)+prop.LongName.value;
	else newItem.text=generateName(inItem.type)+inItem.expressID;
	newItem.children=[];
	for (var i=0; i < inItem.children.length;i++) {
		dataModel.value[""+inItem.children[i].expressID]=await parseModelItem(inItem.children[i]);
		newItem.children.push(""+inItem.children[i].expressID);
	}
	return newItem;
} 

watch(() => props.expressID, async (newValue) => { 
	var prop = await props.ifcLoader.ifcManager.getItemProperties(props.modelId,newValue);
	var type = "";
	var name = "";
	if (prop.Name != null && prop.Name.value !=""  ) name=generateName(type)+prop.Name.value;
	else if (prop.LongName != null && prop.LongName.value !="") name=generateName(type)+prop.LongName.value;
	else name=generateName(type)+newValue;
	selected.value.data=name;
});

</script>

<template>
	<b-alert :show="selected.data!=null" dismissible> Selected Object: {{ selected.data }}</b-alert>
	<tree id="ifcTree" :config="config" :nodes="dataModel" @nodeFocus="focus"></tree>
</template>

<style scoped>
</style>
