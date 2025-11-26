// src/composables/useDrugs.js
import { ref, computed, watch, reactive } from "vue";
import { supabase } from "../supabaseClient";

export function useDrugs(config = { status: "active" }) {
  // State
  const drugs = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Pagination State
  const currentPage = ref(1);
  const pageSize = ref(20);
  const totalCount = ref(0);
  const totalPages = computed(() =>
    Math.ceil(totalCount.value / pageSize.value),
  );

  // Filters
  const filters = reactive({
    searchTerm: "",
    category: "all",
  });

  // Watch filters to reset page
  watch(
    () => [filters.searchTerm, filters.category],
    () => {
      currentPage.value = 1;
    },
  );

  /**
   * Fetch drugs from Supabase with pagination, search, and filtering
   */
  async function fetchDrugs() {
    loading.value = true;
    error.value = null;

    try {
      const from = (currentPage.value - 1) * pageSize.value;
      const to = from + pageSize.value - 1;

      // Base query
      let query = supabase.from("drugs").select("*", { count: "exact" });

      // Status filter (Active vs Decommissioned)
      if (config.status === "decommissioned") {
        query = query
          .eq("is_active", false)
          .not("remarks", "is", null)
          .order("decommissioned_at", { ascending: false });
      } else {
        query = query
          .eq("is_active", true)
          .order("drug_code", { ascending: true });
      }

      // Category filter
      if (filters.category && filters.category !== "all") {
        query = query.eq("category", filters.category);
      }

      // Search term filter
      if (filters.searchTerm) {
        const term = `%${filters.searchTerm.trim()}%`;
        // Note: Supabase ILIKE syntax
        query = query.or(
          `trade_name.ilike.${term},generic_name.ilike.${term},drug_code.ilike.${term},remarks.ilike.${term}`,
        );
      }

      // Pagination
      query = query.range(from, to);

      const { data, count, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      drugs.value = data;
      totalCount.value = count || 0;
    } catch (err) {
      console.error("Error fetching drugs:", err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Fetch unique categories for dropdown
   */
  async function fetchCategories() {
    try {
      const { data, error } = await supabase.rpc("get_unique_categories", {
        status_filter: "active",
      });
      if (error) throw error;
      return data.map((item) => item.category);
    } catch (err) {
      console.error("Error fetching categories:", err);
      return [];
    }
  }

  /**
   * Add or Update a drug
   */
  async function saveDrug(drugData) {
    loading.value = true;
    try {
      const operation = drugData.id
        ? supabase.from("drugs").update(drugData).eq("id", drugData.id)
        : supabase.from("drugs").insert([drugData]);

      const { error: saveError } = await operation;
      if (saveError) throw saveError;

      await fetchDrugs(); // Refresh list
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Decommission a drug (Soft delete)
   */
  async function decommissionDrug(drug, remarks) {
    loading.value = true;
    try {
      const { error: updateError } = await supabase
        .from("drugs")
        .update({
          is_active: false,
          remarks: remarks,
          decommissioned_at: new Date().toISOString(),
        })
        .eq("id", drug.id);

      if (updateError) throw updateError;

      await fetchDrugs();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Recommission a drug (Restore)
   */
  async function recommissionDrug(drug) {
    loading.value = true;
    try {
      const { error: updateError } = await supabase
        .from("drugs")
        .update({
          is_active: true,
          remarks: null,
          decommissioned_at: null,
        })
        .eq("id", drug.id);

      if (updateError) throw updateError;

      await fetchDrugs();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      loading.value = false;
    }
  }

  function changePage(page) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
      fetchDrugs();
    }
  }

  return {
    // State
    drugs,
    loading,
    error,
    filters,

    // Pagination
    currentPage,
    totalPages,
    totalCount,

    // Actions
    fetchDrugs,
    fetchCategories,
    saveDrug,
    decommissionDrug,
    recommissionDrug,
    changePage,
  };
}
