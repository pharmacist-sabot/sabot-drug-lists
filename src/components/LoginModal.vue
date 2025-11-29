<script setup>
import { ref } from 'vue';
import { LogIn, AlertCircle, X } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';

defineProps({ show: Boolean });
const emit = defineEmits(['close']);

const authStore = useAuthStore();
const toastStore = useToastStore();
const email = ref("");
const password = ref("");
const errorMsg = ref("");
const isLoading = ref(false);

async function handleSubmit() {
    errorMsg.value = "";
    isLoading.value = true;
    try {
        await authStore.login(email.value, password.value);
        email.value = "";
        password.value = "";
        toastStore.addToast("เข้าสู่ระบบสำเร็จ", "success");
        emit('close');
    } catch (err) {
        errorMsg.value = err.message || "Email หรือรหัสผ่านไม่ถูกต้อง";
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <Transition name="modal">
        <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" @click="$emit('close')">
            </div>

            <div
                class="modal-panel relative bg-white w-full max-w-md rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden transform border border-slate-100">
                <div class="absolute top-4 right-4">
                    <button @click="$emit('close')"
                        class="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X :size="20" />
                    </button>
                </div>

                <div class="p-8 pt-10 text-center">
                    <div
                        class="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600 shadow-sm">
                        <LogIn :size="32" />
                    </div>
                    <h2 class="text-2xl font-bold text-slate-900">ยินดีต้อนรับกลับ</h2>
                    <p class="text-slate-500 mt-2">เข้าสู่ระบบเพื่อจัดการบัญชียา</p>
                </div>

                <div class="px-8 pb-8">
                    <form @submit.prevent="handleSubmit" class="space-y-4">
                        <div class="space-y-1.5">
                            <label class="text-sm font-semibold text-slate-700">อีเมล</label>
                            <input v-model="email" type="email"
                                class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                placeholder="your@email.com" required />
                        </div>

                        <div class="space-y-1.5">
                            <label class="text-sm font-semibold text-slate-700">รหัสผ่าน</label>
                            <input v-model="password" type="password"
                                class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                placeholder="••••••••" required />
                        </div>

                        <div v-if="errorMsg"
                            class="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                            <AlertCircle :size="16" />
                            <span>{{ errorMsg }}</span>
                        </div>

                        <button type="submit"
                            class="w-full py-3 mt-2 bg-slate-900 text-white rounded-xl font-medium shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                            :disabled="isLoading">
                            {{ isLoading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ' }}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </Transition>
</template>
