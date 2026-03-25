import type { ActionResult, Drug, DrugFormData, DrugStatus } from '../types';
import { defineStore } from 'pinia';

import { computed, reactive, ref, watch } from 'vue';
import { drugService } from '../services/drug-service';

export const useDrugStore = defineStore('drugs', () => {
  // --- State ---
  const drugs = ref<Drug[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const currentPage = ref<number>(1);
  const pageSize = ref<number>(20);
  const totalCount = ref<number>(0);
  const totalPages = computed<number>(() => Math.ceil(totalCount.value / pageSize.value));

  const filters = reactive({
    searchTerm: '',
    category: 'all',
  });

  // Reset หน้าเมื่อ filter เปลี่ยน
  watch(
    () => [filters.searchTerm, filters.category],
    () => {
      currentPage.value = 1;
    },
  );

  // --- Actions (เรียก Service) ---

  async function fetchDrugs(status: DrugStatus = 'active'): Promise<void> {
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
      totalCount.value = count ?? 0;
    }
    catch (err) {
      // FIX: catch parameter is `unknown` in strict mode. Safely extract message.
      error.value = err instanceof Error ? err.message : String(err);
    }
    finally {
      loading.value = false;
    }
  }

  async function fetchCategories(): Promise<string[]> {
    try {
      return await drugService.getCategories();
    }
    catch {
      // กรณีดึงหมวดหมู่ไม่ได้ ให้คืนค่าว่างเพื่อให้แอปทำงานต่อได้
      return [];
    }
  }

  async function saveDrug(drugData: DrugFormData): Promise<ActionResult> {
    loading.value = true;
    try {
      await drugService.upsertDrugs(drugData);
      return { success: true };
    }
    catch (err) {
      // FIX: catch parameter is `unknown` in strict mode. Safely extract message.
      return { success: false, message: err instanceof Error ? err.message : String(err) };
    }
    finally {
      loading.value = false;
    }
  }

  // Action สำหรับ Bulk Import (CSV) เพื่อให้ผ่าน Store
  async function importDrugs(drugList: DrugFormData[]): Promise<ActionResult> {
    loading.value = true;
    try {
      await drugService.upsertDrugs(drugList);
      return { success: true };
    }
    catch (err) {
      // FIX: catch parameter is `unknown` in strict mode. Safely extract message.
      return { success: false, message: err instanceof Error ? err.message : String(err) };
    }
    finally {
      loading.value = false;
    }
  }

  async function decommissionDrug(drug: Drug, remarks: string): Promise<ActionResult> {
    loading.value = true;
    try {
      await drugService.updateStatus(drug.id, { isActive: false, remarks });
      return { success: true };
    }
    catch (err) {
      // FIX: catch parameter is `unknown` in strict mode. Safely extract message.
      return { success: false, message: err instanceof Error ? err.message : String(err) };
    }
    finally {
      loading.value = false;
    }
  }

  async function recommissionDrug(drug: Drug): Promise<ActionResult> {
    loading.value = true;
    try {
      await drugService.updateStatus(drug.id, { isActive: true });
      return { success: true };
    }
    catch (err) {
      // FIX: catch parameter is `unknown` in strict mode. Safely extract message.
      return { success: false, message: err instanceof Error ? err.message : String(err) };
    }
    finally {
      loading.value = false;
    }
  }

  // Helper functions
  function changePage(page: number, status: DrugStatus): void {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
      fetchDrugs(status);
    }
  }

  function resetFilters(): void {
    filters.searchTerm = '';
    filters.category = 'all';
    currentPage.value = 1;
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
