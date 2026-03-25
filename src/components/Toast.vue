<script setup lang="ts">
import type { ToastType } from '../types';
import { AlertCircle, CheckCircle2, Info } from 'lucide-vue-next';

import { computed } from 'vue';

type Props = {
  message?: string;
  type?: ToastType;
};

const props = withDefaults(defineProps<Props>(), {
  message: '',
  type: 'info',
});

const iconComponent = computed(() => {
  switch (props.type) {
    case 'success':
      return CheckCircle2;
    case 'error':
      return AlertCircle;
    default:
      return Info;
  }
});

const typeClasses = computed<string>(() => {
  switch (props.type) {
    case 'success':
      return 'bg-emerald-50/95 border-emerald-100 text-emerald-700';
    case 'error':
      return 'bg-red-50/95 border-red-100 text-red-700';
    default:
      return 'bg-blue-50/95 border-blue-100 text-blue-700';
  }
});
</script>

<template>
  <div
    class="flex items-center gap-3 px-4 py-3.5 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border transition-all duration-300 w-full backdrop-blur-md" :class="[
      typeClasses,
    ]"
  >
    <component :is="iconComponent" :size="20" class="shrink-0" />
    <span class="text-sm font-medium leading-tight">{{ message }}</span>
  </div>
</template>
