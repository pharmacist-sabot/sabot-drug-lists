<script setup lang="ts">
import type { User } from '@supabase/supabase-js';
import { ArchiveRestore, ClipboardList, FileSpreadsheet, Menu, X } from 'lucide-vue-next';
import { onUnmounted, watch } from 'vue';

type Props = {
  user: User | null;
  mobileMenuOpen: boolean;
  isAdmin: boolean;
};

const props = defineProps<Props>();

defineEmits<{
  'login': [];
  'logout': [];
  'toggle-mobile-menu': [];
}>();

// FIX: user.email is `string | undefined` in the Supabase User type.
// Runtime guarantee: encodeURIComponent handles undefined safely via nullish coalescing.
function getAvatarUrl(email: string | undefined): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(email ?? '')}&background=0f172a&color=fff&bold=true`;
}

watch(
  () => props.mobileMenuOpen,
  (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
  },
);

onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>

<template>
  <header
    class="sticky top-0 z-40 bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all duration-300"
  >
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
      <!-- Brand -->
      <div class="flex items-center gap-3">
        <router-link to="/" class="flex items-center gap-3.5 group">
          <img
            src="/pwa-192x192.png"
            alt="DrugList Logo"
            class="w-12 h-12 rounded-xl shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 group-hover:-translate-y-0.5 transition-all duration-300 object-contain bg-white"
          />
          <div class="flex flex-col">
            <h1 class="font-extrabold text-slate-900 tracking-tight leading-none text-xl group-hover:text-blue-600 transition-colors">
              DrugList
            </h1>
            <span class="text-[10px] text-blue-500 font-bold tracking-widest uppercase mt-0.5">Sabot Hospital</span>
          </div>
        </router-link>
      </div>

      <!-- Desktop Nav -->
      <div class="hidden md:flex items-center gap-8">
        <nav class="flex items-center gap-1.5 bg-slate-50/80 p-1.5 rounded-2xl border border-slate-200/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
          <router-link v-slot="{ navigate, isActive }" to="/" custom>
            <button
              class="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2.5"
              :class="[
                isActive
                  ? 'bg-white text-blue-600 shadow-[0_2px_10px_rgba(0,0,0,0.04)] ring-1 ring-slate-200/60'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/60',
              ]" @click="navigate"
            >
              <FileSpreadsheet :size="18" :class="isActive ? 'text-blue-500' : 'text-slate-400'" />
              บัญชียา
            </button>
          </router-link>
          <router-link v-slot="{ navigate, isActive }" to="/decommissioned" custom>
            <button
              class="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2.5"
              :class="[
                isActive
                  ? 'bg-white text-blue-600 shadow-[0_2px_10px_rgba(0,0,0,0.04)] ring-1 ring-slate-200/60'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/60',
              ]" @click="navigate"
            >
              <ArchiveRestore :size="18" :class="isActive ? 'text-blue-500' : 'text-slate-400'" />
              ประวัติการยกเลิก
            </button>
          </router-link>
          <router-link v-slot="{ navigate, isActive }" to="/activity" custom>
            <button
              class="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2.5"
              :class="[
                isActive
                  ? 'bg-white text-blue-600 shadow-[0_2px_10px_rgba(0,0,0,0.04)] ring-1 ring-slate-200/60'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/60',
              ]" @click="navigate"
            >
              <ClipboardList :size="18" :class="isActive ? 'text-blue-500' : 'text-slate-400'" />
              บันทึกการเปลี่ยนแปลง
            </button>
          </router-link>
        </nav>

        <div class="h-8 w-px bg-slate-200/80" />

        <!-- User Profile / Login -->
        <div v-if="user" class="flex items-center gap-4">
          <div class="text-right hidden lg:block">
            <div class="text-sm font-bold text-slate-900">
              {{ user.user_metadata?.full_name || user.email?.split('@')[0] || user.email }}
            </div>
            <div class="text-[10px] text-blue-500 font-bold uppercase tracking-wider mt-0.5">
              {{ isAdmin ? 'Administrator' : 'Viewer' }}
            </div>
          </div>
          <div class="relative group cursor-pointer" title="คลิกเพื่อออกจากระบบ" @click="$emit('logout')">
            <div class="absolute inset-0 bg-blue-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
            <img
              :src="user.user_metadata?.avatar_url || getAvatarUrl(user.email)" alt="User"
              class="relative w-11 h-11 rounded-full ring-2 ring-white ring-offset-2 ring-offset-slate-50 hover:ring-blue-400 shadow-md transition-all duration-300"
            >
          </div>
        </div>
        <button
          v-else
          class="bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:from-slate-800 hover:to-slate-700 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5"
          @click="$emit('login')"
        >
          เข้าสู่ระบบ
        </button>
      </div>

      <!-- Mobile Menu Toggle -->
      <button class="md:hidden text-slate-500 hover:text-slate-900 p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors" @click="$emit('toggle-mobile-menu')">
        <Menu v-if="!mobileMenuOpen" />
        <X v-else />
      </button>
    </div>

    <!-- Mobile Menu Overlay -->
    <div v-show="mobileMenuOpen" class="md:hidden border-t border-slate-100/80 bg-white/95 backdrop-blur-3xl absolute w-full left-0 shadow-2xl transition-all duration-300 origin-top">
      <div class="px-5 py-6 space-y-3">
        <router-link to="/" class="block" @click="$emit('toggle-mobile-menu')">
          <div
            class="w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 hover:bg-slate-50 transition-all font-semibold"
            :class="$route.path === '/' ? 'bg-blue-50/80 text-blue-600 shadow-sm ring-1 ring-blue-100/50' : 'text-slate-600'"
          >
            <div class="p-2.5 rounded-xl" :class="$route.path === '/' ? 'bg-white text-blue-600 shadow-sm' : 'bg-slate-100 text-slate-500'">
              <FileSpreadsheet :size="20" />
            </div>
            บัญชียา
          </div>
        </router-link>
        <router-link to="/decommissioned" class="block" @click="$emit('toggle-mobile-menu')">
          <div
            class="w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 hover:bg-slate-50 transition-all font-semibold"
            :class="$route.path === '/decommissioned'
              ? 'bg-blue-50/80 text-blue-600 shadow-sm ring-1 ring-blue-100/50'
              : 'text-slate-600'
            "
          >
            <div class="p-2.5 rounded-xl" :class="$route.path === '/decommissioned' ? 'bg-white text-blue-600 shadow-sm' : 'bg-slate-100 text-slate-500'">
              <ArchiveRestore :size="20" />
            </div>
            ประวัติการยกเลิก
          </div>
        </router-link>
        <router-link to="/activity" class="block" @click="$emit('toggle-mobile-menu')">
          <div
            class="w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 hover:bg-slate-50 transition-all font-semibold"
            :class="$route.path === '/activity'
              ? 'bg-blue-50/80 text-blue-600 shadow-sm ring-1 ring-blue-100/50'
              : 'text-slate-600'
            "
          >
            <div class="p-2.5 rounded-xl" :class="$route.path === '/activity' ? 'bg-white text-blue-600 shadow-sm' : 'bg-slate-100 text-slate-500'">
              <ClipboardList :size="20" />
            </div>
            บันทึกการเปลี่ยนแปลง
          </div>
        </router-link>

        <div class="border-t border-slate-200/60 my-4 pt-4">
          <div v-if="user" class="px-5 py-3">
            <div class="flex items-center gap-4 mb-5">
              <img
                :src="user.user_metadata?.avatar_url || getAvatarUrl(user.email)"
                class="w-12 h-12 rounded-full ring-2 ring-blue-100"
              >
              <div>
                <div class="font-bold text-slate-900 text-lg">
                  {{ user.user_metadata?.full_name || user.email?.split('@')[0] || user.email }}
                </div>
                <div class="text-xs font-bold text-blue-500 uppercase tracking-widest mt-0.5">
                  {{ isAdmin ? 'Administrator' : 'Viewer' }}
                </div>
              </div>
            </div>
            <button
              class="w-full bg-slate-100 text-slate-700 py-3 rounded-xl text-sm font-bold hover:bg-red-50 hover:text-red-600 transition-colors"
              @click="$emit('logout')"
            >
              ออกจากระบบ
            </button>
          </div>
          <div v-else class="px-5 pb-2">
            <button
              class="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white py-3 rounded-xl font-bold shadow-lg shadow-slate-900/20"
              @click="
                $emit('login');
                $emit('toggle-mobile-menu');
              "
            >
              เข้าสู่ระบบ
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
