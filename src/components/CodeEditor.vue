<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useResizeObserver } from '@vueuse/core'

import * as monaco from 'monaco-editor'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import TSWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

self.MonacoEnvironment = {
  getWorker(e, label) {
    if (label === 'typescript' || label === 'javascript') return new TSWorker()
    return new EditorWorker()
  }
}

const container = ref(null);

onMounted(() => {
  var editor = monaco.editor.create(container.value, {
    language: 'javascript',
    theme: 'vs-dark',
  })
  
	const editorObserver = useResizeObserver(container, () => {
  	editor.layout()
	})

	onUnmounted(() => {
  	editor?.dispose()
  	editorObserver.stop()
	})
});
</script>

<template>
	<div ref="container" class="h-100"/>
</template>

<style scoped>
</style>
