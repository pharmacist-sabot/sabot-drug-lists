<script setup>
import { ref } from 'vue'
import Papa from 'papaparse'
import { supabase } from '../supabaseClient'
import { useToastStore } from '../stores/toast'
import { X, FileSpreadsheet, UploadCloud } from 'lucide-vue-next'

defineProps({ show: Boolean })
const emit = defineEmits(['close', 'import-success'])

const file = ref(null)
const isLoading = ref(false)
const toastStore = useToastStore()

function handleFileChange(event) {
    file.value = event.target.files[0]
}

function processImport() {
    if (!file.value) {
        toastStore.addToast('กรุณาเลือกไฟล์ CSV', 'error')
        return
    }

    isLoading.value = true
    toastStore.addToast('กำลังประมวลผลไฟล์...', 'info')

    Papa.parse(file.value, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
            const drugsToInsert = results.data.map(row => ({
                drug_code: row['รหัสเวชภัณฑ์'] || null,
                trade_name: row['ชื่อเวชภัณฑ์'] || null,
                generic_name: row['Generic name'] || null,
                account: row['บัญชี'] || null,
                price_opd: parseFloat(row['ราคา (OPD)']) || 0,
                category: row['Category'] || null,
                is_active: true,
            })).filter(drug => drug.drug_code);

            if (drugsToInsert.length === 0) {
                toastStore.addToast('ไม่พบข้อมูลที่ถูกต้องในไฟล์ CSV', 'error')
                isLoading.value = false
                return;
            }

            const { error } = await supabase.from('drugs').upsert(drugsToInsert, {
                onConflict: 'drug_code'
            })

            isLoading.value = false
            if (error) {
                toastStore.addToast(`เกิดข้อผิดพลาด: ${error.message}`, 'error')
            } else {
                toastStore.addToast(`นำเข้าข้อมูล ${drugsToInsert.length} รายการสำเร็จ!`, 'success')
                emit('import-success')
                setTimeout(() => emit('close'), 2000)
            }
        },
        error: (err) => {
            isLoading.value = false;
            toastStore.addToast(`เกิดข้อผิดพลาดในการอ่านไฟล์: ${err.message}`, 'error')
        }
    })
}
</script>

<template>
    <Transition name="modal">
        <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="$emit('close')">
            </div>

            <div
                class="modal-panel relative bg-white w-full max-w-lg rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden transform border border-slate-100">
                <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 class="font-semibold text-slate-900 text-lg">นำเข้าไฟล์ CSV</h3>
                    <button @click="$emit('close')"
                        class="p-2 hover:bg-slate-200/50 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                        <X :size="20" />
                    </button>
                </div>

                <div class="p-6">
                    <div
                        class="mb-6 text-center border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:border-blue-400 hover:bg-blue-50/50 transition-all group">
                        <div
                            class="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                            <FileSpreadsheet :size="24" />
                        </div>
                        <label for="csv-file" class="cursor-pointer">
                            <span class="block font-semibold text-slate-700">เลือกไฟล์ .csv</span>
                            <span class="text-sm text-slate-400">คลิกเพื่อเลือกไฟล์จากเครื่องของคุณ</span>
                            <input type="file" id="csv-file" @change="handleFileChange" accept=".csv" class="hidden" />
                        </label>
                        <div v-if="file"
                            class="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                            {{ file.name }}
                        </div>
                    </div>

                    <div class="text-sm text-slate-500 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p class="font-semibold mb-2 text-slate-700">ข้อกำหนดไฟล์ CSV:</p>
                        <p>ต้องมี Header: <code class="text-xs bg-white border px-1 rounded">รหัสเวชภัณฑ์</code>, <code
                                class="text-xs bg-white border px-1 rounded">ชื่อเวชภัณฑ์</code>, <code
                                class="text-xs bg-white border px-1 rounded">Generic name</code></p>
                    </div>

                    <div class="flex justify-end gap-3">
                        <button
                            class="px-5 py-2.5 rounded-xl font-medium text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 transition-all"
                            @click="$emit('close')" :disabled="isLoading">ยกเลิก</button>
                        <button
                            class="px-5 py-2.5 rounded-xl font-medium text-sm bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20 flex items-center gap-2"
                            @click="processImport" :disabled="isLoading">
                            <UploadCloud :size="16" />
                            {{ isLoading ? 'กำลังประมวลผล...' : 'เริ่มนำเข้า' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>
