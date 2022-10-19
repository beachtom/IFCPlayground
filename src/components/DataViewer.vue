<script setup>
import { IFCLoader } from "web-ifc-three"
import { ref } from 'vue'

const props = defineProps({
	expressID : Number,
	ifcLoader : IFCLoader,
	modelId : Number
})

function getValue(item) {
	var keys = Object.keys(item);
	for (var i=0; i < keys.length;i++) {
		if (keys[i].includes("Value")) {
			return item[keys[i]].value;
		}
	}
	return "";
}

const items = ref([]);
const nativeData = ref({});
const typeData = ref({});

var data = await props.ifcLoader.ifcManager.getPropertySets(props.modelId,props.expressID,true);
nativeData.value =  await props.ifcLoader.ifcManager.getItemProperties(props.modelId,props.expressID,true);
typeData.value= await props.ifcLoader.ifcManager.getItemProperties(props.modelId,props.expressID,true);

for (var i=0; i < data.length;i++) {
	var itemArr = {};
	if (data[i].Name==null) itemArr.name="";
	else itemArr.name=data[i].Name.value;
	itemArr.properties={};
	if (data[i].Quantities!=null) {
		for (var x=0; x < data[i].Quantities.length;x++) itemArr.properties[data[i].Quantities[x].Name.value] = getValue(data[i].Quantities[x]);
	} 
	if (data[i].HasProperties!=null) {
		for (var x=0; x < data[i].HasProperties.length;x++) itemArr.properties[data[i].HasProperties[x].Name.value] = getValue(data[i].HasProperties[x]);
	}
	items.value.push(itemArr);
}
</script>

<template>
	<b-table-simple striped bordered>
	<b-thead head-variant="dark">
		<b-tr>
			<b-th>Property</b-th>
			<b-th>Value</b-th>
		</b-tr>
	</b-thead>
	<b-tbody>
		<template v-if="nativeData!=null" v-for="dItem in Object.keys(nativeData)">
			<b-tr v-if="nativeData[dItem] != null && nativeData[dItem].value != null">
			<b-td>{{ dItem }}</b-td>
			<b-td>{{ nativeData[dItem].value }}</b-td>
			</b-tr>
		</template>
		<template v-if="typeData!=null" v-for="dItem in Object.keys(typeData)">
			<b-tr v-if="typeData[dItem] != null && typeData[dItem].value != null && (!Object.keys(nativeData).includes(dItem))">
			<b-td>{{ dItem }}</b-td>
			<b-td>{{ typeData[dItem].value }}</b-td>
			</b-tr>
		</template>
		<template v-for="item in items">
			<b-tr>
			<b-th colspan="2">{{ item.name }}</b-th>
			</b-tr>
			<template v-for="prop in Object.keys(item.properties)">
				<b-tr>
					<b-td> {{ prop }} </b-td>
					<b-td> {{ item.properties[prop] }} </b-td>
				</b-tr>
			</template>
		</template>
	</b-tbody>
	</b-table-simple>
</template>

<style scoped>
</style>
