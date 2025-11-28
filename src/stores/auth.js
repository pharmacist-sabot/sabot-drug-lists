import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../supabaseClient'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAdmin = ref(false)
  const loading = ref(true)

  async function checkAdminRole(userId) {
    if (!userId) {
      isAdmin.value = false
      return
    }
    try {
      const { data, error } = await supabase
        .from('profiles_drugcupsabot')
        .select('role')
        .eq('id', userId)
        .single()

      if (error) throw error
      isAdmin.value = data?.role === 'admin'
    } catch (error) {
      console.error('Error fetching admin role:', error)
      isAdmin.value = false
    }
  }

  async function initializeAuth() {
    loading.value = true
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      user.value = session.user
      await checkAdminRole(session.user.id)
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        user.value = session.user
        if (!isAdmin.value) await checkAdminRole(session.user.id)
      } else {
        user.value = null
        isAdmin.value = false
      }
      loading.value = false
    })
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
    isAdmin.value = false
  }

  return {
    user,
    isAdmin,
    loading,
    initializeAuth,
    login,
    logout
  }
})
