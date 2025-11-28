<!-- src/views/DecommissionedView.vue -->
<script setup>
import { onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useDrugStore } from "../stores/drugs";
import { useAuthStore } from "../stores/auth";
import { useToastStore } from "../stores/toast";
import DrugTable from "../components/DrugTable.vue";

// -- Stores --
const drugStore = useDrugStore();
const authStore = useAuthStore();
const toastStore = useToastStore();

const { drugs, loading, filters, currentPage, totalPages, totalCount } = storeToRefs(drugStore);
const { isAdmin } = storeToRefs(authStore);

let searchTimeout;

onMounted(() => {
    drugStore.resetFilters();
    drugStore.fetchDrugs('decommissioned');
});

// Debounce search
watch(
    () => filters.value.searchTerm,
    () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            drugStore.fetchDrugs('decommissioned');
        }, 300);
    },
);

async function handleRecommission(drug) {
    if (!confirm(`คุณต้องการนำยา "${drug.trade_name}" กลับเข้าสู่บัญชีใช่หรือไม่?`)) {
        return;
    }

    const result = await drugStore.recommissionDrug(drug);

    if (result.success) {
        toastStore.addToast(`นำยา "${drug.trade_name}" กลับเข้าสู่บัญชีเรียบร้อยแล้ว`, "success");
        drugStore.fetchDrugs('decommissioned'); // Refresh list
    } else {
        toastStore.addToast(`เกิดข้อผิดพลาด: ${result.message}`, "error");
    }
}
</script>

<template>
    <div class="page-container">
        <!-- Header Section -->
        <div class="page-header">
            <div class="header-content">
                <h1 class="page-title">ยาที่นำออกจากบัญชี</h1>
                <p class="page-subtitle">ประวัติรายการยาที่ถูกยกเลิกการใช้งาน (Decommissioned List)</p>
            </div>
        </div>

        <!-- Table Section -->
        <DrugTable :drugs="drugs" :loading="loading" :is-admin="isAdmin" :is-decommissioned-view="true"
            v-model:searchTerm="filters.searchTerm" :current-page="currentPage" :total-pages="totalPages"
            :total-count="totalCount" @recommission="handleRecommission"
            @change-page="(p) => drugStore.changePage(p, 'decommissioned')" />
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

/* Responsive */
@media (max-width: 768px) {
    .page-header {
        margin-top: 0.5rem;
    }
}

/* Animation */
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
