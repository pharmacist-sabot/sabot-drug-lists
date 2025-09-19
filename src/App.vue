<!-- src/App.vue -->
<script setup>
import { ref, onMounted, provide } from 'vue'
import { supabase } from './supabaseClient'
import Navbar from './components/Navbar.vue'
import Toast from './components/Toast.vue'

const user = ref(null)
const mobileMenuOpen = ref(false)
const toasts = ref([])

onMounted(() => {
  supabase.auth.onAuthStateChange((_, session) => {
    user.value = session?.user ?? null
  })
})

async function handleLogin() {
  const { error } = await supabase.auth.signInWithOAuth({ 
    provider: 'github',
    options: { redirectTo: window.location.origin }
  })
  if (error) addToast(`Login Error: ${error.message}`, 'error')
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

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

provide('user', user)
provide('handleLogin', handleLogin)
provide('handleLogout', handleLogout)

</script>

<template>
  <Navbar 
    :user="user"
    :mobileMenuOpen="mobileMenuOpen"
    @login="handleLogin"
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
}
</style>