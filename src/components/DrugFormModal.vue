<!-- src/components/DrugFormModal.vue -->
<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content card" :class="{ 'modal-animate': show }">
      
      <h2 class="modal-header">{{ isEditMode ? 'แก้ไขข้อมูลยา' : 'เพิ่มยาใหม่' }}</h2>
      
      <form @submit.prevent="handleSubmit" class="modal-form">
        
        <div class="form-body">
          <div class="form-grid">
            <div class="form-group">
              <label>รหัสเวชภัณฑ์ *</label>
              <input v-model="form.drug_code" type="text" class="form-control" required />
            </div>
            <div class="form-group">
              <label>ชื่อเวชภัณฑ์ *</label>
              <input v-model="form.trade_name" type="text" class="form-control" required />
            </div>
            <div class="form-group full-width">
              <label>Generic Name</label>
              <input v-model="form.generic_name" type="text" class="form-control" />
            </div>
            <div class="form-group">
              <label>บัญชี</label>
              <input v-model="form.account" type="text" class="form-control" />
            </div>
            <div class="form-group">
              <label>ราคา OPD</label>
              <input v-model.number="form.price_opd" type="number" step="0.01" class="form-control" />
            </div>
            <div class="form-group full-width">
              <label>Category</label>
              <input v-model="form.category" type="text" class="form-control" />
            </div>
          </div>
        </div>
        
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">ยกเลิก</button>
          <button type="submit" class="btn btn-primary">บันทึกข้อมูล</button>
        </div>
      </form>

    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
const props = defineProps({ show: Boolean, drug: Object, })
const emit = defineEmits(['close', 'save'])
const form = ref({})
const isEditMode = computed(() => !!props.drug?.id)
watch(() => props.drug, (newDrug) => {
  form.value = newDrug ? { ...newDrug } : {
    drug_code: '', trade_name: '', generic_name: '', account: 'ก', price_opd: 0,
    category: '', is_active: true, remarks: '',
  }
}, { immediate: true })
function handleSubmit() {
    if (!form.value.drug_code || !form.value.trade_name) {
        alert('กรุณากรอกรหัสเวชภัณฑ์และชื่อเวชภัณฑ์')
        return
    }
    emit('save', form.value)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex; 
  justify-content: center; 
  align-items: center; 
  z-index: 1000;
  padding: 1rem; 
}

.modal-content {
  width: 100%; 
  max-width: 600px;
  max-height: 90vh; 
  display: flex;
  flex-direction: column;
  transform: scale(0.95);
  opacity: 0;
  transition: var(--transition);
}

.modal-animate {
  transform: scale(1);
  opacity: 1;
}

.modal-header {
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--c-border);
  margin-bottom: 1.25rem;
  flex-shrink: 0; 
}

.modal-form {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 0; 
}

.form-body {
  flex-grow: 1;
  overflow-y: auto;
  min-height: 0;
  padding-right: 1rem;
  margin-right: -1rem;
}

.form-grid {
    display: grid; 
    grid-template-columns: 1fr 1fr; 
    gap: 0 1.25rem; 
}

.form-group.full-width {
    grid-column: 1 / -1;
}

.modal-actions {
  display: flex; 
  justify-content: flex-end; 
  gap: 1rem; 
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--c-border);
  flex-shrink: 0; 
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .modal-content {
    max-height: 85vh; 
  }
  .form-body {
    padding-right: 0.5rem;
    margin-right: -0.5rem;
  }
}
</style>