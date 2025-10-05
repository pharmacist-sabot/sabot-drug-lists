<!-- src/components/DrugTable.vue -->
<template>
  <div class="card">
    <div class="controls">
      <SearchBar 
        :model-value="searchTerm" 
        @update:model-value="$emit('update:searchTerm', $event)" 
      />

      <div class="filters" v-if="!isDecommissionedView">
        <select :value="filterCategory" @change="$emit('update:filterCategory', $event.target.value)">
          <option value="all">ทุกหมวดหมู่ (Category)</option>
          <option v-for="cat in availableCategories" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>

      </div>
    </div>

    <div class="table-container">
      <div v-if="loading" class="loading-state">กำลังโหลดข้อมูล...</div>
      <table v-else-if="drugs.length > 0" class="drug-table">
        <thead>
          <tr>
            <th>รหัส / ชื่อยา</th>
            <th v-if="isDecommissionedView">เหตุผลที่นำออก / วันที่</th>
            <th v-else>สถานะ</th>
            <th v-if="isAdmin"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="drug in drugs" :key="drug.id" class="table-row">
            <td data-label="ชื่อยา">
              <div class="drug-name-cell">
                <span class="drug-code">{{ drug.drug_code }}</span>
                <span class="trade-name">{{ drug.trade_name }}</span>
              </div>
            </td>

            <td v-if="isDecommissionedView" data-label="เหตุผล">
                <div class="remarks-cell">
                    <span class="remarks-text">{{ drug.remarks }}</span>
                    <span class="date-text">{{ formatDate(drug.decommissioned_at) }}</span>
                </div>
            </td>
            <td v-else data-label="สถานะ">
              <span :class="['tag', drug.is_active ? 'tag-active' : 'tag-inactive']">
                {{ drug.is_active ? 'ใช้งาน' : 'ไม่ใช้งาน' }}
              </span>
            </td>

            <td v-if="isAdmin" class="actions-cell">
              <template v-if="!isDecommissionedView">
                <button @click="$emit('edit', drug)" class="action-btn" title="แก้ไข" aria-label="แก้ไขข้อมูลยา">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="m13.83 3.92 2.25 2.25-9.28 9.28-2.93.38.38-2.93L13.83 3.92ZM16.41 2.2a2.33 2.33 0 0 0-3.3 0L3.7 11.62a1 1 0 0 0-.26.47l-1 5a1 1 0 0 0 1.18 1.18l5-1a1 1 0 0 0 .47-.26L17.8 8.16a2.33 2.33 0 0 0 0-3.3Z"/></svg>
                </button>
                <button @click="$emit('trigger-decommission', drug)" class="action-btn" title="ปิดใช้งาน" aria-label="ปิดใช้งานยานี้">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="icon-inactive"><path d="M18.5 10.7a10.8 10.8 0 0 1-2.2 2.8l1.3 1.3a1 1 0 0 1-1.4 1.4l-1.5-1.5a6.6 6.6 0 0 1-1.7.9V17a1 1 0 1 1-2 0v-1.4A7.2 7.2 0 0 1 5.3 12l-1.4 1.4a1 1 0 0 1-1.4-1.4L4 10.5a10.2 10.2 0 0 1-2.5-3 .7.7 0 0 1 0-.6C2.7 3 6.6 1 10 1c1.6 0 3.2.4 4.6 1.2l-1.3 1.3A5 5 0 0 0 10 3a7.3 7.3 0 0 0-5.8 2.8 8.4 8.4 0 0 0-.7 1.5c.3.5.7 1 1.2 1.4l1.5-1.5a3 3 0 0 1 4.2 4.2l1.5-1.5c.5.4 1 .8 1.4 1.2a8.5 8.5 0 0 0 1.5-.7c.3-.2.7-.4 1-.7ZM10 13a3 3 0 0 1-1.2-.3L12 9.5a3 3 0 0 1-2 3.5Z"/><path d="M15 10a5 5 0 0 1-1 3.1l1.5 1.5c.5-.5.9-1 1.3-1.6a.7.7 0 0 0 0-.6 10.8 10.8 0 0 0-1.8-3.4Z"/></svg>
                </button>
              </template>
              <template v-else>
                <button @click="$emit('recommission', drug)" class="action-btn" title="นำกลับเข้าบัญชี" aria-label="นำกลับเข้าบัญชี">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="icon-active"><path d="M10 5a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5Zm0 8a3 3 0 0 1-3-3 3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1-3 3Z"/><path d="M10 2c-5 0-9.2 3.6-10 8 1.1 5.4 5.2 8 10 8s8.9-2.6 10-8C19.2 5.6 15 2 10 2Zm0 14c-4 0-7.3-2.1-8.5-6C2.7 6.1 6 4 10 4s7.3 2.1 8.5 6c-1.2 3.9-4.5 6-8.5 6Z"/></svg>
                </button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-state">
        <h3>ไม่พบข้อมูล</h3>
        <p>ไม่พบรายการยาที่ตรงกับเงื่อนไขการค้นหาของคุณ</p>
      </div>
    </div>

    <div v-if="!loading && totalPages > 1" class="pagination-controls">
        <span>หน้าที่ {{ currentPage }} / {{ totalPages }} (ทั้งหมด {{ totalCount }} รายการ)</span>
        <div class="pagination-buttons">
            <button class="btn btn-secondary" @click="$emit('change-page', currentPage - 1)" :disabled="currentPage === 1">&lt; ก่อนหน้า</button>
            <button class="btn btn-secondary" @click="$emit('change-page', currentPage + 1)" :disabled="currentPage >= totalPages">ถัดไป &gt;</button>
        </div>
    </div>
  </div>
