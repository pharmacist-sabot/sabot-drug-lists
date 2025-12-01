<template>
  <div class="flex flex-col gap-6">
    <!-- Controls & Filters -->
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="relative flex-1">
        <SearchBar
          :model-value="searchTerm"
          @update:model-value="$emit('update:searchTerm', $event)"
        />
      </div>
      <div class="sm:w-48" v-if="!isDecommissionedView">
        <select
          :value="filterCategory"
          @change="$emit('update:filterCategory', $event.target.value)"
          class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm appearance-none cursor-pointer"
        >
          <option value="all">ทุกหมวดหมู่</option>
          <option v-for="cat in availableCategories" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
      </div>
    </div>

    <!-- Card List View -->
    <div
      class="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden min-h-[400px] flex flex-col"
    >
      <!-- Loading -->
      <div
        v-if="loading"
        class="flex-1 flex flex-col items-center justify-center p-12 text-slate-400"
      >
        <Loader2 class="animate-spin mb-3 text-blue-500" :size="32" />
        <p>กำลังโหลดข้อมูล...</p>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="drugs.length === 0"
        class="flex-1 flex flex-col items-center justify-center p-20 text-slate-400"
      >
        <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <SearchX :size="32" class="opacity-50" />
        </div>
        <p class="text-lg font-medium text-slate-600">ไม่พบข้อมูลยา</p>
        <p class="text-sm">ลองปรับคำค้นหาหรือตัวกรองใหม่อีกครั้ง</p>
      </div>

      <!-- List Data -->
      <div v-else class="divide-y divide-slate-100">
        <div
          v-for="drug in drugs"
          :key="drug.id"
          class="group flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-4 sm:gap-0"
        >
          <!-- Drug Info Left -->
          <div class="flex items-start gap-4">
            <div
              :class="[
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-1',
                drug.is_active ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500',
              ]"
            >
              <Pill :size="20" />
            </div>
            <div>
              <div class="flex items-center flex-wrap gap-2 mb-1">
                <span class="font-semibold text-slate-900 text-base">{{ drug.trade_name }}</span>
                <span
                  class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100"
                >
                  บัญชี {{ drug.account }}
                </span>
                <span
                  v-if="!drug.is_active"
                  class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-100"
                >
                  Decommissioned
                </span>
              </div>
              <div class="text-sm text-slate-500 flex flex-wrap gap-x-3 gap-y-1 items-center">
                <span
                  class="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 border border-slate-200"
                >
                  {{ drug.drug_code }}
                </span>
                <span>{{ drug.generic_name }}</span>
                <span class="text-slate-300 hidden sm:inline">•</span>
                <span>{{ drug.category }}</span>
              </div>
              <!-- Remarks Display -->
              <div
                v-if="isDecommissionedView && drug.remarks"
                class="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg inline-block border border-red-100"
              >
                <span class="font-semibold">เหตุผล:</span> {{ drug.remarks }}
                <div class="text-xs text-red-400 mt-1">
                  {{ formatDate(drug.decommissioned_at) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Actions Right -->
          <div class="flex items-center gap-6 sm:justify-end pl-14 sm:pl-0">
            <div class="text-right hidden sm:block min-w-[80px]">
              <div class="text-sm font-semibold text-slate-900">
                ฿{{ (drug.price_opd || 0).toFixed(2) }}
              </div>
              <div class="text-xs text-slate-400">ราคา OPD</div>
            </div>

            <!-- Admin Actions -->
            <div v-if="isAdmin" class="flex items-center gap-2 transition-opacity">
              <template v-if="!isDecommissionedView">
                <button
                  @click="$emit('edit', drug)"
                  class="inline-flex items-center justify-center px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 text-sm font-medium transition-all"
                >
                  แก้ไข
                </button>
                <button
                  @click="$emit('trigger-decommission', drug)"
                  class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="นำออกจากบัญชี"
                >
                  <Archive :size="18" />
                </button>
              </template>
              <template v-else>
                <button
                  @click="$emit('recommission', drug)"
                  class="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 text-sm font-medium transition-all"
                >
                  <RotateCcw :size="16" />
                  นำกลับเข้าบัญชี
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="!loading && totalPages > 1"
      class="flex items-center justify-between text-sm text-slate-500"
    >
      <p>หน้า {{ currentPage }} จาก {{ totalPages }} (รวม {{ totalCount }} รายการ)</p>
      <div class="flex gap-2">
        <button
          @click="$emit('change-page', currentPage - 1)"
          :disabled="currentPage === 1"
          class="p-2 border border-slate-200 rounded-lg hover:bg-white bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft :size="16" />
        </button>
        <button
          @click="$emit('change-page', currentPage + 1)"
          :disabled="currentPage >= totalPages"
          class="p-2 border border-slate-200 rounded-lg hover:bg-white bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import SearchBar from './SearchBar.vue';
  import {
    Archive,
    RotateCcw,
    Loader2,
    SearchX,
    ChevronLeft,
    ChevronRight,
    Pill,
  } from 'lucide-vue-next';

  const props = defineProps({
    drugs: Array,
    loading: Boolean,
    isAdmin: Boolean,
    isDecommissionedView: { type: Boolean, default: false },
    searchTerm: String,
    filterCategory: String,
    availableCategories: Array,
    currentPage: Number,
    totalPages: Number,
    totalCount: Number,
  });

  const emit = defineEmits([
    'edit',
    'trigger-decommission',
    'recommission',
    'update:searchTerm',
    'update:filterCategory',
    'change-page',
  ]);

  function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
</script>
