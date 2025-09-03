<!-- src/App.vue -->
<script setup>
import { ref, onMounted, watch, reactive, computed } from 'vue'
import { supabase } from './supabaseClient'

import Navbar from './components/Navbar.vue'
import DrugTable from './components/DrugTable.vue'
import CsvUploadModal from './components/CsvUploadModal.vue'
import DrugFormModal from './components/DrugFormModal.vue'
import Toast from './components/Toast.vue'

const drugs = ref([])
const loading = ref(true)
const showCsvModal = ref(false)
const showDrugFormModal = ref(false)
const currentDrug = ref(null)
const toasts = ref([])
const mobileMenuOpen = ref(false)

// Pagination State
const pageSize = ref(20) // Items per page
const currentPage = ref(1)
const totalCount = ref(0)

const totalPages = computed(() => {
  return Math.ceil(totalCount.value / pageSize.value)
})

const state = reactive({
  user: null,
  searchTerm: '',
  filterCategory: 'all',
  filterStatus: 'active',
})

let searchTimeout

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  state.user = session?.user ?? null
  
  supabase.auth.onAuthStateChange((_, session) => {
    state.user = session?.user ?? null
    addToast('สถานะผู้ใช้เปลี่ยนแปลง', 'info')
    fetchDrugs() 
  })

  fetchDrugs()
})

async function fetchDrugs() {
  loading.value = true
  
  // Calculate range for pagination
  const from = (currentPage.value - 1) * pageSize.value
  const to = from + pageSize.value - 1

  let query = supabase
    .from('drugs')
    // IMPORTANT: Request total count along with the data
    .select('*', { count: 'exact' }) 
    .order('drug_code', { ascending: true })
    .range(from, to) // Apply pagination

  // Apply status filter
  if (state.filterStatus === 'active') {
    query = query.eq('is_active', true)
  } else if (state.filterStatus === 'inactive') {
    query = query.eq('is_active', false)
  }
  
  if (state.filterCategory !== 'all') {
    query = query.eq('category', state.filterCategory)
  }

  // Apply search
  if (state.searchTerm) {
    const searchTermFormatted = `%${state.searchTerm.trim()}%`
    query = query.or(`trade_name.ilike.${searchTermFormatted},generic_name.ilike.${searchTermFormatted},drug_code.ilike.${searchTermFormatted}`)
  }

  const { data, error, count } = await query
  
  if (error) {
    console.error('Error fetching drugs:', error)
    addToast('ไม่สามารถดึงข้อมูลยาได้', 'error')
  } else {
    drugs.value = data
    totalCount.value = count || 0 // Update total count
  }
  loading.value = false
}

// Watch for filter changes to reset page and re-fetch
watch([() => state.searchTerm, () => state.filterCategory, () => state.filterStatus], () => {
  clearTimeout(searchTimeout)
  currentPage.value = 1 // Reset to first page on new search/filter
  searchTimeout = setTimeout(fetchDrugs, 300)
})

function goToPage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchDrugs()
}

function openAddDrugModal() {
  currentDrug.value = null
  showDrugFormModal.value = true
}

function openEditDrugModal(drug) {
  currentDrug.value = { ...drug }
  showDrugFormModal.value = true
}

async function saveDrug(drugData) {
  loading.value = true
  const { error } = drugData.id
    ? await supabase.from('drugs').update(drugData).eq('id', drugData.id)
    : await supabase.from('drugs').insert([drugData])

  if (error) {
    console.error('Error saving drug:', error)
    addToast(`เกิดข้อผิดพลาด: ${error.message}`, 'error')
  } else {
    showDrugFormModal.value = false
    addToast('บันทึกข้อมูลยาสำเร็จ', 'success')
    await fetchDrugs() // Refetch current page
  }
  loading.value = false
}

async function toggleDrugStatus(drug) {
  loading.value = true
  const { error } = await supabase
    .from('drugs')
    .update({ is_active: !drug.is_active })
    .eq('id', drug.id)
  
  if (error) {
    addToast('เกิดข้อผิดพลาดในการอัปเดตสถานะ', 'error')
  } else {
    addToast(`เปลี่ยนสถานะยา "${drug.trade_name}" สำเร็จ`, 'success')
    await fetchDrugs() // Refetch current page
  }
  loading.value = false
}

async function handleLogin() {
  const { error } = await supabase.auth.signInWithOAuth({ 
    provider: 'github',
    options: {
      redirectTo: window.location.origin
    }
  })
  if (error) addToast(`Login Error: ${error.message}`, 'error')
}

async function handleLogout() {
  const { error } = await supabase.auth.signOut()
  if (error) addToast(`Logout Error: ${error.message}`, 'error')
}

function addToast(message, type = 'info') {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3000)
}

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

</script>

<template>
  <Navbar 
    :user="state.user"
    :mobileMenuOpen="mobileMenuOpen"
    @login="handleLogin"
    @logout="handleLogout"
    @toggle-mobile-menu="toggleMobileMenu"
  />

  <main :class="{ 'main-shift': mobileMenuOpen }">
    <div class="main-header">
      <div class="header-left">
        <button class="mobile-menu-btn" @click="toggleMobileMenu" v-if="!mobileMenuOpen">☰</button>
        <div>
          <h1>บัญชียาโรงพยาบาล</h1>
          <p class="subtitle">โรงพยาบาลสระโบสถ์</p>
        </div>
      </div>
      <div class="actions" v-if="state.user">
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
      :is-admin="!!state.user"
      v-model:searchTerm="state.searchTerm"
      v-model:filterCategory="state.filterCategory"
      v-model:filterStatus="state.filterStatus"
      :current-page="currentPage"
      :total-pages="totalPages"
      :total-count="totalCount"
      @edit="openEditDrugModal"
      @toggle-status="toggleDrugStatus" 
      @change-page="goToPage"
    />
  </main>

  <CsvUploadModal 
    :show="showCsvModal" 
    @close="showCsvModal = false"
    @import-success="() => { fetchDrugs(); addToast('นำเข้าข้อมูลสำเร็จ!', 'success'); }"
  />

  <DrugFormModal
    :show="showDrugFormModal"
    :drug="currentDrug"
    @close="showDrugFormModal = false"
    @save="saveDrug"
  />
  
  <div class="toast-container">
    <Toast v-for="toast in toasts" :key="toast.id" :message="toast.message" :type="toast.type" />
  </div>
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
.mobile-menu-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--c-text-primary);
  display: none;
}
h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--c-text-primary);
}
.subtitle {
  color: var(--c-text-secondary);
  font-size: 1rem;
}
.actions {
  display: flex;
  gap: 1rem;
}
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.main-shift {
  margin-left: 260px;
}

@media (max-width: 768px) {
  .mobile-menu-btn {
    display: block;
  }
  .main-header {
    justify-content: flex-start;
  }
  .actions {
    width: 100%;
    justify-content: space-between;
  }
  .main-shift {
    margin-left: 0;
    opacity: 0.5;
    pointer-events: none;
  }
}
</style>