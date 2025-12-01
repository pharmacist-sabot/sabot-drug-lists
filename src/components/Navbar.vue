<template>
  <header
    class="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 supports-[backdrop-filter]:bg-white/60 transition-all duration-300"
  >
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <!-- Brand -->
      <div class="flex items-center gap-3">
        <router-link to="/" class="flex items-center gap-3 group">
          <div
            class="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/40 transition-all"
          >
            <Pill :size="18" />
          </div>
          <div>
            <h1 class="font-bold text-slate-900 tracking-tight leading-none text-lg">DrugList</h1>
            <span class="text-[10px] text-slate-500 font-medium tracking-wider uppercase"
              >Sabot Hospital</span
            >
          </div>
        </router-link>
      </div>

      <!-- Desktop Nav -->
      <div class="hidden md:flex items-center gap-6">
        <nav class="flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl">
          <router-link to="/" custom v-slot="{ navigate, isActive }">
            <button
              @click="navigate"
              :class="[
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                isActive
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700',
              ]"
            >
              <FileSpreadsheet :size="16" />
              บัญชียา
            </button>
          </router-link>
          <router-link to="/decommissioned" custom v-slot="{ navigate, isActive }">
            <button
              @click="navigate"
              :class="[
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                isActive
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700',
              ]"
            >
              <ArchiveRestore :size="16" />
              ประวัติการยกเลิก
            </button>
          </router-link>
        </nav>

        <div class="h-6 w-px bg-slate-200"></div>

        <!-- User Profile / Login -->
        <div v-if="user" class="flex items-center gap-3">
          <div class="text-right hidden lg:block">
            <div class="text-xs font-semibold text-slate-900">
              {{ user.user_metadata?.full_name || user.email }}
            </div>
            <div class="text-[10px] text-slate-500 uppercase">
              {{ isAdmin ? 'Administrator' : 'Viewer' }}
            </div>
          </div>
          <img
            :src="user.user_metadata?.avatar_url || getAvatarUrl(user.email)"
            alt="User"
            class="w-8 h-8 rounded-full ring-2 ring-white shadow-sm cursor-pointer hover:ring-blue-100 transition-all"
            @click="$emit('logout')"
            title="คลิกเพื่อออกจากระบบ"
          />
        </div>
        <button
          v-else
          @click="$emit('login')"
          class="bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 px-5 py-2 rounded-xl text-sm font-medium transition-all"
        >
          เข้าสู่ระบบ
        </button>
      </div>

      <!-- Mobile Menu Toggle -->
      <button
        class="md:hidden text-slate-500 hover:text-slate-900 p-2"
        @click="$emit('toggle-mobile-menu')"
      >
        <Menu v-if="!mobileMenuOpen" />
        <X v-else />
      </button>
    </div>

    <!-- Mobile Menu Overlay -->
    <div
      v-if="mobileMenuOpen"
      class="md:hidden border-t border-slate-100 bg-white absolute w-full left-0 shadow-xl"
    >
      <div class="px-4 py-4 space-y-2">
        <router-link to="/" class="block" @click="$emit('toggle-mobile-menu')">
          <div
            class="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 hover:bg-slate-50 transition-colors"
            :class="
              $route.path === '/' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600'
            "
          >
            <FileSpreadsheet :size="18" /> บัญชียา
          </div>
        </router-link>
        <router-link to="/decommissioned" class="block" @click="$emit('toggle-mobile-menu')">
          <div
            class="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 hover:bg-slate-50 transition-colors"
            :class="
              $route.path === '/decommissioned'
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-slate-600'
            "
          >
            <ArchiveRestore :size="18" /> ประวัติการยกเลิก
          </div>
        </router-link>

        <div class="border-t border-slate-100 my-2 pt-2">
          <div v-if="user" class="px-4 py-3">
            <div class="flex items-center gap-3 mb-3">
              <img
                :src="user.user_metadata?.avatar_url || getAvatarUrl(user.email)"
                class="w-10 h-10 rounded-full"
              />
              <div>
                <div class="font-semibold text-slate-900">
                  {{ user.user_metadata?.full_name || user.email }}
                </div>
                <div class="text-xs text-slate-500">{{ isAdmin ? 'Administrator' : 'Viewer' }}</div>
              </div>
            </div>
            <button
              @click="$emit('logout')"
              class="w-full bg-slate-100 text-slate-700 py-2 rounded-lg text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              ออกจากระบบ
            </button>
          </div>
          <div v-else class="px-4 pb-2">
            <button
              @click="
                $emit('login');
                $emit('toggle-mobile-menu');
              "
              class="w-full bg-slate-900 text-white py-2.5 rounded-xl font-medium shadow-lg shadow-slate-900/20"
            >
              เข้าสู่ระบบ
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
  import { watch, onUnmounted } from 'vue';
  import { Pill, ArchiveRestore, Menu, X, FileSpreadsheet } from 'lucide-vue-next';
  import { useRoute } from 'vue-router';

  const props = defineProps({
    user: Object,
    mobileMenuOpen: Boolean,
    isAdmin: Boolean,
  });

  defineEmits(['login', 'logout', 'toggle-mobile-menu']);
  const route = useRoute();

  const getAvatarUrl = (email) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=0f172a&color=fff&bold=true`;
  };

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
