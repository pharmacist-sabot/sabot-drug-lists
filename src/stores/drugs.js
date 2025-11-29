// src/stores/drugs.js
import { defineStore } from 'pinia'
import { ref, computed, reactive, watch } from 'vue'
import { drugService } from '../services/drugService'

export const useDrugStore = defineStore('drugs', () => {
  // --- State ---
  const drugs = ref([])
  const loading = ref(false)
  const error = ref(null)

  const currentPage = ref(1)
  const pageSize = ref(20)
  const totalCount = ref(0)
  const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

  const filters = reactive({
    searchTerm: '',
    category: 'all',
  })

  // Reset หน้าเมื่อ filter เปลี่ยน
  watch(
    () => [filters.searchTerm, filters.category],
    () => { currentPage.value = 1 }
  )

  // --- Actions (เรียก Service) ---

  async function fetchDrugs(status = 'active') {
    loading.value = true
    error.value = null
    try {
      const { data, count } = await drugService.getDrugs({
        page: currentPage.value,
        pageSize: pageSize.value,
        status: status,
        category: filters.category,
        searchTerm: filters.searchTerm
      })

      drugs.value = data
      totalCount.value = count || 0
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function fetchCategories() {
    try {
      return await drugService.getCategories()
    } catch (err) {
      // กรณีดึงหมวดหมู่ไม่ได้ ให้คืนค่าว่างเพื่อให้แอปทำงานต่อได้
      return []
    }
  }

  async function saveDrug(drugData) {
    loading.value = true
    try {
      await drugService.upsertDrugs(drugData)
      return { success: true }
    } catch (err) {
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  // Action สำหรับ Bulk Import (CSV) เพื่อให้ผ่าน Store
  async function importDrugs(drugList) {
    loading.value = true
    try {
      await drugService.upsertDrugs(drugList)
      return { success: true }
    } catch (err) {
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  async function decommissionDrug(drug, remarks) {
    loading.value = true
    try {
      await drugService.updateStatus(drug.id, { isActive: false, remarks })
      return { success: true }
    } catch (err) {
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  async function recommissionDrug(drug) {
    loading.value = true
    try {
      await drugService.updateStatus(drug.id, { isActive: true })
      return { success: true }
    } catch (err) {
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  // Helper functions
  function changePage(page, status) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      fetchDrugs(status)
    }
  }

  function resetFilters() {
    filters.searchTerm = ''
    filters.category = 'all'
    currentPage.value = 1
  }

  return {
    drugs,
    loading,
    error,
    filters,
    currentPage,
    totalPages,
    totalCount,
    fetchDrugs,
    fetchCategories,
    saveDrug,
    importDrugs,
    decommissionDrug,
    recommissionDrug,
    changePage,
    resetFilters
  }
})
