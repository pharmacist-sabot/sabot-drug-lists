<!-- src/components/Toast.vue -->
<template>
  <div :class="['toast', `toast-${type}`]">
    {{ message }}
  </div>
</template>

<script setup>
defineProps({
  message: String,
  type: String, // 'success', 'error', 'info'
})
</script>

<style scoped>
.toast {
  padding: 1rem 1.5rem;
  border-radius: 6px;
  color: white;
  box-shadow: var(--shadow-md);
  animation: slideIn 0.3s ease forwards;
}
.toast-success { background-color: var(--c-secondary-green); }
.toast-error { background-color: #e53e3e; }
.toast-info { background-color: var(--c-primary); }

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>