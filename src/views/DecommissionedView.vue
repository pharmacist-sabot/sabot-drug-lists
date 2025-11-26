<!-- src/views/DecommissionedView.vue -->
<script setup>
import { onMounted, watch, inject } from "vue";
import { useDrugs } from "../composables/useDrugs";
import { useAuth } from "../composables/useAuth";
import DrugTable from "../components/DrugTable.vue";

// -- Core Logic via Composables --
// Initialize for 'decommissioned' drugs
const {
    drugs,
    loading,
    filters,
    currentPage,
    totalPages,
    totalCount,
    fetchDrugs,
    recommissionDrug: apiRecommissionDrug,
    changePage,
} = useDrugs({ status: "decommissioned" });

const { isAdmin } = useAuth();
const addToast = inject("addToast");
let searchTimeout;

onMounted(() => {
    fetchDrugs();
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

async function handleRecommission(drug) {
    if (
        !confirm(
            `คุณต้องการนำยา "${drug.trade_name}" กลับเข้าสู่บัญชีใช่หรือไม่?`,
        )
    )
        return;

    const result = await apiRecommissionDrug(drug);

    if (result.success) {
        addToast(
            `นำยา "${drug.trade_name}" กลับเข้าสู่บัญชีเรียบร้อยแล้ว`,
            "success",
        );
    } else {
        addToast(`เกิดข้อผิดพลาด: ${result.message}`, "error");
    }
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
        :is-admin="isAdmin"
        :is-decommissioned-view="true"
        v-model:searchTerm="filters.searchTerm"
        :current-page="currentPage"
        :total-pages="totalPages"
        :total-count="totalCount"
        @recommission="handleRecommission"
        @change-page="changePage"
    />
</template>

<style scoped>
.main-header {
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
</style>
