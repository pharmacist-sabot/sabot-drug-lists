<!-- src/components/SearchBar.vue -->
<script setup>
import { Search } from 'lucide-vue-next'

defineProps(['modelValue'])
defineEmits(['update:modelValue'])
</script>

<template>
    <div class="search-box">
        <Search :size="20" />
        <input type="search" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)"
            placeholder="ค้นหา..." />
    </div>
</template>

<style scoped>
.search-box {
    display: flex;
    align-items: center;
    background-color: var(--c-surface);
    border-radius: 8px;
    padding: 0.25rem 0.75rem;
    border: 1px solid var(--c-border);
    flex-grow: 1;
    max-width: 400px;
    transition: var(--transition);
}

.search-box:focus-within {
    border-color: var(--c-primary);
    box-shadow: 0 0 0 3px var(--c-primary-light);
}

.search-box .lucide {
    color: var(--c-text-secondary);
    margin-right: 0.5rem;
}

.search-box input {
    width: 100%;
    border: none;
    background: transparent;
    padding: 0.75rem 0.5rem;
    outline: none;
    color: var(--c-text-primary);
}
</style>
