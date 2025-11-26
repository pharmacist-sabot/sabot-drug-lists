<!-- src/App.vue -->
<script setup>
import { ref, onMounted, provide } from "vue";
import { useAuth } from "./composables/useAuth";
import Navbar from "./components/Navbar.vue";
import Toast from "./components/Toast.vue";

// -- Auth Logic moved to Composable --
const { user, isAdmin, initializeAuth, login, logout } = useAuth();

// -- UI State --
const showLoginModal = ref(false);
const loginEmail = ref("");
const loginPassword = ref("");
const loginError = ref("");
const mobileMenuOpen = ref(false);
const toasts = ref([]);

// Initialize Auth
onMounted(() => {
    initializeAuth();
});

// -- Helper Functions --
function addToast(message, type = "info") {
    const id = Date.now();
    toasts.value.push({ id, message, type });
    setTimeout(() => {
        toasts.value = toasts.value.filter((t) => t.id !== id);
    }, 3000);
}

async function onLoginSubmit() {
    loginError.value = "";
    try {
        await login(loginEmail.value, loginPassword.value);
        showLoginModal.value = false;
        loginEmail.value = "";
        loginPassword.value = "";
        addToast("เข้าสู่ระบบสำเร็จ", "success");
    } catch (error) {
        loginError.value = error.message;
    }
}

async function onLogoutClick() {
    try {
        await logout();
        addToast("ออกจากระบบแล้ว", "info");
    } catch (error) {
        addToast(`Logout Error: ${error.message}`, "error");
    }
}

// Provide dependencies to children (Legacy support for current components)
provide("addToast", addToast);
provide("user", user);
provide("isAdmin", isAdmin);
provide("handleLogin", onLoginSubmit); // Note: Renamed internal function
provide("handleLogout", onLogoutClick);

function toggleMobileMenu() {
    mobileMenuOpen.value = !mobileMenuOpen.value;
}
</script>

<template>
    <div class="app">
        <Navbar
            :user="user"
            :isAdmin="isAdmin"
            :mobileMenuOpen="mobileMenuOpen"
            @login="showLoginModal = true"
            @logout="onLogoutClick"
            @toggle-mobile-menu="toggleMobileMenu"
        />

        <main>
            <router-view />
        </main>

        <div class="toast-container">
            <Toast
                v-for="toast in toasts"
                :key="toast.id"
                :message="toast.message"
                :type="toast.type"
            />
        </div>

        <!-- Login Modal -->
        <Transition name="modal">
            <div
                v-if="showLoginModal"
                class="modal-overlay"
                @click.self="showLoginModal = false"
            >
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h2>ยินดีต้อนรับกลับ</h2>
                        <p class="modal-subtitle">
                            เข้าสู่ระบบเพื่อจัดการระบบบัญชียา
                        </p>
                    </div>

                    <form @submit.prevent="onLoginSubmit" class="modal-body">
                        <div class="form-group">
                            <label for="email">อีเมล</label>
                            <input
                                id="email"
                                v-model="loginEmail"
                                type="email"
                                class="form-control"
                                placeholder="your.email@example.com"
                                required
                                autocomplete="email"
                            />
                        </div>

                        <div class="form-group">
                            <label for="password">รหัสผ่าน</label>
                            <input
                                id="password"
                                v-model="loginPassword"
                                type="password"
                                class="form-control"
                                placeholder="••••••••"
                                required
                                autocomplete="current-password"
                            />
                        </div>

                        <div v-if="loginError" class="alert alert-error">
                            <!-- SVG Icon -->
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <span>{{ loginError }}</span>
                        </div>

                        <div class="modal-footer">
                            <button
                                type="button"
                                class="btn btn-ghost"
                                @click="showLoginModal = false"
                            >
                                ยกเลิก
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <!-- SVG Icon -->
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <path
                                        d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"
                                    ></path>
                                    <polyline
                                        points="10 17 15 12 10 7"
                                    ></polyline>
                                    <line x1="15" y1="12" x2="3" y2="12"></line>
                                </svg>
                                เข้าสู่ระบบ
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
/* Keeping existing styles */
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
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(15, 23, 42, 0.75);
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 1rem;
}
.modal-dialog {
    background-color: var(--c-surface);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-xl);
    max-width: 440px;
    width: 100%;
    border: 1px solid rgba(255, 255, 255, 0.1);
}
.modal-header {
    padding: 2rem 2rem 1rem;
    text-align: center;
    border-bottom: 1px solid var(--c-border);
}
.modal-header h2 {
    font-size: 1.75rem;
    color: var(--c-text-primary);
    margin-bottom: 0.5rem;
}
.modal-subtitle {
    color: var(--c-text-secondary);
    font-size: 0.875rem;
}
.modal-body {
    padding: 2rem;
}
.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--c-border);
    margin-top: 1.5rem;
}
.alert {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    margin-bottom: 1rem;
}
.alert-error {
    background-color: var(--c-danger-light);
    color: var(--c-danger);
    border: 1px solid var(--c-danger);
}
.alert svg {
    flex-shrink: 0;
}
/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}
.modal-enter-active .modal-dialog,
.modal-leave-active .modal-dialog {
    transition: transform 0.2s ease;
}
.modal-enter-from .modal-dialog,
.modal-leave-to .modal-dialog {
    transform: scale(0.95);
}
@media (max-width: 768px) {
    .toast-container {
        bottom: 1rem;
        right: 1rem;
        left: 1rem;
        max-width: none;
    }
    .modal-dialog {
        max-width: 100%;
    }
    .modal-header,
    .modal-body {
        padding: 1.5rem;
    }
    .modal-header h2 {
        font-size: 1.5rem;
    }
}
</style>
