<!-- src/components/SearchBar.vue -->
<script setup>
import { ref } from 'vue'
const emit = defineEmits(['search'])
const searchTerm = ref('')

function onInput() {
  emit('search', searchTerm.value)
}
</script>

<template>
  <div class="search-container">
    <input
      type="search"
      v-model="searchTerm"
      @input="onInput"
      placeholder="ค้นหาด้วยรหัส, ชื่อยา หรือชื่อสามัญ..."
    />
  </div>
</template>

<style scoped>
.search-container {
  margin: 1.5rem 0;
}
</style>