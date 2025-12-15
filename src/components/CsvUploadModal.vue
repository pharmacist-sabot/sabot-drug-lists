<script setup lang="ts">
import { FileSpreadsheet, UploadCloud, X } from 'lucide-vue-next';
import Papa from 'papaparse';
import { ref } from 'vue';

import type { DrugInsert } from '@/types/database.types';

import { useDrugStore } from '@/stores/drugs';
import { useToastStore } from '@/stores/toast';

type CsvRow = {
  'รหัสเวชภัณฑ์': string;
  'ชื่อเวชภัณฑ์': string;
  'Generic name': string;
  'บัญชี': string;
  'ราคา (OPD)': string;
  'Category': string;
};

defineProps<{ show: boolean }>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'importSuccess'): void;
}>();

const file = ref<File | null>(null);
const isLoading = ref(false);

const toastStore = useToastStore();
const drugStore = useDrugStore();

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const selectedFile = target.files[0];
    if (selectedFile) {
      file.value = selectedFile;
    }
    target.value = '';
  }
}

function processImport() {
  const targetFile = file.value;

  if (!targetFile) {
    toastStore.addToast('กรุณาเลือกไฟล์ CSV', 'error');
    return;
  }

  isLoading.value = true;
  toastStore.addToast('กำลังประมวลผลไฟล์...', 'info');

  Papa.parse<CsvRow>(targetFile, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      if (results.errors.length > 0) {
        console.warn('CSV Parse Warnings:', results.errors);
      }

      const drugsToInsert: DrugInsert[] = results.data
        .filter(row => row['รหัสเวชภัณฑ์']?.trim() && row['ชื่อเวชภัณฑ์']?.trim())
        .map(row => ({
          drug_code: row['รหัสเวชภัณฑ์'].trim(),
          trade_name: row['ชื่อเวชภัณฑ์'].trim(),
          generic_name: row['Generic name']?.trim() || null,
          account: row['บัญชี']?.trim() || null,
          price_opd: row['ราคา (OPD)'] ? Number.parseFloat(row['ราคา (OPD)']) : 0,
          category: row.Category?.trim() || null,
          is_active: true,
        }));

      if (drugsToInsert.length === 0) {
        toastStore.addToast('ไม่พบข้อมูลที่ถูกต้องในไฟล์ CSV (ตรวจสอบ Header)', 'error');
        isLoading.value = false;
        return;
      }

      const result = await drugStore.importDrugs(drugsToInsert);

      isLoading.value = false;
      if (!result.success) {
        toastStore.addToast(`เกิดข้อผิดพลาด: ${result.message}`, 'error');
      }
      else {
        toastStore.addToast(`นำเข้าข้อมูล ${drugsToInsert.length} รายการสำเร็จ!`, 'success');
        emit('importSuccess');

        file.value = null;

        setTimeout(() => emit('close'), 2000);
      }
    },
    error: (err) => {
      isLoading.value = false;
      toastStore.addToast(`ไม่สามารถอ่านไฟล์ได้: ${err.message}`, 'error');
    },
  });
}
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        @click="$emit('close')"
      />

      <div
        class="modal-panel relative bg-white w-full max-w-lg rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden transform border border-slate-100"
      >
        <div
          class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50"
        >
          <h3 class="font-semibold text-slate-900 text-lg">
            นำเข้าไฟล์ CSV
          </h3>
          <button
            class="p-2 hover:bg-slate-200/50 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            @click="$emit('close')"
          >
            <X :size="20" />
          </button>
        </div>

        <div class="p-6">
          <div
            class="mb-6 text-center border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
          >
            <div
              class="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform"
            >
              <FileSpreadsheet :size="24" />
            </div>
            <label for="csv-file" class="cursor-pointer">
              <span class="block font-semibold text-slate-700">เลือกไฟล์ .csv</span>
              <span class="text-sm text-slate-400">คลิกเพื่อเลือกไฟล์จากเครื่องของคุณ</span>
              <input
                id="csv-file"
                type="file"
                accept=".csv"
                class="hidden"
                @change="handleFileChange"
              >
            </label>
            <div
              v-if="file"
              class="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
            >
              {{ file.name }}
            </div>
          </div>

          <div
            class="text-sm text-slate-500 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100"
          >
            <p class="font-semibold mb-2 text-slate-700">
              ข้อกำหนดไฟล์ CSV:
            </p>
            <p class="leading-relaxed">
              ต้องมี Header:
              <code class="text-xs bg-white border px-1 rounded mx-0.5">รหัสเวชภัณฑ์</code>
              <code class="text-xs bg-white border px-1 rounded mx-0.5">ชื่อเวชภัณฑ์</code>
              <code class="text-xs bg-white border px-1 rounded mx-0.5">Generic name</code>
            </p>
          </div>

          <div class="flex justify-end gap-3">
            <button
              class="px-5 py-2.5 rounded-xl font-medium text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 transition-all"
              :disabled="isLoading"
              @click="$emit('close')"
            >
              ยกเลิก
            </button>
            <button
              class="px-5 py-2.5 rounded-xl font-medium text-sm bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20 flex items-center gap-2"
              :disabled="isLoading"
              @click="processImport"
            >
              <UploadCloud :size="16" />
              {{ isLoading ? 'กำลังประมวลผล...' : 'เริ่มนำเข้า' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
