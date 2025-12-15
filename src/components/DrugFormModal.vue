<script setup lang="ts">
import { AlertCircle, X } from 'lucide-vue-next';
import { computed, ref, watch } from 'vue';

import type { Drug, DrugInsert } from '@/types/database.types';

import { useToastStore } from '@/stores/toast';

const props = withDefaults(
  defineProps<{
    show?: boolean;
    drug?: Drug | null;
  }>(),
  {
    show: false,
    drug: null,
  },
);

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', drug: DrugInsert): void;
}>();

const toastStore = useToastStore();
const form = ref<Partial<DrugInsert>>({});
const errorMessage = ref('');
const isEditMode = computed(() => !!props.drug?.id);

watch(
  () => props.drug,
  (newDrug) => {
    form.value = newDrug
      ? { ...newDrug }
      : {
          drug_code: '',
          trade_name: '',
          generic_name: '',
          account: 'ก',
          price_opd: 0,
          category: '',
          is_active: true,
          remarks: '',
        };
    errorMessage.value = '';
  },
  { immediate: true },
);

function handleSubmit() {
  errorMessage.value = '';

  if (!form.value.drug_code?.trim() || !form.value.trade_name?.trim()) {
    errorMessage.value = 'กรุณากรอกรหัสเวชภัณฑ์และชื่อเวชภัณฑ์';
    toastStore.addToast('กรุณากรอกข้อมูลที่จำเป็น', 'error');
    return;
  }

  emit('save', form.value as DrugInsert);
}

function handleClose() {
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
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        @click="handleClose"
      />

      <!-- Modal Panel -->
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
          class="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
        >
          <!-- Header -->
          <div
            class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0"
          >
            <h3 class="font-semibold text-slate-900 text-lg">
              {{ isEditMode ? 'แก้ไขข้อมูลยา' : 'เพิ่มรายการยาใหม่' }}
            </h3>
            <button
              type="button"
              class="p-2 hover:bg-slate-200/50 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              @click="handleClose"
            >
              <X :size="20" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto">
            <form class="space-y-4" @submit.prevent="handleSubmit">
              <!-- Error Message -->
              <div
                v-if="errorMessage"
                class="bg-red-50 text-red-700 p-3 rounded-xl flex gap-2 items-start border border-red-100"
              >
                <AlertCircle class="shrink-0 mt-0.5" :size="16" />
                <p class="text-sm font-medium">
                  {{ errorMessage }}
                </p>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    รหัสเวชภัณฑ์ *
                  </label>
                  <input
                    v-model="form.drug_code"
                    type="text"
                    required
                    class="w-full p-2.5 border rounded-xl outline-none transition-all" :class="[
                      errorMessage && !form.drug_code?.trim()
                        ? 'bg-red-50 border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-500'
                        : 'bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
                    ]"
                    @input="errorMessage = ''"
                  >
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    ชื่อเวชภัณฑ์ (Trade Name) *
                  </label>
                  <input
                    v-model="form.trade_name"
                    type="text"
                    required
                    class="w-full p-2.5 border rounded-xl outline-none transition-all" :class="[
                      errorMessage && !form.trade_name?.trim()
                        ? 'bg-red-50 border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-500'
                        : 'bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
                    ]"
                    @input="errorMessage = ''"
                  >
                </div>
              </div>

              <div class="space-y-1">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Generic Name
                </label>
                <input
                  v-model="form.generic_name"
                  type="text"
                  class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                >
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    บัญชี
                  </label>
                  <input
                    v-model="form.account"
                    type="text"
                    class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center focus:bg-white focus:border-blue-500 outline-none transition-all"
                  >
                </div>
                <div class="space-y-1 col-span-2">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    ราคา OPD
                  </label>
                  <input
                    v-model.number="form.price_opd"
                    type="number"
                    step="0.01"
                    class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  >
                </div>
              </div>

              <div class="space-y-1">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Category
                </label>
                <input
                  v-model="form.category"
                  type="text"
                  class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                >
              </div>

              <!-- Footer Buttons -->
              <div class="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  class="px-5 py-2.5 rounded-xl font-medium text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 transition-all"
                  @click="handleClose"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  class="px-5 py-2.5 rounded-xl font-medium text-sm bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 transition-all"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
