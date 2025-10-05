<!-- src/components/DecommissionModal.vue -->
<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content card" :class="{ 'modal-animate': show }">
      <h2 class="modal-header">ยืนยันการนำยาออกจากบัญชี</h2>
      
      <form @submit.prevent="handleConfirm" class="modal-form">
        <div class="form-body">
          <p>
            คุณกำลังจะนำยา <strong>{{ drug.trade_name }}</strong> ({{ drug.drug_code }}) ออกจากบัญชียาที่ใช้งานอยู่
            กรุณาระบุเหตุผล:
          </p>
          <div class="form-group">
            <label for="remarks">เหตุผลในการนำออก *</label>
            <textarea
              id="remarks"
              v-model="remarks"
              class="form-control"
              rows="4"
              required
              placeholder="เช่น ยาซ้ำซ้อน, บริษัทเลิกผลิต, มีผลข้างเคียง, ..."
            ></textarea>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn" @click="$emit('close')">ยกเลิก</button>
          <button type="submit" class="btn btn-danger">ยืนยันการนำออก</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  show: Boolean,
  drug: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close', 'confirm'])

const remarks = ref('')

function handleConfirm() {
  if (!remarks.value.trim()) {
    alert('กรุณากรอกเหตุผลในการนำออก')
    return
  }
  emit('confirm', { drug: props.drug, remarks: remarks.value })
  remarks.value = '' 
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; 
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex; 
  justify-content: center; 
  align-items: center; 
  z-index: 1000;
  padding: 1rem;
}
.modal-content {
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  transform: scale(0.95);
  opacity: 0;
  transition: var(--transition);
}
.modal-animate { transform: scale(1); opacity: 1; }
.modal-header {
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--c-border);
  margin-bottom: 1rem;
}
.modal-form {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 0;
}
.form-body { flex-grow: 1; overflow-y: auto; }
.form-body p { margin-bottom: 1.5rem; }
.form-control { width: 100%; }
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--c-border);
}
.btn-danger {
  background-color: #dc2626;
  color: white;
}
.btn-danger:hover {
  background-color: #b91c1c;
}
</style>