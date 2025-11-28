<!-- src/App.vue -->
<script setup>
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "./stores/auth";
import { useToastStore } from "./stores/toast";

// Components
import Navbar from "./components/Navbar.vue";
import Toast from "./components/Toast.vue";
import LoginModal from "./components/LoginModal.vue"; // Import Component ใหม่

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
        toastStore.addToast("ออกจากระบบแล้ว", "info");
        // Optional: Redirect to home or refresh state
    } catch (error) {
        toastStore.addToast(`Logout Error: ${error.message}`, "error");
    }
}

function toggleMobileMenu() {
    mobileMenuOpen.value = !mobileMenuOpen.value;
}
</script>

<template>
    <div class="app">
        <Navbar :user="user" :isAdmin="isAdmin" :mobileMenuOpen="mobileMenuOpen" @login="showLoginModal = true"
            @logout="onLogoutClick" @toggle-mobile-menu="toggleMobileMenu" />

        <main>
            <router-view />
        </main>

        <!-- Global Toast Container -->
        <div class="toast-container">
            <Toast v-for="toast in toasts" :key="toast.id" :message="toast.message" :type="toast.type" />
        </div>

        <!-- Login Modal abstracted away -->
        <LoginModal :show="showLoginModal" @close="showLoginModal = false" />
    </div>
</template>

<style scoped>
.app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.toast-container {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-width: 400px;
}

@media (max-width: 768px) {
    .toast-container {
        bottom: 1rem;
        right: 1rem;
        left: 1rem;
        max-width: none;
    }
}
</style>
