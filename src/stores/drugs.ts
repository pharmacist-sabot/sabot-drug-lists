import { defineStore } from 'pinia';
import { computed, reactive, ref, watch } from 'vue';

import type { Drug, DrugInsert } from '@/types/database.types';

import { drugService } from '@/services/drug-service'; // ตรวจสอบ path ว่าใช้ขีดกลางหรือ camelCase

export const useDrugStore = defineStore('drugs', () => {
  const drugs = ref<Drug[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const currentPage = ref(1);
  const pageSize = ref(20);
  const totalCount = ref(0);
  const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value));

  const filters = reactive({
    searchTerm: '',
    category: 'all',
  });

  watch(
    () => [filters.searchTerm, filters.category],
    () => {
      currentPage.value = 1;
    },
  );

  async function fetchDrugs(status: 'active' | 'decommissioned' = 'active') {
    loading.value = true;
    error.value = null;
    try {
      const { data, count } = await drugService.getDrugs({
        page: currentPage.value,
        pageSize: pageSize.value,
        status,
        category: filters.category,
        searchTerm: filters.searchTerm,
      });

      drugs.value = data;
      totalCount.value = count || 0;
    }
    catch (err: any) {
      error.value = err.message || 'An error occurred';
    }
    finally {
      loading.value = false;
    }
  }

  async function saveDrug(drugData: DrugInsert | DrugInsert[]) {
    loading.value = true;
    try {
      await drugService.upsertDrugs(drugData);
      return { success: true };
    }
    catch (err: any) {
      return { success: false, message: err.message };
    }
    finally {
      loading.value = false;
    }
  }

  async function importDrugs(drugList: DrugInsert[]) {
    // Re-use logic
    return saveDrug(drugList);
  }

  async function decommissionDrug(drug: Drug, remarks: string) {
    loading.value = true;
    try {
      await drugService.updateStatus(drug.id, { isActive: false, remarks });
      return { success: true };
    }
    catch (err: any) {
      return { success: false, message: err.message };
    }
    finally {
      loading.value = false;
    }
  }

  async function recommissionDrug(drug: Drug) {
    loading.value = true;
    try {
      await drugService.updateStatus(drug.id, { isActive: true });
      return { success: true };
    }
    catch (err: any) {
      return { success: false, message: err.message };
    }
    finally {
      loading.value = false;
    }
  }

  function changePage(page: number, status: 'active' | 'decommissioned') {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
      fetchDrugs(status);
    }
  }

  function resetFilters() {
    filters.searchTerm = '';
    filters.category = 'all';
    currentPage.value = 1;
  }

  async function fetchCategories() {
    try {
      return await drugService.getCategories();
    }
    catch {
      return [];
    }
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
    resetFilters,
  };
});
