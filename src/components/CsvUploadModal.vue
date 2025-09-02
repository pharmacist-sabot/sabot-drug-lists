<!-- src/components/CsvUploadModal.vue -->
<script setup>
import { ref } from 'vue'
import Papa from 'papaparse'
import { supabase } from '../supabaseClient'

defineProps({ show: Boolean })
const emit = defineEmits(['close', 'import-success'])

const file = ref(null)
const isLoading = ref(false)
const message = ref('')

function handleFileChange(event) {
  file.value = event.target.files[0]
  message.value = ''
}

function processImport() {
  if (!file.value) {
    message.value = 'กรุณาเลือกไฟล์ CSV'
    return
  }

  isLoading.value = true
  message.value = 'กำลังประมวลผลไฟล์...'

  Papa.parse(file.value, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      message.value = `พบข้อมูล ${results.data.length} รายการ กำลังนำเข้า...`
      
      const drugsToInsert = results.data.map(row => ({
        drug_code: row['รหัสเวชภัณฑ์'] || null,
        trade_name: row['ชื่อเวชภัณฑ์'] || null,
        generic_name: row['Generic name'] || null,
        account: row['บัญชี'] || null,
        price_opd: parseFloat(row['ราคา (OPD)']) || 0,
        category: row['Category'] || null,
        is_active: true, // Default to active
      })).filter(drug => drug.drug_code); // Ensure drug_code exists

      if (drugsToInsert.length === 0) {
        message.value = 'ไม่พบข้อมูลที่ถูกต้องในไฟล์ CSV'
        isLoading.value = false
        return;
      }
      
      // Upsert: update if drug_code exists, otherwise insert
      const { error } = await supabase.from('drugs').upsert(drugsToInsert, {
        onConflict: 'drug_code'
      })

      isLoading.value = false
      if (error) {
        message.value = `เกิดข้อผิดพลาด: ${error.message}`
        console.error(error)
      } else {
        message.value = `นำเข้าข้อมูล ${drugsToInsert.length} รายการสำเร็จ!`
        emit('import-success')
        setTimeout(() => emit('close'), 2000)
      }
    },
    error: (err) => {
        isLoading.value = false;
        message.value = `เกิดข้อผิดพลาดในการอ่านไฟล์: ${err.message}`
    }
  })
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content card">
      <h2>นำเข้าข้อมูลยาจากไฟล์ CSV</h2>
      <p>ไฟล์ CSV ต้องมี header ตรงกับที่ระบบกำหนด เช่น รหัสเวชภัณฑ์, ชื่อเวชภัณฑ์, Generic name เป็นต้น</p>
      <div class="form-group">
        <label for="csv-file">เลือกไฟล์ .csv</label>
        <input type="file" id="csv-file" @change="handleFileChange" accept=".csv" />
      </div>
      <div class="modal-actions">
        <button class="secondary" @click="processImport" :disabled="isLoading">
          {{ isLoading ? 'กำลังนำเข้า...' : 'เริ่มนำเข้า' }}
        </button>
        <button @click="$emit('close')" :disabled="isLoading">ยกเลิก</button>
      </div>
      <p v-if="message" class="message">{{ message }}</p>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles for modals */
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
  gap: 1rem;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
.message {
  margin-top: 1rem;
  font-weight: bold;
}
input[type="file"] {
    background-color: transparent;
    border: none;
    padding: 0;
}
</style>
