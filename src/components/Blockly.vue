<script setup>
import { IFCLoader } from "web-ifc-three"
import Blockly from 'blockly';
import { ref,onMounted } from 'vue'

const props = defineProps({
	ifcLoader : IFCLoader,
	modelId : Number
})

var toolbox = {
  "kind": "flyoutToolbox",
  "contents": [
    {
      "kind": "block",
      "type": "controls_if"
    },
    {
      "kind": "block",
      "type": "controls_repeat_ext"
    },
    {
      "kind": "block",
      "type": "logic_compare"
    },
    {
      "kind": "block",
      "type": "math_number"
    },
    {
      "kind": "block",
      "type": "math_arithmetic"
    },
    {
      "kind": "block",
      "type": "text"
    },
    {
      "kind": "block",
      "type": "text_print"
    },
  ]
}

const blocklyDiv = ref(null);
onMounted(() => {
		console.log(blocklyDiv);
		var workspace = Blockly.inject(blocklyDiv.value, {toolbox: toolbox});
});

</script>

<template>
<div ref="blocklyDiv" style="height: 100%; width: 100%;"></div>
</template>

<style scoped>
</style>
