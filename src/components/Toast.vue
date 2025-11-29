<template>
    <div :class="[
        'flex items-center gap-3 px-4 py-3.5 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border transition-all duration-300 w-full backdrop-blur-md',
        typeClasses
    ]">
        <component :is="iconComponent" :size="20" class="shrink-0" />
        <span class="text-sm font-medium leading-tight">{{ message }}</span>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { CheckCircle2, AlertCircle, Info } from 'lucide-vue-next'

const props = defineProps({
    message: String,
    type: {
        type: String,
        default: 'info'
    },
})

const iconComponent = computed(() => {
    switch (props.type) {
        case 'success': return CheckCircle2
        case 'error': return AlertCircle
        default: return Info
    }
})

const typeClasses = computed(() => {
    switch (props.type) {
        case 'success':
            return 'bg-emerald-50/95 border-emerald-100 text-emerald-700'
        case 'error':
            return 'bg-red-50/95 border-red-100 text-red-700'
        default: // info
            return 'bg-blue-50/95 border-blue-100 text-blue-700'
    }
})
</script>
