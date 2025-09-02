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
.search-container input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--c-border);
  border-radius: 8px;
  background-color: var(--c-background);
  color: var(--c-text-primary);
  transition: var(--transition);
}
.search-container input:focus {
  border-color: var(--c-primary);
  box-shadow: 0 0 0 3px var(--c-primary-light);
}

@media (max-width: 768px) {
  .search-container {
    margin: 1rem 0;
  }
}
</style>