<script setup lang="ts">
import { AlertCircle, X } from 'lucide-vue-next';
import { ref } from 'vue';

import type { Drug } from '@/types/database.types';

import { useToastStore } from '@/stores/toast';

const props = defineProps<{
  show: boolean;
  drug: Drug;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm', payload: { drug: Drug; remarks: string }): void;
}>();

const toastStore = useToastStore();
const remarks = ref('');
const errorMessage = ref('');

function handleConfirm() {
  errorMessage.value = '';

  if (!remarks.value.trim()) {
    errorMessage.value = 'กรุณากรอกเหตุผลในการนำออก';
    toastStore.addToast('กรุณากรอกเหตุผลในการนำออก', 'error');
    return;
  }

  emit('confirm', { drug: props.drug, remarks: remarks.value });
  remarks.value = '';
  errorMessage.value = '';
}

function handleClose() {
  remarks.value = '';
  errorMessage.value = '';
  emit('close');
}
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-300 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        @click="handleClose"
      />
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 scale-95 -translate-y-5"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 -translate-y-5"
      >
        <div
          v-if="show"
          class="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden border border-slate-100"
        >
          <div
            class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50"
          >
            <h3 class="font-semibold text-slate-900 text-lg">
              ยืนยันการนำออก
            </h3>
            <button
              type="button"
              class="p-2 hover:bg-slate-200/50 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              @click="handleClose"
            >
              <X :size="20" />
            </button>
          </div>

          <div class="p-6">
            <form class="space-y-5" @submit.prevent="handleConfirm">
              <div
                class="bg-amber-50 text-amber-800 p-4 rounded-xl flex gap-3 items-start border border-amber-100"
              >
                <AlertCircle class="shrink-0 mt-0.5" :size="20" />
                <div class="text-sm">
                  <p class="font-bold">
                    คุณกำลังจะนำรายการยาออก
                  </p>
                  <p class="mt-1">
                    รายการ: <strong>{{ drug.trade_name }}</strong> ({{ drug.drug_code }})
                  </p>
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-bold text-slate-700">
                  ระบุเหตุผลในการนำออก *
                </label>
                <textarea
                  v-model="remarks"
                  rows="3"
                  required
                  class="w-full p-3 bg-white border rounded-xl focus:ring-2 outline-none resize-none transition-all" :class="[
                    errorMessage
                      ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
                      : 'border-slate-200 focus:ring-red-100 focus:border-red-400',
                  ]"
                  placeholder="เช่น บริษัทเลิกผลิต, ยาหมดอายุ, เปลี่ยนบริษัทประมูล..."
                  @input="errorMessage = ''"
                />
                <p v-if="errorMessage" class="text-red-600 text-sm font-medium flex items-center gap-1.5">
                  <AlertCircle :size="14" />
                  {{ errorMessage }}
                </p>
              </div>

              <div class="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  class="px-5 py-2.5 rounded-xl font-medium text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 transition-all"
                  @click="handleClose"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  class="px-5 py-2.5 rounded-xl font-medium text-sm bg-red-50 text-red-600 hover:bg-red-100 border border-transparent transition-all"
                >
                  ยืนยันนำออก
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
