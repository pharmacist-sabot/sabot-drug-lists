<!-- src/components/DrugTable.vue -->
<template>
  <div class="card">
    <div class="controls">
      <div class="search-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="search" :value="searchTerm" @input="$emit('update:searchTerm', $event.target.value)" placeholder="ค้นหา..."/>
      </div>
      <div class="filters">
        <select :value="filterCategory" @change="$emit('update:filterCategory', $event.target.value)">
          <option value="all">ทุกหมวดหมู่ (Category)</option>
          <!-- เปลี่ยนมาใช้ prop ใหม่ที่ได้รับมา -->
          <option v-for="cat in availableCategories" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
        <select :value="filterStatus" @change="$emit('update:filterStatus', $event.target.value)">
          <option value="active">ใช้งาน</option>
          <option value="inactive">ไม่ใช้งาน</option>
          <option value="all">ทั้งหมด</option>
        </select>
      </div>
    </div>

    <div class="table-container">
      <div v-if="loading" class="loading-state">กำลังโหลดข้อมูล...</div>
      <table v-else-if="drugs.length > 0" class="drug-table">
        <thead>
          <tr>
            <th>รหัส / ชื่อยา</th>
            <th>สถานะ</th>
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
            <td data-label="สถานะ">
              <span :class="['tag', drug.is_active ? 'tag-active' : 'tag-inactive']">
                {{ drug.is_active ? 'ใช้งาน' : 'ไม่ใช้งาน' }}
              </span>
            </td>
            <td v-if="isAdmin" class="actions-cell">
              <button @click="$emit('edit', drug)" class="action-btn" title="แก้ไข">✏️</button>
              <button @click="$emit('toggle-status', drug)" class="action-btn" :title="drug.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'">
                {{ drug.is_active ? '🟢' : '🔴' }}
              </button>
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
        <button 
          class="btn btn-secondary" 
          @click="$emit('change-page', currentPage - 1)" 
          :disabled="currentPage === 1">
          &lt; ก่อนหน้า
        </button>
        <button 
          class="btn btn-secondary" 
          @click="$emit('change-page', currentPage + 1)" 
          :disabled="currentPage >= totalPages">
          ถัดไป &gt;
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
// import { computed } from 'vue' // ไม่ต้องการ computed แล้ว

defineProps({
  drugs: Array,
  loading: Boolean,
  isAdmin: Boolean,
  searchTerm: String,
  filterCategory: String,
  filterStatus: String,
  currentPage: Number,
  totalPages: Number,
  totalCount: Number,
  // รับ prop ใหม่เข้ามา
  availableCategories: Array,
})

defineEmits(['edit', 'toggle-status', 'update:searchTerm', 'update:filterCategory', 'update:filterStatus', 'change-page'])

</script>

<style scoped>
.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}
.search-box {
  display: flex;
  align-items: center;
  background-color: var(--c-surface);
  border-radius: 8px;
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--c-border);
  flex-grow: 1;
  max-width: 400px;
  transition: var(--transition);
}
.search-box:focus-within {
  border-color: var(--c-primary);
  box-shadow: 0 0 0 3px var(--c-primary-light);
}
.search-box svg {
  color: var(--c-text-secondary);
  margin-right: 0.5rem;
}
.search-box input {
  width: 100%;
  border: none;
  background: transparent;
  padding: 0.75rem 0.5rem;
  outline: none;
  color: var(--c-text-primary);
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
  font-size: 1.2rem;
  transition: var(--transition);
}
.action-btn:hover {
  background-color: var(--c-background);
  transform: scale(1.1);
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
  .search-box {
    max-width: none;
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