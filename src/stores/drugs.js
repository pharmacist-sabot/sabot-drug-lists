import { defineStore } from 'pinia'
import { ref, computed, reactive, watch } from 'vue'
import { supabase } from '../supabaseClient'

export const useDrugStore = defineStore('drugs', () => {
  // State
  const drugs = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Pagination
  const currentPage = ref(1)
  const pageSize = ref(20)
  const totalCount = ref(0)
  const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

  // Filters
  const filters = reactive({
    searchTerm: '',
    category: 'all',
  })

  // Helper to reset pagination when filters change
  watch(
    () => [filters.searchTerm, filters.category],
    () => {
      currentPage.value = 1
    }
  )

  // Actions
  async function fetchDrugs(status = 'active') {
    loading.value = true
    error.value = null
    try {
      const from = (currentPage.value - 1) * pageSize.value
      const to = from + pageSize.value - 1

      let query = supabase.from('drugs').select('*', { count: 'exact' })

      if (status === 'decommissioned') {
        query = query
          .eq('is_active', false)
          .not('remarks', 'is', null)
          .order('decommissioned_at', { ascending: false })
      } else {
        query = query
          .eq('is_active', true)
          .order('drug_code', { ascending: true })
      }

      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category)
      }

      if (filters.searchTerm) {
        const term = `%${filters.searchTerm.trim()}%`
        query = query.or(
          `trade_name.ilike.${term},generic_name.ilike.${term},drug_code.ilike.${term},remarks.ilike.${term}`
        )
      }

      query = query.range(from, to)

      const { data, count, error: fetchError } = await query
      if (fetchError) throw fetchError

      drugs.value = data
      totalCount.value = count || 0
    } catch (err) {
      console.error('Error fetching drugs:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function fetchCategories() {
    try {
      const { data, error } = await supabase.rpc('get_unique_categories', {
        status_filter: 'active',
      })
      if (error) throw error
      return data.map((item) => item.category)
    } catch (err) {
      console.error('Error fetching categories:', err)
      return []
    }
  }

  async function saveDrug(drugData) {
    loading.value = true
    try {
      const operation = drugData.id
        ? supabase.from('drugs').update(drugData).eq('id', drugData.id)
        : supabase.from('drugs').insert([drugData])

      const { error: saveError } = await operation
      if (saveError) throw saveError

      // Note: We don't auto-fetch here to allow the view to decide (e.g. keeping filters)
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
      const { error: updateError } = await supabase
        .from('drugs')
        .update({
          is_active: false,
          remarks: remarks,
          decommissioned_at: new Date().toISOString(),
        })
        .eq('id', drug.id)

      if (updateError) throw updateError
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
      const { error: updateError } = await supabase
        .from('drugs')
        .update({
          is_active: true,
          remarks: null,
          decommissioned_at: null,
        })
        .eq('id', drug.id)

      if (updateError) throw updateError
      return { success: true }
    } catch (err) {
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

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
    decommissionDrug,
    recommissionDrug,
    changePage,
    resetFilters
  }
})
