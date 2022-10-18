<script setup>
import { CameraProjections, IfcViewerAPI, NavigationModes } from 'web-ifc-viewer';
import { onMounted, ref, watch, toRefs } from 'vue'
import { IFCDOOR, IFCSPACE, IFCOPENINGELEMENT, IFCFURNISHINGELEMENT, IFCWALL, IFCWINDOW, IFCCURTAINWALL, IFCMEMBER, IFCPLATE } from 'web-ifc';
  
  const props = defineProps({
    modelFile : File,
    expressID: Number 
  })

  var emit = defineEmits(['modelLoaded','objectSelected']);
  var selector;
  var modelId;
  
  const container = ref(null);
  
  onMounted(async() => {
    const viewer = new IfcViewerAPI({ container: container.value });
    await viewer.IFC.loader.ifcManager.useWebWorkers(true, window.location.origin+window.location.pathname+'IFCWorker.js');
    await viewer.IFC.loader.ifcManager.applyWebIfcConfig({COORDINATE_TO_ORIGIN: true,USE_FAST_BOOLS: true});
    await viewer.IFC.loader.ifcManager.parser.setupOptionalCategories({[IFCDOOR]:true,[IFCSPACE]: false,[IFCOPENINGELEMENT]: false});
    var model = await viewer.IFC.loadIfc(props.modelFile, false);
    await viewer.context.fitToFrame();  
    await viewer.axes.setAxes();
    await viewer.grid.setGrid();
    await viewer.shadowDropper.renderShadow(model.modelID);
    emit('modelLoaded',{ifcLoader: viewer.IFC.loader, modelId: model.modelID });
    document.getElementById( 'loading-screen' ).classList.remove( 'loading-screen' );
    document.getElementById( 'loader' ).classList.remove( 'loader' );
    viewer.context.updateAspect();
    selector = viewer.IFC.selector;
    modelId = model.modelID;
    
    window.onmousemove = () => viewer.IFC.selector.prePickIfcItem();

    window.ondblclick = async () => {
        const result = await viewer.IFC.selector.pickIfcItem(true);
        if (result!= null) emit('objectSelected',{expressID: result.id });
    };
    
  });
  
  watch(() => props.expressID, (newValue) => selector.pickIfcItemsByID(modelId,[newValue]));
</script>

<template>
<div class="loading-screen" id="loading-screen"><div class="loader" id="loader"></div><div @onmousemove="moveMouse()" id="model" class="h-100" ref="container"/></div>
</template>

<style>
#model {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #a9a9a9;
}
#loading-screen {
  width: 100%;
  height: 100%;
}
.loading-screen {
	z-index: 2;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #a9a9a9;
	opacity: 1;
  transition: 1s opacity;
}
.loader {
    display: block;
    position: relative;
    left: 50%;
    top: 50%;
    width: 150px;
    height: 150px;
    margin: -75px 0 0 -75px;
    border-radius: 50%;
    border: 3px solid transparent;
    border-top-color: #9370DB;
    -webkit-animation: spin 2s linear infinite;
    animation: spin 2s linear infinite;
}
.loader:before {
    content: "";
    position: absolute;
    top: 5px;
    left: 5px;
    right: 5px;
    bottom: 5px;
    border-radius: 50%;
    border: 3px solid transparent;
    border-top-color: #BA55D3;
    -webkit-animation: spin 3s linear infinite;
    animation: spin 3s linear infinite;
}
.loader:after {
    content: "";
    position: absolute;
    top: 15px;
    left: 15px;
    right: 15px;
    bottom: 15px;
    border-radius: 50%;
    border: 3px solid transparent;
    border-top-color: #FF00FF;
    -webkit-animation: spin 1.5s linear infinite;
    animation: spin 1.5s linear infinite;
}
@-webkit-keyframes spin {
    0%   {
        -webkit-transform: rotate(0deg);
        -ms-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    100% {
        -webkit-transform: rotate(360deg);
        -ms-transform: rotate(360deg);
        transform: rotate(360deg);
    }
}
@keyframes spin {
    0%   {
        -webkit-transform: rotate(0deg);
        -ms-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    100% {
        -webkit-transform: rotate(360deg);
        -ms-transform: rotate(360deg);
        transform: rotate(360deg);
    }
}
</style>
