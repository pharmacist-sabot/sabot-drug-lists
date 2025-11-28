<!-- src/components/LoginModal.vue -->
<script setup>
import { ref } from 'vue';
import { LogIn, AlertCircle } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';

// Props & Emits
defineProps({
    show: Boolean
});
const emit = defineEmits(['close']);

// Stores
const authStore = useAuthStore();
const toastStore = useToastStore();

// Local State
const email = ref("");
const password = ref("");
const errorMsg = ref("");
const isLoading = ref(false);

// Handlers
async function handleSubmit() {
    errorMsg.value = "";
    isLoading.value = true;

    try {
        await authStore.login(email.value, password.value);

        // Reset form
        email.value = "";
        password.value = "";

        toastStore.addToast("เข้าสู่ระบบสำเร็จ", "success");
        emit('close'); // แจ้ง Parent ให้ปิด Modal
    } catch (err) {
        errorMsg.value = err.message || "Email หรือรหัสผ่านไม่ถูกต้อง";
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <Transition name="modal">
        <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
            <div class="modal-dialog">
                <div class="modal-header">
                    <h2>ยินดีต้อนรับกลับ</h2>
                    <p class="modal-subtitle">เข้าสู่ระบบเพื่อจัดการระบบบัญชียา</p>
                </div>

                <form @submit.prevent="handleSubmit" class="modal-body">
                    <div class="form-group">
                        <label for="email">อีเมล</label>
                        <input id="email" v-model="email" type="email" class="form-control"
                            placeholder="your.email@example.com" required autocomplete="email" />
                    </div>

                    <div class="form-group">
                        <label for="password">รหัสผ่าน</label>
                        <input id="password" v-model="password" type="password" class="form-control"
                            placeholder="••••••••" required autocomplete="current-password" />
                    </div>

                    <div v-if="errorMsg" class="alert alert-error">
                        <AlertCircle :size="18" />
                        <span>{{ errorMsg }}</span>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-ghost" @click="$emit('close')" :disabled="isLoading">
                            ยกเลิก
                        </button>
                        <button type="submit" class="btn btn-primary" :disabled="isLoading">
                            <LogIn :size="18" />
                            {{ isLoading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
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

/* Transitions */
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
