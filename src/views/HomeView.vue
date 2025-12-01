<script setup>
  import { ref, onMounted, watch } from 'vue';
  import { storeToRefs } from 'pinia';
  import { Upload, Plus, LayoutDashboard } from 'lucide-vue-next';
  import { useDrugStore } from '../stores/drugs';
  import { useAuthStore } from '../stores/auth';
  import { useToastStore } from '../stores/toast';

  import DrugTable from '../components/DrugTable.vue';
  import CsvUploadModal from '../components/CsvUploadModal.vue';
  import DrugFormModal from '../components/DrugFormModal.vue';
  import DecommissionModal from '../components/DecommissionModal.vue';

  const drugStore = useDrugStore();
  const authStore = useAuthStore();
  const toastStore = useToastStore();

  const { drugs, loading, filters, currentPage, totalPages, totalCount } = storeToRefs(drugStore);
  const { isAdmin } = storeToRefs(authStore);

  const showCsvModal = ref(false);
  const showDrugFormModal = ref(false);
  const showDecommissionModal = ref(false);
  const currentDrug = ref(null);
  const allCategories = ref([]);
  let searchTimeout;

  onMounted(async () => {
    drugStore.resetFilters();
    allCategories.value = await drugStore.fetchCategories();
    await drugStore.fetchDrugs('active');
  });

  watch(
    () => filters.value.searchTerm,
    () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        drugStore.fetchDrugs('active');
      }, 300);
    },
  );

  watch(
    () => filters.value.category,
    () => {
      drugStore.fetchDrugs('active');
    },
  );

  function openAddDrugModal() {
    currentDrug.value = null;
    showDrugFormModal.value = true;
  }

  function openEditDrugModal(drug) {
    currentDrug.value = { ...drug };
    showDrugFormModal.value = true;
  }

  function openDecommissionModal(drug) {
    currentDrug.value = drug;
    showDecommissionModal.value = true;
  }

  async function handleSaveDrug(drugData) {
    const result = await drugStore.saveDrug(drugData);
    if (result.success) {
      showDrugFormModal.value = false;
      toastStore.addToast('บันทึกข้อมูลยาสำเร็จ', 'success');
      await drugStore.fetchDrugs('active');
      allCategories.value = await drugStore.fetchCategories();
    } else {
      toastStore.addToast(`เกิดข้อผิดพลาด: ${result.message}`, 'error');
    }
  }

  async function handleDecommission({ drug, remarks }) {
    const result = await drugStore.decommissionDrug(drug, remarks);
    if (result.success) {
      showDecommissionModal.value = false;
      toastStore.addToast(`นำยา "${drug.trade_name}" ออกจากบัญชีสำเร็จ`, 'success');
      await drugStore.fetchDrugs('active');
    } else {
      toastStore.addToast(`เกิดข้อผิดพลาด: ${result.message}`, 'error');
    }
  }

  async function onCsvSuccess() {
    await drugStore.fetchDrugs('active');
    allCategories.value = await drugStore.fetchCategories();
  }
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-20">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div class="flex items-start gap-4">
        <div
          class="hidden md:flex w-12 h-12 bg-white rounded-2xl items-center justify-center text-blue-600 shadow-sm border border-slate-100"
        >
          <LayoutDashboard :size="24" />
        </div>
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">รายการยาปัจจุบัน</h2>
          <p class="text-slate-500 text-sm mt-1">จัดการข้อมูลยา ราคายา และสถานะการใช้งาน</p>
        </div>
      </div>

      <div class="flex items-center gap-3 w-full md:w-auto" v-if="isAdmin">
        <button
          class="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
          @click="showCsvModal = true"
        >
          <Upload :size="16" />
          Import CSV
        </button>
        <button
          class="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 transition-all active:scale-95"
          @click="openAddDrugModal"
        >
          <Plus :size="18" />
          เพิ่มรายการยา
        </button>
      </div>
    </div>

    <!-- Table -->
    <DrugTable
      :drugs="drugs"
      :loading="loading"
      :is-admin="isAdmin"
      :is-decommissioned-view="false"
      v-model:searchTerm="filters.searchTerm"
      v-model:filterCategory="filters.category"
      :available-categories="allCategories"
      :current-page="currentPage"
      :total-pages="totalPages"
      :total-count="totalCount"
      @edit="openEditDrugModal"
      @trigger-decommission="openDecommissionModal"
      @change-page="(p) => drugStore.changePage(p, 'active')"
    />

    <!-- Modals -->
    <CsvUploadModal
      :show="showCsvModal"
      @close="showCsvModal = false"
      @import-success="onCsvSuccess"
    />
    <DrugFormModal
      :show="showDrugFormModal"
      :drug="currentDrug"
      @close="showDrugFormModal = false"
      @save="handleSaveDrug"
    />
    <DecommissionModal
      v-if="currentDrug"
      :show="showDecommissionModal"
      :drug="currentDrug"
      @close="showDecommissionModal = false"
      @confirm="handleDecommission"
    />
  </div>
</template>
