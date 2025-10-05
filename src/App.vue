<!-- src/App.vue -->
<script setup>
import { ref, onMounted, provide } from 'vue'
import { supabase } from './supabaseClient'
import Navbar from './components/Navbar.vue'
import Toast from './components/Toast.vue'

const showLoginModal = ref(false)
const loginEmail = ref('')
const loginPassword = ref('')
const loginError = ref('')
const user = ref(null)
const isAdmin = ref(false) // เพิ่ม state ใหม่
const mobileMenuOpen = ref(false)
const toasts = ref([])

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    user.value = session.user
    await checkAdminRole(session.user.id)
  }

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (session) {
      user.value = session.user
      await checkAdminRole(session.user.id)
    } else {
      user.value = null
      isAdmin.value = false
    }
  })
})

async function checkAdminRole(userId) {
  const { data, error } = await supabase
    .from('profiles_drugcupsabot') // ตรวจสอบว่าตารางนี้มีคอลัมน์ `role` จริง
    .select('role')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    isAdmin.value = false
  } else {
    isAdmin.value = data?.role === 'admin'
  }
}

async function handleLogin() {
  loginError.value = ''
  const { data, error } = await supabase.auth.signInWithPassword({
    email: loginEmail.value,
    password: loginPassword.value,
  })

  if (error) {
    loginError.value = error.message
  } else {
    user.value = data.user
    await checkAdminRole(data.user.id)
    showLoginModal.value = false
    loginEmail.value = ''
    loginPassword.value = ''
  }
}

async function handleLogout() {
  const { error } = await supabase.auth.signOut()
  if (error) addToast(`Logout Error: ${error.message}`, 'error')
}

function addToast(message, type = 'info') {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3000)
}

provide('addToast', addToast)
provide('user', user)
provide('isAdmin', isAdmin) // ให้ component อื่นใช้ตรวจสอบ
provide('handleLogin', handleLogin)
provide('handleLogout', handleLogout)

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}
</script>

<template>
  <Navbar 
    :user="user"
    :isAdmin="isAdmin"
    :mobileMenuOpen="mobileMenuOpen"
    @login="showLoginModal = true"
    @logout="handleLogout"
    @toggle-mobile-menu="toggleMobileMenu"
  />
  <main :class="{ 'main-shift': mobileMenuOpen }">
    <button class="mobile-menu-btn" @click="toggleMobileMenu" v-if="!mobileMenuOpen">☰</button>
    <router-view />
  </main>
  <div class="toast-container">
    <Toast v-for="toast in toasts" :key="toast.id" :message="toast.message" :type="toast.type" />
  </div>

  <!-- Modal ล็อกอิน -->
  <div v-if="showLoginModal" class="modal-overlay" @click.self="showLoginModal = false">
    <div class="modal-content card" :class="{ 'modal-animate': showLoginModal }">
      <h2>เข้าสู่ระบบ</h2>
      <form @submit.prevent="handleLogin" class="modal-form">
        <div class="form-group">
          <label for="email">อีเมล</label>
          <input id="email" v-model="loginEmail" type="email" class="form-control" required />
        </div>
        <div class="form-group">
          <label for="password">รหัสผ่าน</label>
          <input id="password" v-model="loginPassword" type="password" class="form-control" required />
        </div>
        <div v-if="loginError" class="message" style="color: red;">{{ loginError }}</div>
        <div class="modal-actions">
          <button type="submit" class="btn btn-primary">เข้าสู่ระบบ</button>
          <button type="button" class="btn" @click="showLoginModal = false">ยกเลิก</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.mobile-menu-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--c-text-primary);
  display: none;
  position: absolute;
  top: 2rem;
  left: 1rem; 
  z-index: 998;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  width: 90%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  transform: scale(0.95);
  opacity: 0;
  transition: var(--transition);
}
.modal-animate {
  transform: scale(1);
  opacity: 1;
}
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
.message {
  margin-top: 1rem;
  font-weight: 500;
  text-align: center;
}
@media (max-width: 768px) {
  .mobile-menu-btn {
    display: block;
  }
  .main-shift {
    margin-left: 0;
    opacity: 0.5;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }
  .modal-content {
    width: 95%;
  }
}
</style>