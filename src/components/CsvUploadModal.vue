<!-- src/components/CsvUploadModal.vue -->
<script setup>
import { ref } from 'vue'
import Papa from 'papaparse'
import { supabase } from '../supabaseClient'
import { useToastStore } from '../stores/toast'

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
            toastStore.addToast(`พบข้อมูล ${results.data.length} รายการ กำลังนำเข้า...`, 'info')

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
                console.error(error)
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
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-content card" :class="{ 'modal-animate': show }">
            <h2>นำเข้าข้อมูลยาจากไฟล์ CSV</h2>
            <p>ไฟล์ CSV ต้องมี header ตรงกับที่ระบบกำหนด เช่น รหัสเวชภัณฑ์, ชื่อเวชภัณฑ์, Generic name เป็นต้น</p>
            <div class="form-group">
                <label for="csv-file">เลือกไฟล์ .csv</label>
                <input type="file" id="csv-file" @change="handleFileChange" accept=".csv" />
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary" @click="processImport" :disabled="isLoading">
                    {{ isLoading ? 'กำลังนำเข้า...' : 'เริ่มนำเข้า' }}
                </button>
                <button class="btn" @click="$emit('close')" :disabled="isLoading">ยกเลิก</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    width: 90%;
    max-width: 500px;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    transform: scale(0.95);
    opacity: 0;
    transition: var(--transition);
}

.modal-animate {
    transform: scale(1);
    opacity: 1;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}

.message {
    margin-top: 1rem;
    font-weight: 500;
    text-align: center;
}

input[type="file"] {
    background-color: transparent;
    border: none;
    padding: 0;
}

@media (max-width: 768px) {
    .modal-content {
        width: 95%;
    }
}
</style>
