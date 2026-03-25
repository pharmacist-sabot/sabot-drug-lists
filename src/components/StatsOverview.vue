<script setup lang="ts">
import type { ActivityStats } from '../types';
import { ArrowUpRight, Pill, TrendingDown, TrendingUp } from 'lucide-vue-next';
import { computed, onMounted, ref } from 'vue';
import { drugService } from '../services/drug-service';

// --- State ---
const stats = ref<ActivityStats | null>(null);
const isLoading = ref(true);

// --- Computed ---
const formattedMonth = computed<string>(() => {
  const now = new Date();
  const monthStr = now.toLocaleDateString('th-TH', { month: 'short', year: 'numeric' });
  return `เดือนนี้ (${monthStr})`;
});

// --- Methods ---
async function loadStats(): Promise<void> {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const from = startOfMonth.toISOString();
    const to = now.toISOString();
    stats.value = await drugService.getActivityStats(from, to);
  }
  catch (error) {
    console.error('StatsOverview Error [loadStats]:', error);
  }
  finally {
    isLoading.value = false;
  }
}

function refresh(): void {
  isLoading.value = true;
  loadStats();
}

defineExpose({ refresh });

// --- Lifecycle ---
onMounted(() => {
  loadStats();
});
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
    <!-- ── Card 1: Total Active ── -->
    <div
      class="relative overflow-hidden bg-linear-to-br from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-100 shadow-sm p-5"
    >
      <!-- Loading Skeleton -->
      <div v-if="isLoading" class="animate-pulse">
        <div class="flex items-start justify-between mb-4">
          <div class="w-10 h-10 bg-blue-200/60 rounded-xl" />
          <div class="w-10 h-5 bg-blue-100/80 rounded-full" />
        </div>
        <div class="h-9 bg-blue-200/50 rounded-xl w-20 mb-2" />
        <div class="h-4 bg-blue-100/70 rounded-lg w-32 mb-1.5" />
        <div class="h-3 bg-blue-100/50 rounded-lg w-40" />
      </div>

      <template v-else>
        <div class="flex items-start justify-between mb-3">
          <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
            <Pill :size="20" />
          </div>
          <span class="text-xs font-semibold text-blue-500 bg-blue-100/80 px-2.5 py-0.5 rounded-full">
            Live
          </span>
        </div>
        <div class="text-3xl font-bold text-blue-700 tracking-tight mb-1">
          {{ stats?.total_active ?? '--' }}
        </div>
        <div class="text-sm font-semibold text-blue-600">
          รายการยาทั้งหมด
        </div>
        <div class="text-xs text-blue-400 mt-0.5">
          ยาที่ใช้งานอยู่ในปัจจุบัน
        </div>
      </template>

      <!-- Decorative circle -->
      <div class="absolute -bottom-4 -right-4 w-20 h-20 bg-blue-100/40 rounded-full pointer-events-none" />
    </div>

    <!-- ── Card 2: Added This Month ── -->
    <div
      class="relative overflow-hidden bg-linear-to-br from-emerald-50 to-teal-50/50 rounded-2xl border border-emerald-100 shadow-sm p-5"
    >
      <!-- Loading Skeleton -->
      <div v-if="isLoading" class="animate-pulse">
        <div class="flex items-start justify-between mb-4">
          <div class="w-10 h-10 bg-emerald-200/60 rounded-xl" />
        </div>
        <div class="h-9 bg-emerald-200/50 rounded-xl w-16 mb-2" />
        <div class="h-4 bg-emerald-100/70 rounded-lg w-28 mb-1.5" />
        <div class="h-3 bg-emerald-100/50 rounded-lg w-36 mb-3" />
        <div class="h-4 bg-emerald-100/60 rounded-lg w-24" />
      </div>

      <template v-else>
        <div class="flex items-start justify-between mb-3">
          <div
            class="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm"
          >
            <TrendingUp :size="20" />
          </div>
        </div>
        <div class="text-3xl font-bold text-emerald-700 tracking-tight mb-1">
          {{ stats ? `+${stats.added_count}` : '--' }}
        </div>
        <div class="text-sm font-semibold text-emerald-600">
          เพิ่มเข้าเดือนนี้
        </div>
        <div class="text-xs text-emerald-400 mt-0.5 mb-3">
          {{ formattedMonth }}
        </div>
        <router-link
          to="/activity"
          class="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-semibold transition-colors group"
        >
          ดูรายละเอียด
          <ArrowUpRight
            :size="13"
            class="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
          />
        </router-link>
      </template>

      <!-- Decorative circle -->
      <div class="absolute -bottom-4 -right-4 w-20 h-20 bg-emerald-100/40 rounded-full pointer-events-none" />
    </div>

    <!-- ── Card 3: Removed This Month ── -->
    <div
      class="relative overflow-hidden bg-linear-to-br from-amber-50 to-orange-50/50 rounded-2xl border border-amber-100 shadow-sm p-5"
    >
      <!-- Loading Skeleton -->
      <div v-if="isLoading" class="animate-pulse">
        <div class="flex items-start justify-between mb-4">
          <div class="w-10 h-10 bg-amber-200/60 rounded-xl" />
        </div>
        <div class="h-9 bg-amber-200/50 rounded-xl w-16 mb-2" />
        <div class="h-4 bg-amber-100/70 rounded-lg w-28 mb-1.5" />
        <div class="h-3 bg-amber-100/50 rounded-lg w-36 mb-3" />
        <div class="h-4 bg-amber-100/60 rounded-lg w-24" />
      </div>

      <template v-else>
        <div class="flex items-start justify-between mb-3">
          <div
            class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shadow-sm"
          >
            <TrendingDown :size="20" />
          </div>
        </div>
        <div class="text-3xl font-bold text-amber-700 tracking-tight mb-1">
          {{ stats ? `-${stats.removed_count}` : '--' }}
        </div>
        <div class="text-sm font-semibold text-amber-600">
          นำออกเดือนนี้
        </div>
        <div class="text-xs text-amber-400 mt-0.5 mb-3">
          {{ formattedMonth }}
        </div>
        <router-link
          to="/activity"
          class="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-semibold transition-colors group"
        >
          ดูรายละเอียด
          <ArrowUpRight
            :size="13"
            class="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
          />
        </router-link>
      </template>

      <!-- Decorative circle -->
      <div class="absolute -bottom-4 -right-4 w-20 h-20 bg-amber-100/40 rounded-full pointer-events-none" />
    </div>
  </div>
</template>