</template>

<script setup>
import SearchBar from './SearchBar.vue'

const props = defineProps({
  drugs: Array,
  loading: Boolean,
  isAdmin: Boolean,
  isDecommissionedView: { type: Boolean, default: false },
  searchTerm: String,
  filterCategory: String,
  availableCategories: Array,
  currentPage: Number,
  totalPages: Number,
  totalCount: Number,
})

const emit = defineEmits([
    'edit', 
    'trigger-decommission', 
    'recommission', 
    'update:searchTerm', 
    'update:filterCategory', 
    'change-page'
])

function formatDate(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}
</script>

<style scoped>
.remarks-cell {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}
.remarks-text {
    color: var(--c-text-primary);
    font-weight: 500;
}
.date-text {
    font-size: 0.85rem;
    color: var(--c-text-secondary);
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}
.filters {
  display: flex;
  gap: 1rem;
}
.filters select {
  padding: 0.75rem 1.25rem;
  border: 1px solid var(--c-border);
  border-radius: 8px;
  background-color: var(--c-surface);
  color: var(--c-text-primary);
  transition: var(--transition);
}
.filters select:focus {
  border-color: var(--c-primary);
  box-shadow: 0 0 0 3px var(--c-primary-light);
}
.table-container {
  overflow-y: auto;
  max-height: calc(70vh - 60px); 
}
.drug-table {
  width: 100%;
  border-collapse: collapse;
}
.drug-table th {
  text-align: left;
  padding: 1rem 1.25rem;
  color: var(--c-text-secondary);
  font-size: 0.85rem;
  text-transform: uppercase;
  border-bottom: 2px solid var(--c-border);
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: var(--c-surface);
}
.drug-table td {
  padding: 1.25rem 1.25rem;
  border-bottom: 1px solid var(--c-border);
  vertical-align: middle;
}
.drug-table tbody tr:last-child td {
  border-bottom: none;
}
.table-row {
  transition: var(--transition);
}
.table-row:hover {
  background-color: var(--c-primary-light);
}
.drug-name-cell {
  display: flex;
  flex-direction: column;
}
.drug-code {
  font-size: 0.85rem;
  color: var(--c-text-secondary);
}
.trade-name {
  font-weight: 500;
  color: var(--c-text-primary);
}
.actions-cell {
  text-align: right;
}
.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: var(--transition);
}
.action-btn:hover {
  background-color: var(--c-background);
  transform: scale(1.1);
}

.action-btn svg {
  width: 20px;
  height: 20px;
  color: var(--c-text-secondary);
  transition: var(--transition);
}
.action-btn:hover svg {
  color: var(--c-primary);
}
.action-btn .icon-active {
  color: var(--c-secondary-green);
}
.action-btn:hover .icon-active {
  color: #15803d; 
}
.action-btn .icon-inactive {
  color: var(--c-status-inactive);
}
.action-btn:hover .icon-inactive {
  color: #ef4444; 
}

.loading-state, .empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--c-text-secondary);
}
.empty-state h3 {
  font-size: 1.2rem;
  color: var(--c-text-primary);
}
.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  margin-top: 1rem;
  border-top: 1px solid var(--c-border);
  color: var(--c-text-secondary);
}
.pagination-buttons {
  display: flex;
  gap: 0.5rem;
}
.pagination-controls .btn {
  padding: 0.5rem 1rem;
}
@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: stretch;
  }
  .filters {
    flex-direction: column;
  }
  .filters select {
    width: 100%;
  }
  .table-container {
    max-height: none;
    overflow-y: visible;
  }
  .drug-table thead {
    display: none;
  }
  .drug-table tr {
    display: block;
    margin-bottom: 1.25rem;
    border: 1px solid var(--c-border);
    border-radius: 12px;
    padding: 1rem;
    box-shadow: var(--shadow-sm);
  }
  .drug-table td {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 0.75rem 0;
    border: none;
  }
  .drug-table td::before {
    content: attr(data-label);
    font-weight: 700;
    color: var(--c-text-secondary);
    margin-right: 1rem;
  }
  .drug-table .actions-cell {
    justify-content: flex-end;
    gap: 1rem;
  }
  .drug-table .actions-cell::before {
    display: none;
  }
  .pagination-controls {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>