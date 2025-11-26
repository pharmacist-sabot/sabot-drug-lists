<!-- src/views/HomeView.vue -->
<script setup>
import { ref, onMounted, watch, inject } from "vue";
import { useDrugs } from "../composables/useDrugs";
import { useAuth } from "../composables/useAuth";

// Components
import DrugTable from "../components/DrugTable.vue";
import CsvUploadModal from "../components/CsvUploadModal.vue";
import DrugFormModal from "../components/DrugFormModal.vue";
import DecommissionModal from "../components/DecommissionModal.vue";

// -- Core Logic via Composables --
// Initialize for 'active' drugs
const {
    drugs,
    loading,
    filters,
    currentPage,
    totalPages,
    totalCount,
    fetchDrugs,
    fetchCategories,
    saveDrug: apiSaveDrug,
    decommissionDrug: apiDecommissionDrug,
    changePage,
} = useDrugs({ status: "active" });

const { isAdmin } = useAuth();
const addToast = inject("addToast");

// -- Local UI State --
const showCsvModal = ref(false);
const showDrugFormModal = ref(false);
const showDecommissionModal = ref(false);
const currentDrug = ref(null);
const allCategories = ref([]);
let searchTimeout;

// -- Initialization --
onMounted(async () => {
    allCategories.value = await fetchCategories();
    await fetchDrugs();
});

// Debounce search
watch(
    () => filters.searchTerm,
    () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentPage.value = 1;
            fetchDrugs();
        }, 300);
    },
);

// Reload on category change
watch(
    () => filters.category,
    () => {
        // Map local v-model back to composable filter if needed,
        // but we bound directly in template. Just trigger fetch.
        currentPage.value = 1;
        fetchDrugs();
    },
);

// -- Modal Handlers --
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

// -- Action Handlers --
async function handleSaveDrug(drugData) {
    const result = await apiSaveDrug(drugData);

    if (result.success) {
        showDrugFormModal.value = false;
        addToast("บันทึกข้อมูลยาสำเร็จ", "success");
        // Refresh categories in case a new one was added
        allCategories.value = await fetchCategories();
    } else {
        addToast(`เกิดข้อผิดพลาด: ${result.message}`, "error");
    }
}

async function handleDecommission({ drug, remarks }) {
    const result = await apiDecommissionDrug(drug, remarks);

    if (result.success) {
        showDecommissionModal.value = false;
        addToast(`นำยา "${drug.trade_name}" ออกจากบัญชีสำเร็จ`, "success");
    } else {
        addToast(`เกิดข้อผิดพลาด: ${result.message}`, "error");
    }
}

async function onCsvSuccess() {
    await fetchDrugs();
    allCategories.value = await fetchCategories();
    addToast("นำเข้าข้อมูลสำเร็จ!", "success");
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

        <!-- Actions (Admin Only) -->
        <div class="actions" v-if="isAdmin">
            <button class="btn btn-secondary" @click="showCsvModal = true">
                นำเข้า CSV
            </button>
            <button class="btn btn-primary" @click="openAddDrugModal">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                เพิ่มรายการยา
            </button>
        </div>
    </div>

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
        @change-page="changePage"
    />

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
@media (max-width: 768px) {
    .main-header {
        justify-content: flex-start;
        margin-top: -1rem;
        margin-left: 2.5rem;
    }
    .actions {
        width: 100%;
        justify-content: space-between;
        margin-left: -2.5rem;
    }
}
</style>
