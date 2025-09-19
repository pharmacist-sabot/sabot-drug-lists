<!-- src/views/HomeView.vue -->
<script setup>
import { ref, onMounted, watch, reactive, computed, inject } from 'vue'
import { supabase } from '../supabaseClient'
import DrugTable from '../components/DrugTable.vue'
import CsvUploadModal from '../components/CsvUploadModal.vue'
import DrugFormModal from '../components/DrugFormModal.vue'
import DecommissionModal from '../components/DecommissionModal.vue'

const drugs = ref([])
const loading = ref(true)
const showCsvModal = ref(false)
const showDrugFormModal = ref(false)
const showDecommissionModal = ref(false)
const currentDrug = ref(null)
const allCategories = ref([])
const user = ref(null)
const addToast = inject('addToast')

const pageSize = ref(20)
const currentPage = ref(1)
const totalCount = ref(0)
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

const filters = reactive({
  searchTerm: '',
  filterCategory: 'all',
  filterStatus: 'active',
})

let searchTimeout
async function fetchAllCategories() {
  const { data, error } = await supabase.rpc('get_unique_categories', { status_filter: 'active' })
  if (error) {
    console.error('Error fetching categories:', error)
  } else {
    allCategories.value = data.map(item => item.category)
    if (!allCategories.value.includes(filters.filterCategory) && filters.filterCategory !== 'all') {
      filters.filterCategory = 'all';
    }
  }
}
async function fetchDrugs() {
  loading.value = true
  const from = (currentPage.value - 1) * pageSize.value
  const to = from + pageSize.value - 1

  let query = supabase
    .from('drugs')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order('drug_code', { ascending: true })
    .range(from, to)

  if (filters.filterCategory !== 'all') {
    query = query.eq('category', filters.filterCategory)
  }

  if (filters.searchTerm) {
    const searchTermFormatted = `%${filters.searchTerm.trim()}%`
    query = query.or(`trade_name.ilike.${searchTermFormatted},generic_name.ilike.${searchTermFormatted},drug_code.ilike.${searchTermFormatted}`)
  }

  const { data, error, count } = await query
  if (error) {
    addToast('ไม่สามารถดึงข้อมูลยาได้', 'error')
  } else {
    drugs.value = data
    totalCount.value = count || 0
  }
  loading.value = false
}
onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  user.value = session?.user ?? null

  await fetchAllCategories()
  await fetchDrugs()
})
watch([() => filters.searchTerm, () => filters.filterCategory], () => {
  clearTimeout(searchTimeout)
  currentPage.value = 1
  searchTimeout = setTimeout(fetchDrugs, 300)
})
function goToPage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchDrugs()
}
function openAddDrugModal() { currentDrug.value = null; showDrugFormModal.value = true; }
function openEditDrugModal(drug) { currentDrug.value = { ...drug }; showDrugFormModal.value = true; }
function openDecommissionModal(drug) { currentDrug.value = drug; showDecommissionModal.value = true; }
async function saveDrug(drugData) {
  loading.value = true
  const { error } = drugData.id
    ? await supabase.from('drugs').update(drugData).eq('id', drugData.id)
    : await supabase.from('drugs').insert([drugData])
  if (error) {
    addToast(`เกิดข้อผิดพลาด: ${error.message}`, 'error')
  } else {
    showDrugFormModal.value = false
    addToast('บันทึกข้อมูลยาสำเร็จ', 'success')
    await fetchDrugs()
    await fetchAllCategories()
  }
  loading.value = false
}
async function decommissionDrug({ drug, remarks }) {
  loading.value = true
  const { error } = await supabase
    .from('drugs')
    .update({ 
      is_active: false,
      remarks: remarks,
      decommissioned_at: new Date().toISOString()
    })
    .eq('id', drug.id)
  
  if (error) {
    addToast('เกิดข้อผิดพลาดในการนำยาออก', 'error')
  } else {
    addToast(`นำยา "${drug.trade_name}" ออกจากบัญชีสำเร็จ`, 'success')
    await fetchDrugs()
    await fetchAllCategories()
  }
  showDecommissionModal.value = false
  loading.value = false
}

</script>

<template>
  <div class="main-header">
    <div class="header-left">
      <div>
        <h1>บัญชียาโรงพยาบาล</h1>
        <p class="subtitle">โรงพยาบาลสระโบสถ์</p>
      </div>
    </div>
    <div class="actions" v-if="user">
      <button class="btn btn-secondary" @click="showCsvModal = true">นำเข้า CSV</button>
      <button class="btn btn-primary" @click="openAddDrugModal">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        เพิ่มรายการยา
      </button>
    </div>
  </div>

  <DrugTable 
    :drugs="drugs"
    :loading="loading"
    :is-admin="!!user"
    :is-decommissioned-view="false"
    v-model:searchTerm="filters.searchTerm"
    v-model:filterCategory="filters.filterCategory"
    :available-categories="allCategories"
    :current-page="currentPage"
    :total-pages="totalPages"
    :total-count="totalCount"
    @edit="openEditDrugModal"
    @trigger-decommission="openDecommissionModal" 
    @change-page="goToPage"
  />

  <CsvUploadModal 
    :show="showCsvModal" 
    @close="showCsvModal = false"
    @import-success="() => { fetchDrugs(); fetchAllCategories(); addToast('นำเข้าข้อมูลสำเร็จ!', 'success'); }"
  />

  <DrugFormModal
    :show="showDrugFormModal"
    :drug="currentDrug"
    @close="showDrugFormModal = false"
    @save="saveDrug"
  />

  <DecommissionModal
    v-if="currentDrug"
    :show="showDecommissionModal"
    :drug="currentDrug"
    @close="showDecommissionModal = false"
    @confirm="decommissionDrug"
  />
</template>

<style scoped>
.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}
h1 { font-size: 2rem; font-weight: 700; color: var(--c-text-primary); }
.subtitle { color: var(--c-text-secondary); font-size: 1rem; }
.actions { display: flex; gap: 1rem; }
@media (max-width: 768px) {
  .main-header { 
    justify-content: flex-start; 
    margin-top: -1rem; 
    margin-left: 2.5rem;
  }
  .actions { width: 100%; justify-content: space-between; margin-left: -2.5rem;}
}
</style>