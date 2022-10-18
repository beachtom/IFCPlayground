<script setup>
import IFCTree from './components/IFCTree.vue'
import IFCViewer from './components/IFCViewer.vue'
import CodeEditor from './components/CodeEditor.vue'
import DataViewer from './components/DataViewer.vue'
import DataVisualiser from './components/DataVisualiser.vue'
import Blockly from './components/Blockly.vue'
import CodeExecutor from './components/CodeExecutor.vue'
import Swal from 'sweetalert2'
import { reactive } from 'vue'

var modelFile = reactive({data:null})
var ifcLoader = reactive({data:null});
var modelId = reactive({data:null});
var selectedObject = reactive({expressID:null});

function help() {
 
  Swal.fire(
    'Help',
    'Help text to go here'
  );
}

function modelLoaded(data) {
  ifcLoader.data = data.ifcLoader;
  modelId.data = data.modelId;
}

function loadDialog() {
  const { value: file } = Swal.fire({
    title: 'Select model file',
    input: 'file',
    inputAttributes: {
      'accept': '*.ifc',
      'aria-label': 'Please select your model'
      }
   }).then( (result) => {
    this.modelFile.data = result.value;
   });
  }

function objectSelected(e) {
  selectedObject.expressID=e.expressID;
}

function closeModel() {
  this.modelFile.data=null;
}

</script>

<template>
  <b-navbar toggleable="false" dark="true" variant="primary">
      <b-navbar-brand href="#"><img src="/public/cu.png"/> IFCPlayground</b-navbar-brand>
      <b-navbar-nav class="me-auto">
        <b-nav-form>
          <b-button v-b-toggle.sidebar :disabled="this.modelFile.data==null">Navigate Model</b-button>
        </b-nav-form>
      </b-navbar-nav>
      <b-navbar-nav class="mr-auto">
        <b-nav-form>
          <b-button @click="loadDialog()" :disabled="this.modelFile.data!=null">Open Model</b-button>&nbsp;&nbsp;  
          <b-button @click="closeModel()" :disabled="this.modelFile.data==null">Close Model</b-button> 
        </b-nav-form>
      </b-navbar-nav>
  </b-navbar>
  <b-offcanvas id="sidebar" title="Navigate Model" bg-variant="dark" text-variant="light">
     <div class="px-3 py-2">
      <Suspense><IFCTree @objectSelected="objectSelected" :ifcLoader="this.ifcLoader.data" :modelId="this.modelId.data" :key="this.ifcLoader.data" :expressID="selectedObject.expressID" /></Suspense>
     </div>
  </b-offcanvas>  
  <b-card no-body class="h-100">
    <b-tabs card class="h-100" fill content-class="h-100">
      <b-tab class="h-100" title="Model">
        <IFCViewer :expressID="selectedObject.expressID" @objectSelected="objectSelected" v-if="this.modelFile.data!=null" :key="this.modelFile.data" @modelLoaded="modelLoaded" :modelFile="this.modelFile.data"/>
        <div class="h-100 w-100" v-else style="background-color: #a9a9a9;">
          Please open a model
        </div>
      </b-tab>
      <b-tab v-if="selectedObject.expressID==null" class="h-100" title="Data" :disabled="this.modelFile.data==null">
        Please select an IFC Element from the tree or the model view.
      </b-tab>
      <b-tab v-else class="h-100" title="Data" :disabled="this.modelFile.data==null">
        <Suspense><DataViewer :ifcLoader="this.ifcLoader.data" :modelId="this.modelId.data" :expressID="this.selectedObject.expressID" :key="this.selectedObject.expressID" /></Suspense>
      </b-tab>
      <b-tab v-if="selectedObject.expressID==null" class="h-100" title="Data Visualisation" :disabled="this.modelFile.data==null">
        Please select an IFC Element from the tree or the model view.
      </b-tab>
      <b-tab  v-else class="h-100" title="Data Visualisation" :disabled="this.modelFile.data==null">
        <Suspense><DataVisualiser :ifcLoader="this.ifcLoader.data" :modelId="this.modelId.data" :expressID="this.selectedObject.expressID" :key="this.selectedObject.expressID" /></Suspense>
      </b-tab>
      <b-tab class="h-100" title="Programming" disabled>
        <CodeEditor/>
      </b-tab>
      <b-tab class="h-100" title="Visual Program" disabled lazy>
        <Blockly v-if="this.modelFile.data!=null"/>
      </b-tab>
      <b-tab class="h-100" title="Code Executor" disabled>
        <CodeExecutor/>
      </b-tab>
      <template #tabs-end>
         <b-nav-item role="presentation" @click.prevent="help" href="#"><b><i class="fa fa-question-circle" aria-hidden="true"></i></b></b-nav-item>
       </template>
    </b-tabs>
</b-card>
</template>

<style scoped>
</style>
