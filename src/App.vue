<!-- src/App.vue -->
<script setup>
import { ref, onMounted, watch, reactive } from 'vue'
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
  let query = supabase.from('drugs').select('*').order('drug_code', { ascending: true })

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

  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching drugs:', error)
    addToast('ไม่สามารถดึงข้อมูลยาได้', 'error')
  } else {
    drugs.value = data
  }
  loading.value = false
}

watch([() => state.searchTerm, () => state.filterCategory, () => state.filterStatus], () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(fetchDrugs, 300)
})

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
    await fetchDrugs()
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
    await fetchDrugs()
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

</script>

<template>
  <Navbar 
    :user="state.user"
    @login="handleLogin"
    @logout="handleLogout"
  />

  <main>
    <div class="main-header">
      <div>
        <h1>บัญชียาโรงพยาบาล</h1>
        <p class="subtitle">โรงพยาบาลสระโบสถ์</p>
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
      @edit="openEditDrugModal"
      @toggle-status="toggleDrugStatus" 
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
</style>