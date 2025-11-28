<!-- src/views/HomeView.vue -->
<script setup>
import { ref, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useDrugStore } from "../stores/drugs";
import { useAuthStore } from "../stores/auth";
import { useToastStore } from "../stores/toast";

// Components
import DrugTable from "../components/DrugTable.vue";
import CsvUploadModal from "../components/CsvUploadModal.vue";
import DrugFormModal from "../components/DrugFormModal.vue";
import DecommissionModal from "../components/DecommissionModal.vue";

// -- Stores --
const drugStore = useDrugStore();
const authStore = useAuthStore();
const toastStore = useToastStore();

// Destructure reactive state
const { drugs, loading, filters, currentPage, totalPages, totalCount } = storeToRefs(drugStore);
const { isAdmin } = storeToRefs(authStore);

// -- Local UI State --
const showCsvModal = ref(false);
const showDrugFormModal = ref(false);
const showDecommissionModal = ref(false);
const currentDrug = ref(null);
const allCategories = ref([]);
let searchTimeout;

// -- Initialization --
onMounted(async () => {
    drugStore.resetFilters();
    allCategories.value = await drugStore.fetchCategories();
    await drugStore.fetchDrugs('active');
});

// Watchers
watch(
    () => filters.value.searchTerm,
    () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            drugStore.fetchDrugs('active');
        }, 300);
    },
);

watch(() => filters.value.category, () => {
    drugStore.fetchDrugs('active');
});

// -- Handlers --
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
        toastStore.addToast("บันทึกข้อมูลยาสำเร็จ", "success");
        await drugStore.fetchDrugs('active'); // Refresh list
        allCategories.value = await drugStore.fetchCategories();
    } else {
        toastStore.addToast(`เกิดข้อผิดพลาด: ${result.message}`, "error");
    }
}

async function handleDecommission({ drug, remarks }) {
    const result = await drugStore.decommissionDrug(drug, remarks);
    if (result.success) {
        showDecommissionModal.value = false;
        toastStore.addToast(`นำยา "${drug.trade_name}" ออกจากบัญชีสำเร็จ`, "success");
        await drugStore.fetchDrugs('active'); // Refresh list
    } else {
        toastStore.addToast(`เกิดข้อผิดพลาด: ${result.message}`, "error");
    }
}

async function onCsvSuccess() {
    await drugStore.fetchDrugs('active');
    allCategories.value = await drugStore.fetchCategories();
    // Toast handled in Modal, or here if we prefer consistency
}
</script>

<template>
    <div class="page-container">
        <!-- Header Section -->
        <div class="page-header">
            <div class="header-content">
                <h1 class="page-title">บัญชียาโรงพยาบาล</h1>
                <p class="page-subtitle">จัดการรายการยาที่เปิดใช้งาน (Active List)</p>
            </div>

            <!-- Actions (Admin Only) -->
            <div class="header-actions" v-if="isAdmin">
                <button class="btn btn-secondary" @click="showCsvModal = true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>นำเข้า CSV</span>
                </button>
                <button class="btn btn-primary" @click="openAddDrugModal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>เพิ่มรายการยา</span>
                </button>
            </div>
        </div>

        <!-- Table Section -->
        <!-- Note: We bind to store filters directly -->
        <DrugTable :drugs="drugs" :loading="loading" :is-admin="isAdmin" :is-decommissioned-view="false"
            v-model:searchTerm="filters.searchTerm" v-model:filterCategory="filters.category"
            :available-categories="allCategories" :current-page="currentPage" :total-pages="totalPages"
            :total-count="totalCount" @edit="openEditDrugModal" @trigger-decommission="openDecommissionModal"
            @change-page="(p) => drugStore.changePage(p, 'active')" />

        <!-- Modals -->
        <CsvUploadModal :show="showCsvModal" @close="showCsvModal = false" @import-success="onCsvSuccess" />

        <DrugFormModal :show="showDrugFormModal" :drug="currentDrug" @close="showDrugFormModal = false"
            @save="handleSaveDrug" />

        <DecommissionModal v-if="currentDrug" :show="showDecommissionModal" :drug="currentDrug"
            @close="showDecommissionModal = false" @confirm="handleDecommission" />
    </div>
</template>

<style scoped>
/* Container Layout */
.page-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    animation: fadeIn 0.4s ease-out;
}

/* Header Styling */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 1.5rem;
    padding-bottom: 0.5rem;
}

.header-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.page-title {
    font-size: var(--fs-h2);
    font-weight: 700;
    color: var(--c-text-primary);
    line-height: 1.2;
    letter-spacing: -0.02em;
}

.page-subtitle {
    font-size: var(--fs-small);
    color: var(--c-text-secondary);
    font-weight: 500;
}

/* Action Buttons */
.header-actions {
    display: flex;
    gap: 0.75rem;
}

/* Responsive */
@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1.25rem;
        margin-top: 0.5rem;
    }

    .header-actions {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr;
    }

    .header-actions .btn {
        width: 100%;
        justify-content: center;
        padding: 0.75rem;
    }
}

/* Simple Fade In Animation */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
