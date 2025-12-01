<script setup>
  import { ref, onMounted } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from './stores/auth';
  import { useToastStore } from './stores/toast';

  // Components
  import Navbar from './components/Navbar.vue';
  import Toast from './components/Toast.vue';
  import LoginModal from './components/LoginModal.vue';

  // -- Stores --
  const authStore = useAuthStore();
  const toastStore = useToastStore();
  const { user, isAdmin } = storeToRefs(authStore);
  const { toasts } = storeToRefs(toastStore);

  // -- UI State --
  const showLoginModal = ref(false);
  const mobileMenuOpen = ref(false);

  // Initialize Auth
  onMounted(() => {
    authStore.initializeAuth();
  });

  // -- Global Layout Handlers --
  async function onLogoutClick() {
    try {
      await authStore.logout();
      toastStore.addToast('ออกจากระบบแล้ว', 'info');
    } catch (error) {
      toastStore.addToast(`Logout Error: ${error.message}`, 'error');
    }
  }

  function toggleMobileMenu() {
    mobileMenuOpen.value = !mobileMenuOpen.value;
  }
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[#FDFDFD] font-sans text-slate-900">
    <Navbar
      :user="user"
      :isAdmin="isAdmin"
      :mobileMenuOpen="mobileMenuOpen"
      @login="showLoginModal = true"
      @logout="onLogoutClick"
      @toggle-mobile-menu="toggleMobileMenu"
    />

    <main class="flex-grow w-full">
      <router-view />
    </main>

    <!-- Global Toast Container -->
    <div
      class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none p-4 sm:p-0"
    >
      <TransitionGroup name="toast-slide">
        <Toast
          v-for="toast in toasts"
          :key="toast.id"
          :message="toast.message"
          :type="toast.type"
          class="pointer-events-auto"
        />
      </TransitionGroup>
    </div>

    <!-- Login Modal -->
    <LoginModal :show="showLoginModal" @close="showLoginModal = false" />
  </div>
</template>

<style>
  /* Global Animation for Toasts */
  .toast-slide-enter-active,
  .toast-slide-leave-active {
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .toast-slide-enter-from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }

  .toast-slide-leave-to {
    opacity: 0;
    transform: translateX(100%);
  }
</style>
