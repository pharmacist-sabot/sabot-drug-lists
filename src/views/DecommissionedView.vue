<!-- src/views/DecommissionedView.vue -->
<script setup>
import { ref, onMounted, watch, reactive, computed, inject } from 'vue'
import { supabase } from '../supabaseClient'
import DrugTable from '../components/DrugTable.vue'

const drugs = ref([])
const loading = ref(true)
const user = ref(null)
const filters = reactive({ searchTerm: '' })
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))
const addToast = inject('addToast')

async function fetchDecommissionedDrugs() {
  loading.value = true
  const from = (currentPage.value - 1) * pageSize.value
  const to = from + pageSize.value - 1

  let query = supabase
    .from('drugs')
    .select('*', { count: 'exact' })
    .eq('is_active', false) 
    .not('remarks', 'is', null) 
    .order('decommissioned_at', { ascending: false }) 
    .range(from, to)

  if (filters.searchTerm) {
    const searchTermFormatted = `%${filters.searchTerm.trim()}%`
    query = query.or(`trade_name.ilike.${searchTermFormatted},generic_name.ilike.${searchTermFormatted},drug_code.ilike.${searchTermFormatted},remarks.ilike.${searchTermFormatted}`)
  }
  
  const { data, error, count } = await query
  if (error) {
    console.error(error)
  } else {
    drugs.value = data
    totalCount.value = count || 0
  }
  loading.value = false
}

async function recommissionDrug(drug) {
    if (!confirm(`คุณต้องการนำยา "${drug.trade_name}" กลับเข้าสู่บัญชีใช่หรือไม่?`)) return

    loading.value = true
    const { error } = await supabase
        .from('drugs')
        .update({
            is_active: true,
            remarks: null, 
            decommissioned_at: null 
        })
        .eq('id', drug.id)
    
    if (error) {
        console.error('Error recommissioning drug:', error)
        addToast(`เกิดข้อผิดพลาดในการนำยาเข้าบัญชี: ${error.message}`, 'error')
    } else {
        addToast(`นำยา "${drug.trade_name}" กลับเข้าสู่บัญชีเรียบร้อยแล้ว`, 'success')
        await fetchDecommissionedDrugs()
    }
    loading.value = false
}

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  user.value = session?.user ?? null
  await fetchDecommissionedDrugs()
})

watch(() => filters.searchTerm, () => {
  currentPage.value = 1
  setTimeout(fetchDecommissionedDrugs, 300)
})

function goToPage(page) {
  currentPage.value = page
  fetchDecommissionedDrugs()
}
</script>

<template>
  <div class="main-header">
    <h1>ยาที่นำออกจากบัญชี</h1>
    <p class="subtitle">ประวัติยาที่ถูกปิดการใช้งานพร้อมเหตุผล</p>
  </div>

  <DrugTable
    :drugs="drugs"
    :loading="loading"
    :is-admin="!!user"
    :is-decommissioned-view="true"
    v-model:searchTerm="filters.searchTerm"
    :current-page="currentPage"
    :total-pages="totalPages"
    :total-count="totalCount"
    @recommission="recommissionDrug"
    @change-page="goToPage"
  />
</template>

<style scoped>
.main-header { margin-bottom: 2rem; }
h1 { font-size: 2rem; font-weight: 700; color: var(--c-text-primary); }
.subtitle { color: var(--c-text-secondary); font-size: 1rem; }
</style>