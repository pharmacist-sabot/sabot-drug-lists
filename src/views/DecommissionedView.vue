<script setup>
import { onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useDrugStore } from "../stores/drugs";
import { useAuthStore } from "../stores/auth";
import { useToastStore } from "../stores/toast";
import DrugTable from "../components/DrugTable.vue";
import { ArchiveRestore, History } from 'lucide-vue-next'

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

watch(() => filters.value.searchTerm, () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => { drugStore.fetchDrugs('decommissioned'); }, 300);
});

async function handleRecommission(drug) {
    if (!confirm(`คุณต้องการนำยา "${drug.trade_name}" กลับเข้าสู่บัญชีใช่หรือไม่?`)) return;
    const result = await drugStore.recommissionDrug(drug);
    if (result.success) {
        toastStore.addToast(`นำยา "${drug.trade_name}" กลับเข้าสู่บัญชีเรียบร้อยแล้ว`, "success");
        drugStore.fetchDrugs('decommissioned');
    } else {
        toastStore.addToast(`เกิดข้อผิดพลาด: ${result.message}`, "error");
    }
}
</script>

<template>
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-20">
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div class="flex items-start gap-4">
                <div
                    class="hidden md:flex w-12 h-12 bg-amber-50 rounded-2xl items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                    <History :size="24" />
                </div>
                <div>
                    <h2 class="text-2xl font-bold text-slate-900 tracking-tight">ประวัติการยกเลิกยา</h2>
                    <p class="text-slate-500 text-sm mt-1">รายการยาที่ถูกนำออกจากบัญชี</p>
                </div>
            </div>
        </div>

        <!-- Table -->
        <DrugTable :drugs="drugs" :loading="loading" :is-admin="isAdmin" :is-decommissioned-view="true"
            v-model:searchTerm="filters.searchTerm" :current-page="currentPage" :total-pages="totalPages"
            :total-count="totalCount" @recommission="handleRecommission"
            @change-page="(p) => drugStore.changePage(p, 'decommissioned')" />
    </div>
</template>
